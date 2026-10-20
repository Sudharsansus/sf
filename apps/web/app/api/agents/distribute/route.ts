import * as z from 'zod'
import { eq } from 'drizzle-orm'
import { AppError, ErrorCode } from '@isaii/core'
import { episodes, getDb, getOwnedEpisode } from '@isaii/db'
import { openToken } from '@isaii/domain-identity'
import { instagramPublishReel, reelCaption, youtubeRefresh, youtubeUploadVideo } from '@isaii/domain-publishing'
import { logger } from '@isaii/logger'
import { appUrl, json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const Body = z.object({ episodeId: z.uuid(), platforms: z.array(z.enum(['youtube', 'instagram'])).min(1), privacy: z.enum(['private', 'unlisted', 'public']).default('private') })
type Seo = { youtube?: { title?: string; description?: string; tags?: string[] }; instagram?: { caption?: string; hashtags?: string[] } }

/** Publish on the creator's click. Needs the MP4 / Short rendered by worker-media — audio is never uploaded as video. */
export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const body = await readJson(req, v => Body.parse(v))
  const ep = await getOwnedEpisode(getDb(), body.episodeId, user.id)
  if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
  const seo = (ep.seoData ?? {}) as Seo
  const results: Record<string, unknown> = {}

  if (body.platforms.includes('youtube')) {
    const refresh = openToken(user.youtubeRefreshToken)
    if (!ep.videoUrl) results.youtube = { status: 'not_ready', error: 'The video for this episode has not been rendered yet.' }
    else if (!refresh) results.youtube = { status: 'not_connected' }
    else {
      try {
        const base = appUrl(req)
        const token = await youtubeRefresh({ clientId: process.env.YOUTUBE_CLIENT_ID ?? '', clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? '', redirectUri: `${base}/api/youtube/callback` }, refresh)
        const video = new Uint8Array(await (await fetch(ep.videoUrl)).arrayBuffer())
        const r = await youtubeUploadVideo({ accessToken: token, video, title: seo.youtube?.title || ep.title, description: seo.youtube?.description || ep.topic, tags: seo.youtube?.tags ?? [], privacy: body.privacy, language: ep.language })
        await getDb().update(episodes).set({ youtubeVideoId: r.videoId, youtubeUrl: r.videoUrl }).where(eq(episodes.id, ep.id))
        results.youtube = { status: 'uploaded', ...r }
      } catch (e) {
        logger.error('youtube publish failed', { error: (e as Error).message })
        results.youtube = { status: 'failed' }
      }
    }
  }

  if (body.platforms.includes('instagram')) {
    const short = (ep.shortUrls as string[] | null)?.[0]
    const token = openToken(user.instagramAccessToken)
    if (!short) results.instagram = { status: 'not_ready', error: 'No Short has been rendered for this episode yet.' }
    else if (!token || !user.instagramUserId) results.instagram = { status: 'not_connected' }
    else {
      try {
        const r = await instagramPublishReel({ accessToken: token, userId: user.instagramUserId, videoUrl: short, caption: reelCaption(seo.instagram?.caption || ep.title, seo.instagram?.hashtags ?? []) })
        await getDb().update(episodes).set({ instagramPostId: r.postId }).where(eq(episodes.id, ep.id))
        results.instagram = { status: 'published', ...r }
      } catch (e) {
        logger.error('instagram publish failed', { error: (e as Error).message })
        results.instagram = { status: 'failed' }
      }
    }
  }
  return json({ episodeId: ep.id, distribution: results })
})
