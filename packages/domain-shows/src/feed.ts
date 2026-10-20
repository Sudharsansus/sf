import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { episodes, shows, type Database } from '@isaii/db'
import { buildPodcastFeed } from '@isaii/domain-publishing'

type SeoData = { description?: string } | null

/** Public podcast RSS for a show, or undefined if the slug is unknown. Only finished episodes with audio are listed. */
export async function showFeed(db: Database, slug: string, baseUrl: string, limit = 300): Promise<string | undefined> {
  const [show] = await db.select().from(shows).where(eq(shows.rssSlug, slug)).limit(1)
  if (!show) return undefined
  const rows = await db.select().from(episodes)
    .where(and(eq(episodes.showId, show.id), eq(episodes.status, 'complete'), isNotNull(episodes.audioUrl)))
    .orderBy(desc(episodes.createdAt)).limit(limit)
  const link = `${baseUrl.replace(/\/$/, '')}/shows/${encodeURIComponent(slug)}`
  return buildPodcastFeed(
    { title: show.name, description: `${show.name} — made with ISAII`, language: show.language, author: show.name, link, slug },
    rows.map(e => ({
      id: e.id,
      title: e.title || e.topic,
      description: (e.seoData as SeoData)?.description ?? e.topic,
      audioUrl: e.audioUrl!,
      durationSeconds: (e.duration ?? 0) * 60,
      publishedAt: e.createdAt,
    })),
  )
}
