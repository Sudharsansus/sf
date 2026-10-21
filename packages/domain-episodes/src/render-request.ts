import { AppError, ErrorCode } from '@isaii/core'
import { getOwnedEpisode } from '@isaii/db'
import { sendEvent } from '@isaii/queue'
import type { EpisodeDeps } from './deps'

/** Queue a 16:9 video + 9:16 Short render for a finished episode the user owns. */
export async function requestMediaRender(deps: Pick<EpisodeDeps, 'db' | 'send'>, userId: string, episodeId: string) {
  const ep = await getOwnedEpisode(deps.db, episodeId, userId)
  if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Episode not found')
  if (!ep.audioUrl) throw new AppError(ErrorCode.CONFLICT, 'Produce the episode audio first')
  if (!Array.isArray(ep.thumbnailUrls) || ep.thumbnailUrls.length === 0) throw new AppError(ErrorCode.CONFLICT, 'The episode needs a thumbnail before a video can be made')
  await sendEvent('media/render.requested', { episodeId, kind: 'shorts', options: {} }, deps.send)
  return { episodeId, status: 'rendering' as const }
}
