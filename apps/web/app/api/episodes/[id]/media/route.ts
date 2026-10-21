import { AppError, ErrorCode } from '@isaii/core'
import { requestMediaRender } from '@isaii/domain-episodes'
import { isEnabled } from '@isaii/flags'
import { episodeDeps, limit } from '@/server/deps'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

/** Queue a YouTube video (16:9) + Short/Reel (9:16) render. Needs worker-media (FLAG_VIDEO_RENDERING=true). */
export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  if (!isEnabled('videoRendering')) throw new AppError(ErrorCode.UNAVAILABLE, 'Video rendering is coming soon.')
  const user = await requireUser()
  const { success } = await limit('media-render', 10, '1 h').limit(user.id)
  if (!success) throw new AppError(ErrorCode.RATE_LIMITED, 'Too many video renders this hour.')
  return json(await requestMediaRender(episodeDeps(), user.id, (await ctx.params).id), 202)
})
