import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createEpisode, upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { createShow, showFeed } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 120_000)
afterAll(() => close())

describe('showFeed', () => {
  it('lists only finished episodes with audio', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'feed@x.in' }, 0)
    const show = await createShow(db, u.id, { name: 'Chai & Code', language: 'hi', hosts: [{ id: 'A', name: 'Asha', voiceId: 'v', personality: '' }], style: {} })
    await createEpisode(db, { userId: u.id, topic: 'UPI <story>', shareId: 's1', showId: show.id, status: 'complete', audioUrl: 'https://cdn/x.mp3', duration: 10 })
    await createEpisode(db, { userId: u.id, topic: 'Draft', shareId: 's2', showId: show.id, status: 'scripting' })
    const xml = await showFeed(db, show.rssSlug!, 'https://isaii.si/')
    expect(xml).toContain('<title>UPI &lt;story&gt;</title>')
    expect(xml).toContain('<itunes:duration>00:10:00</itunes:duration>')
    expect(xml).not.toContain('Draft')
    expect(await showFeed(db, 'nope', 'https://isaii.si')).toBeUndefined()
  })
})
