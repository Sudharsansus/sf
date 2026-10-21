import { PreviewRequest } from '@isaii/contracts'
import { AppError, ErrorCode } from '@isaii/core'
import { startPreview } from '@isaii/domain-episodes'
import { isEnabled } from '@isaii/flags'
import { clientIp } from '@isaii/security'
import { episodeDeps, limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** No-login 60-second teaser for the homepage. Limited per IP per day and per minute. */
export const POST = route(async (req: Request) => {
  if (!isEnabled('homepagePreview')) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
  const ip = clientIp(req.headers)
  const { success } = await limit('preview', 5, '1 m').limit(ip)
  if (!success) throw new AppError(ErrorCode.RATE_LIMITED, 'Too many requests — try again in a minute.')
  const body = await readJson(req, v => PreviewRequest.parse(v))
  const { kv, dailyBudgetUsd } = episodeDeps()
  return json(await startPreview({ kv, dailyBudgetUsd }, { topic: body.topic, language: body.language, ip }))
})
