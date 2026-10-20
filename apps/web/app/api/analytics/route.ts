import { desc, eq } from 'drizzle-orm'
import { analytics, getDb, listEpisodes } from '@isaii/db'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  const db = getDb()
  const [{ data }, stats] = await Promise.all([
    listEpisodes(db, user.id, 1, 20),
    db.select().from(analytics).where(eq(analytics.userId, user.id)).orderBy(desc(analytics.fetchedAt)).limit(100),
  ])
  return json({
    episodes: data.map(e => ({ id: e.id, title: e.title, topic: e.topic, status: e.status, language: e.language, shareId: e.shareId, youtubeUrl: e.youtubeUrl, audioUrl: e.audioUrl, createdAt: e.createdAt, thumbnailUrls: e.thumbnailUrls })),
    analytics: stats,
    connected: { youtube: !!user.youtubeRefreshToken, instagram: !!user.instagramAccessToken },
  })
})
