import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { randomBytes } from 'node:crypto'
import { auditLogs, findUserByEmail, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { audit, createApiKey, hasRole, onSignIn, openToken, publicUser, requireRole, revokeApiKey, sealToken, sessionClaims, verifyApiKey } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 30_000)
afterAll(() => close())

describe('accounts', () => {
  it('creates users with free credits and exposes claims', async () => {
    expect(await onSignIn(db, { email: null })).toBe(false)
    expect(await onSignIn(db, { email: 'new@x.in', name: 'New' })).toBe(true)
    expect(await sessionClaims(db, 'new@x.in')).toMatchObject({ credits: 10, plan: 'free', role: 'user' })
    expect(await sessionClaims(db, 'ghost@x.in')).toBeNull()
  })
  it('strips tokens from public views', async () => {
    const u = (await findUserByEmail(db, 'new@x.in'))!
    expect(Object.keys(publicUser({ ...u, youtubeAccessToken: 'secret' }))).not.toContain('youtubeAccessToken')
  })
})

describe('rbac', () => {
  it('orders roles', () => {
    expect(hasRole({ role: 'admin' }, 'moderator')).toBe(true)
    expect(hasRole({ role: 'support' }, 'admin')).toBe(false)
    expect(hasRole({ role: 'weird' }, 'user')).toBe(false)
    expect(() => requireRole(null, 'user')).toThrow('Sign in required')
    expect(() => requireRole({ role: 'user' }, 'admin')).toThrow('Not allowed')
  })
})

describe('api keys', () => {
  it('verifies, never stores the plain key, and honours revocation', async () => {
    await onSignIn(db, { email: 'dev@x.in' })
    const u = (await findUserByEmail(db, 'dev@x.in'))!
    const { key, prefix } = await createApiKey(db, u.id, 'ci')
    expect(await verifyApiKey(db, key)).toEqual({ userId: u.id })
    expect(await verifyApiKey(db, key + 'x')).toBeNull()
    expect(await verifyApiKey(db, 'sk_other')).toBeNull()
    await revokeApiKey(db, u.id, prefix)
    expect(await verifyApiKey(db, key)).toBeNull()
  })
})

describe('audit + tokens', () => {
  it('writes audit rows', async () => {
    await audit(db, { action: 'credit.refund', metadata: { amount: 5 } })
    expect((await db.select().from(auditLogs)).some(r => r.action === 'credit.refund')).toBe(true)
  })
  it('seals tokens when a key is set and still reads legacy plain tokens', () => {
    const key = randomBytes(32).toString('hex')
    const sealed = sealToken('ya29.token', key)!
    expect(sealed).not.toBe('ya29.token')
    expect(openToken(sealed, key)).toBe('ya29.token')
    expect(openToken('legacy-plain', key)).toBe('legacy-plain')
    expect(sealToken('t', undefined)).toBe('t')
  })
})
