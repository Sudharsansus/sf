import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createEpisode, getEpisode, upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { assignEpisode, createShow, listShowsWithCounts } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 120_000)
afterAll(() => close())

const host = [{ id: 'A' as const, name: 'Meera', voiceId: 'v', personality: '' }]

describe('assignEpisode', () => {
  it('adds and removes episodes, counted per show, owner only', async () => {
    const a = await upsertUserOnSignIn(db, { email: 'as@x.in' }, 0)
    const b = await upsertUserOnSignIn(db, { email: 'bs@x.in' }, 0)
    const show = await createShow(db, a.id, { name: 'Malayalam Mornings', language: 'ml', hosts: host, style: {} })
    const ep = await createEpisode(db, { userId: a.id, topic: 'Onam', shareId: 'as1' })
    const other = await createEpisode(db, { userId: b.id, topic: 'Not yours', shareId: 'bs1' })

    await assignEpisode(db, a.id, ep.id, show.id)
    expect((await getEpisode(db, ep.id))!.showId).toBe(show.id)
    expect((await listShowsWithCounts(db, a.id))[0]!.episodeCount).toBe(1)

    await expect(assignEpisode(db, a.id, other.id, show.id)).rejects.toThrow('Episode not found')
    await expect(assignEpisode(db, b.id, other.id, show.id)).rejects.toThrow('Show not found')

    await assignEpisode(db, a.id, ep.id, null)
    expect((await listShowsWithCounts(db, a.id))[0]!.episodeCount).toBe(0)
  })
})
