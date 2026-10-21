import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createEpisode, upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { requestMediaRender } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 120_000)
afterAll(() => close())

describe('requestMediaRender', () => {
  it('queues a render only for the owner of a produced episode', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'vid@x.in' }, 0)
    const o = await upsertUserOnSignIn(db, { email: 'vid2@x.in' }, 0)
    const send = vi.fn().mockResolvedValue({})
    const bare = await createEpisode(db, { userId: u.id, topic: 't', shareId: 'v1' })
    await expect(requestMediaRender({ db, send }, u.id, bare.id)).rejects.toThrow(/audio first/)
    const noThumb = await createEpisode(db, { userId: u.id, topic: 't', shareId: 'v2', audioUrl: 'a.mp3' })
    await expect(requestMediaRender({ db, send }, u.id, noThumb.id)).rejects.toThrow(/thumbnail/)
    const ready = await createEpisode(db, { userId: u.id, topic: 't', shareId: 'v3', audioUrl: 'a.mp3', thumbnailUrls: ['t.png'] })
    await expect(requestMediaRender({ db, send }, o.id, ready.id)).rejects.toThrow(/not found/)
    expect(await requestMediaRender({ db, send }, u.id, ready.id)).toEqual({ episodeId: ready.id, status: 'rendering' })
    expect(send).toHaveBeenCalledOnce()
  })
})
