import { AppError, ErrorCode } from '@isaii/core'
import { SpendGuard } from '@isaii/ai-gateway'
import { writePreview, type AgentDeps, type Preview } from '@isaii/agents'
import { keys } from '@isaii/cache'
import { screenTopic } from '@isaii/guardrails'
import { isSupported } from '@isaii/i18n'
import { sanitizeText } from '@isaii/security'
import type { EpisodeDeps } from './deps'

export const PREVIEWS_PER_IP_PER_DAY = 3
/** Rough upper bound for one preview call, tracked against the global daily cap. */
const PREVIEW_COST_USD = 0.01

/** Anonymous 60-second teaser for the homepage: no account, no credits, rate limited per IP. */
export async function startPreview(
  deps: Pick<EpisodeDeps, 'kv' | 'now' | 'dailyBudgetUsd'> & { agents?: AgentDeps },
  input: { topic: string; language?: string; ip: string },
): Promise<Preview & { remaining: number }> {
  const topic = sanitizeText(input.topic, 120)
  const language = input.language ?? 'en'
  if (topic.length < 3) throw new AppError(ErrorCode.BAD_REQUEST, 'Topic must be at least 3 characters')
  if (!isSupported(language)) throw new AppError(ErrorCode.BAD_REQUEST, `Unsupported language "${language}"`)
  const screen = screenTopic(topic)
  if (!screen.allowed) throw new AppError(ErrorCode.UNPROCESSABLE, screen.reason ?? 'Topic not allowed')

  const day = (deps.now?.() ?? new Date()).toISOString().slice(0, 10)
  const key = keys.previewIp(input.ip, day)
  const used = await deps.kv.incrbyfloat(key, 1)
  if (used === 1) await deps.kv.expire(key, 60 * 60 * 26)
  if (used > PREVIEWS_PER_IP_PER_DAY) throw new AppError(ErrorCode.RATE_LIMITED, 'Free previews used up for today — sign up for 10 free episodes.')

  const guard = new SpendGuard(deps.kv, { dailyLimitUsd: deps.dailyBudgetUsd ?? 100, now: deps.now })
  if (!(await guard.globalOk())) throw new AppError(ErrorCode.UNAVAILABLE, 'ISAII is very busy right now. Please try again later.')
  await guard.track(PREVIEW_COST_USD)

  const preview = await writePreview(topic, language, deps.agents)
  return { ...preview, remaining: PREVIEWS_PER_IP_PER_DAY - used }
}
