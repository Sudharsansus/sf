export type FeedShow = { title: string; description: string; language: string; author: string; link: string; imageUrl?: string; slug: string }
export type FeedEpisode = { id: string; title: string; description: string; audioUrl: string; audioBytes?: number; durationSeconds: number; publishedAt: Date }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const hms = (s: number) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)].map(n => String(n).padStart(2, '0')).join(':')

/** Podcast RSS 2.0 with iTunes tags — accepted by Spotify, Apple Podcasts, JioSaavn and Amazon Music. */
export function buildPodcastFeed(show: FeedShow, episodes: FeedEpisode[]): string {
  const items = episodes.map(e => `
    <item>
      <title>${esc(e.title)}</title>
      <description>${esc(e.description)}</description>
      <guid isPermaLink="false">${esc(e.id)}</guid>
      <pubDate>${e.publishedAt.toUTCString()}</pubDate>
      <enclosure url="${esc(e.audioUrl)}" length="${e.audioBytes ?? 0}" type="audio/mpeg"/>
      <itunes:duration>${hms(e.durationSeconds)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(show.title)}</title>
    <link>${esc(show.link)}</link>
    <atom:link href="${esc(show.link)}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>${esc(show.language)}</language>
    <description>${esc(show.description)}</description>
    <itunes:author>${esc(show.author)}</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    ${show.imageUrl ? `<itunes:image href="${esc(show.imageUrl)}"/>` : ''}${items}
  </channel>
</rss>
`
}
