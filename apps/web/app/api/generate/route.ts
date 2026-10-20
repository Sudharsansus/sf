import { GenerateRequest } from '@isaii/contracts'
import { AppError, ErrorCode } from '@isaii/core'
import { planLimits } from '@isaii/domain-billing'
import { startGeneration } from '@isaii/domain-episodes'
import { episodeDeps, limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** Validate + charge + queue. Research and scripts run in the background (Inngest). */
export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const body = await readJson(req, v => GenerateRequest.parse(v))
  const { success } = await limit(`gen:${user.plan}`, planLimits(user.plan).generatesPerHour, '1 h').limit(user.id)
  if (!success) throw new AppError(ErrorCode.RATE_LIMITED, `Your plan allows ${planLimits(user.plan).generatesPerHour} episodes per hour. Please wait a moment.`)
  const r = await startGeneration(episodeDeps(), {
    user: { id: user.id, credits: user.credits, plan: user.plan },
    topic: body.topic, language: body.language, duration: body.duration,
    idempotencyKey: req.headers.get('Idempotency-Key') ?? undefined,
  })
  return json(r, r.replay ? 200 : 202)
})
