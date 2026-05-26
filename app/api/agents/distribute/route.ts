import { NextRequest, NextResponse } from 'next/server'
import { db, episodes, users } from '@/lib/db'
import { uploadVideo, refreshAccessToken } from '@/lib/youtube'
import { createReelContainer, publishReel } from '@/lib/instagram'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { episodeId, platforms } = await req.json()
    if (!episodeId) return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 })

    const [episode] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (!episode || !user || episode.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!episode.audioUrl) return NextResponse.json({ error: 'Audio not ready yet' }, { status: 400 })

    const seo = episode.seoData as any
    const results: Record<string, any> = {}

    // YouTube upload
    if (platforms?.includes('youtube') && user.youtubeAccessToken && user.youtubeRefreshToken) {
      try {
        let token = user.youtubeAccessToken
        try { token = await refreshAccessToken(user.youtubeRefreshToken) } catch {}

        const audioRes = await fetch(episode.audioUrl)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

        const { videoId, videoUrl } = await uploadVideo({
          accessToken: token,
          audioBuffer,
          title: seo?.youtube?.title || episode.title,
          description: seo?.youtube?.description || episode.topic,
          tags: seo?.youtube?.tags || [],
          thumbnailUrl: (episode.thumbnailUrls as string[])?.[0]
        })

        await db.update(episodes).set({ youtubeVideoId: videoId, youtubeUrl: videoUrl }).where(eq(episodes.id, episodeId))
        results.youtube = { videoId, videoUrl, status: 'published' }
        logger.info('YouTube upload complete', { videoId })
      } catch (e: any) {
        logger.error('YouTube upload failed', { error: e.message })
        results.youtube = { status: 'failed', error: e.message }
      }
    }

    // Instagram Reel
    if (platforms?.includes('instagram') && user.instagramAccessToken && user.instagramUserId && episode.audioUrl) {
      try {
        const caption = `${seo?.instagram?.caption || episode.title}\n\n${(seo?.instagram?.hashtags || []).map((h: string) => `#${h}`).join(' ')}`
        const containerId = await createReelContainer({
          accessToken: user.instagramAccessToken,
          userId: user.instagramUserId,
          videoUrl: episode.audioUrl,
          caption
        })
        // Wait for container to process
        await new Promise(r => setTimeout(r, 5000))
        const postId = await publishReel({
          accessToken: user.instagramAccessToken,
          userId: user.instagramUserId,
          containerId
        })
        await db.update(episodes).set({ instagramPostId: postId }).where(eq(episodes.id, episodeId))
        results.instagram = { postId, status: 'published' }
        logger.info('Instagram published', { postId })
      } catch (e: any) {
        logger.error('Instagram failed', { error: e.message })
        results.instagram = { status: 'failed', error: e.message }
      }
    }

    return NextResponse.json({ episodeId, distribution: results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
