import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { writeFile } from 'node:fs/promises'
import { createEpisode, getEpisode, upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { MemoryStore } from '@isaii/storage'
import { renderEpisodeVideo, renderShort } from '../src/media'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 30_000)
afterAll(() => close())

describe('media rendering', () => {
  it('renders the episode video with captions, then a Short', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'media@x.in' }, 0)
    const ep = await createEpisode(db, { userId: u.id, topic: 't', shareId: 'm1', audioUrl: 'https://cdn/a.mp3', thumbnailUrls: ['https://cdn/t.png'], script: { lines: [{ speaker: 'A', text: 'ನಮಸ್ಕಾರ' }] }, seoData: { clip_timestamps: [{ start_line: 2, end_line: 4, hook: 'h', duration_seconds: 30 }] } })
    const store = new MemoryStore('https://cdn')
    const fetchImpl = vi.fn().mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])))
    const calls: string[][] = []
    const ffmpeg = async (args: string[]) => { calls.push(args); await writeFile(args.at(-1)!, 'MP4') }

    const video = await renderEpisodeVideo({ db, store, ffmpeg, fetchImpl: fetchImpl as never }, ep.id)
    expect(video).toBe(`https://cdn/episodes/${ep.id}.mp4`)
    expect(calls[0]!.join(' ')).toContain('subtitles=')
    expect((await getEpisode(db, ep.id))!.videoUrl).toBe(video)

    const short = await renderShort({ db, store, ffmpeg, fetchImpl: fetchImpl as never }, ep.id)
    expect(short).toBe(`https://cdn/shorts/${ep.id}_0.mp4`)
    expect(calls[1]).toContain('29')
    expect((await getEpisode(db, ep.id))!.shortUrls).toEqual([short])
  })
  it('refuses to render without audio', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'media2@x.in' }, 0)
    const ep = await createEpisode(db, { userId: u.id, topic: 't', shareId: 'm2' })
    await expect(renderEpisodeVideo({ db, store: new MemoryStore() }, ep.id)).rejects.toThrow('no audio')
  })
})
