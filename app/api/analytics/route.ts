export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db, episodes, analytics, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { getChannelStats, refreshAccessToken } from '@/lib/youtube'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const eps = await db.select().from(episodes)
    .where(eq(episodes.userId, user.id))
    .orderBy(desc(episodes.createdAt))
    .limit(20)

  const analyticsData = await db.select().from(analytics)
    .where(eq(analytics.userId, user.id))
    .orderBy(desc(analytics.fetchedAt))
    .limit(100)

  let channelStats = {}
  if (user.youtubeRefreshToken) {
    try {
      const token = await refreshAccessToken(user.youtubeRefreshToken)
      channelStats = await getChannelStats(token)
    } catch {}
  }

  return NextResponse.json({
    episodes: eps.map(e => ({
      id: e.id, title: e.title, topic: e.topic, status: e.status,
      shareId: e.shareId, youtubeUrl: e.youtubeUrl,
      audioUrl: e.audioUrl, createdAt: e.createdAt,
      thumbnailUrls: e.thumbnailUrls
    })),
    analytics: analyticsData,
    channelStats,
    connected: {
      youtube: !!user.youtubeAccessToken,
      instagram: !!user.instagramAccessToken
    }
  })
}


