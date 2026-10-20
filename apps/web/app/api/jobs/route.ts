import { getDb, getOwnedEpisode, listEpisodes } from '@isaii/db'
import { AppError, ErrorCode } from '@isaii/core'
import { progressOf } from '@isaii/domain-episodes'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

const view = <T extends { userId: string; idempotencyKey: string | null; elevenLabsJobId: string | null }>(ep: T) => {
  const { userId: _u, idempotencyKey: _i, elevenLabsJobId: _e, ...safe } = ep
  return safe
}

/** One episode with real progress, or the user's episode list. */
export const GET = route(async (req: Request) => {
  const user = await requireUser()
  const url = new URL(req.url)
  const id = url.searchParams.get('episodeId')
  if (id) {
    const ep = await getOwnedEpisode(getDb(), id, user.id)
    if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
    return json({ ...view(ep), progress: progressOf(ep) })
  }
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 20)))
  const r = await listEpisodes(getDb(), user.id, page, limit)
  return json({ ...r, data: r.data.map(view) })
})
