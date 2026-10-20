import { describe, expect, it, vi } from 'vitest'
import { buildPodcastFeed, instagramPublishReel, reelCaption, youtubeAuthUrl, youtubeUploadVideo } from '../src'

describe('youtube', () => {
  it('requests offline upload scope', () => {
    const url = new URL(youtubeAuthUrl({ clientId: 'c', clientSecret: 's', redirectUri: 'https://isaii.si/cb' }, 'st'))
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('scope')).toContain('youtube.upload')
  })
  it('uploads MP4 as private by default', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'vid1' }), { status: 200 }))
    const r = await youtubeUploadVideo({ accessToken: 't', video: new Uint8Array([0, 0, 0, 24]), title: 'x'.repeat(150), description: 'd', tags: [] }, fetchImpl as never)
    expect(r.videoUrl).toBe('https://www.youtube.com/watch?v=vid1')
    const body = fetchImpl.mock.calls[0]![1].body.toString()
    expect(body).toContain('"privacyStatus":"private"')
    expect(body).toContain('Content-Type: video/mp4')
  })
})

describe('instagram', () => {
  it('waits for processing then publishes', async () => {
    const responses = [{ id: 'c1' }, { status_code: 'IN_PROGRESS' }, { status_code: 'FINISHED' }, { id: 'post1' }]
    const fetchImpl = vi.fn().mockImplementation(async () => new Response(JSON.stringify(responses.shift()), { status: 200 }))
    expect(await instagramPublishReel({ accessToken: 't', userId: 'u', videoUrl: 'https://cdn/s.mp4', caption: 'c', pollMs: 1 }, fetchImpl as never)).toEqual({ postId: 'post1' })
  })
  it('builds captions with clean hashtags', () => {
    expect(reelCaption('Watch this', ['#Sleep', 'deep work'])).toBe('Watch this\n\n#Sleep #deepwork')
  })
})

describe('rss', () => {
  it('escapes content and formats durations', () => {
    const xml = buildPodcastFeed(
      { title: 'Chai & Chats', description: 'd', language: 'ta', author: 'ISAII', link: 'https://isaii.si/s/chai', slug: 'chai' },
      [{ id: 'e1', title: 'Ep <1>', description: 'x', audioUrl: 'https://cdn/e1.mp3', durationSeconds: 3725, publishedAt: new Date('2026-10-21T00:00:00Z') }],
    )
    expect(xml).toContain('Chai &amp; Chats')
    expect(xml).toContain('Ep &lt;1&gt;')
    expect(xml).toContain('<itunes:duration>01:02:05</itunes:duration>')
    expect(xml).toContain('<language>ta</language>')
  })
})
