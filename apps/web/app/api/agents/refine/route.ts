import { ProduceRequest } from '@isaii/contracts'
import { AppError, ErrorCode } from '@isaii/core'
import { startProduction } from '@isaii/domain-episodes'
import { episodeDeps, limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const body = await readJson(req, v => ProduceRequest.parse(v))
  if (!(await limit('produce', 10, '1 h').limit(user.id)).success) throw new AppError(ErrorCode.RATE_LIMITED, 'Too many production requests. Wait a moment.')
  const r = await startProduction(episodeDeps(), { userId: user.id, ...body })
  return json(r.status === 'complete' ? r.result : r, r.status === 'complete' ? 200 : 202)
})
