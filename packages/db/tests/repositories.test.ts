import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestDb } from '../src/testing'
import {
  acquireWorkflowLock, addCredits, completeWorkflowLock, createEpisode, deductCredits, getOwnedEpisode,
  ledgerFor, listEpisodes, recordLedger, recordPayment, upsertUserOnSignIn,
} from '../src/repositories'
import type { Database } from '../src/client'

let db: Database
let close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 120_000)
afterAll(() => close())

describe('users', () => {
  it('creates on first sign-in and keeps credits on later sign-ins', async () => {
    const a = await upsertUserOnSignIn(db, { email: 'priya@example.com', name: 'Priya' }, 10)
    expect(a.credits).toBe(10)
    await deductCredits(db, a.id, 4)
    const again = await upsertUserOnSignIn(db, { email: 'priya@example.com', name: 'Priya S' }, 10)
    expect(again.credits).toBe(6)
    expect(again.name).toBe('Priya S')
  })
  it('never lets credits go negative, even with concurrent deductions', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'race@example.com' }, 5)
    const results = await Promise.all(Array.from({ length: 4 }, () => deductCredits(db, u.id, 2)))
    expect(results.filter(r => r !== null)).toHaveLength(2)
    expect(await addCredits(db, u.id, 0)).toBe(1)
  })
  it('adds credits and switches plan', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'buyer@example.com' }, 0)
    expect(await addCredits(db, u.id, 200, 'pro')).toBe(200)
    expect(await addCredits(db, '00000000-0000-0000-0000-000000000000', 5)).toBeNull()
  })
})

describe('ledger + payments', () => {
  it('records ledger entries newest first', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'ledger@example.com' }, 0)
    await recordLedger(db, { userId: u.id, amount: -5, reason: 'generate_5min' })
    await recordLedger(db, { userId: u.id, amount: 5, reason: 'refund' })
    expect((await ledgerFor(db, u.id)).map(e => e.amount)).toEqual([5, -5])
  })
  it('records each provider payment once', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'pay@example.com' }, 0)
    const p = { userId: u.id, provider: 'razorpay', providerRef: 'order_1', productId: 'pro', amountMinor: 299900, currency: 'INR', credits: 200 }
    expect(await recordPayment(db, p)).toBe(true)
    expect(await recordPayment(db, p)).toBe(false)
  })
})

describe('episodes', () => {
  it('scopes reads to the owner and paginates', async () => {
    const owner = await upsertUserOnSignIn(db, { email: 'owner@example.com' }, 10)
    const other = await upsertUserOnSignIn(db, { email: 'other@example.com' }, 10)
    const ep = await createEpisode(db, { userId: owner.id, topic: 'ಮೈಸೂರು ಅರಮನೆ', shareId: 's1', language: 'kn' })
    expect(ep.isPublic).toBe(false)
    expect(ep.language).toBe('kn')
    expect(await getOwnedEpisode(db, ep.id, owner.id)).toBeDefined()
    expect(await getOwnedEpisode(db, ep.id, other.id)).toBeUndefined()
    await createEpisode(db, { userId: owner.id, topic: 'two', shareId: 's2' })
    const page = await listEpisodes(db, owner.id, 1, 1)
    expect(page.data).toHaveLength(1)
    expect(page.hasMore).toBe(true)
  })
})

describe('workflow locks', () => {
  it('acquires, blocks, takes over stale locks and returns completed results', async () => {
    const opts = { key: 'refine:e1:story:5min', episodeId: '00000000-0000-0000-0000-000000000001', step: 'refine', staleMs: 60_000 }
    expect(await acquireWorkflowLock(db, opts)).toEqual({ state: 'acquired' })
    expect(await acquireWorkflowLock(db, opts)).toEqual({ state: 'running' })
    expect(await acquireWorkflowLock(db, { ...opts, now: new Date(Date.now() + 120_000) })).toEqual({ state: 'acquired' })
    await completeWorkflowLock(db, opts.key, { audioUrl: 'https://x/a.mp3' })
    expect(await acquireWorkflowLock(db, opts)).toEqual({ state: 'complete', result: { audioUrl: 'https://x/a.mp3' } })
  })
})
