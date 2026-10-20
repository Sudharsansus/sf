import { randomUUID } from 'node:crypto'
import { AppError, ErrorCode } from '@isaii/core'
import { createEpisode, getByIdempotencyKey, updateEpisode } from '@isaii/db'
import { assertCanAfford, chargeCredits, estimatedCostUsd, planLimits, refundCredits } from '@isaii/domain-billing'
import { SpendGuard } from '@isaii/ai-gateway'
import { screenTopic } from '@isaii/guardrails'
import { isSupported } from '@isaii/i18n'
import { sendEvent } from '@isaii/queue'
import { sanitizeText } from '@isaii/security'
import { logger } from '@isaii/logger'
import type { EpisodeDeps } from './deps'

export type StartGenerationInput = {
  user: { id: string; credits: number; plan: string }
  topic: string
  language?: string
  duration?: string
  idempotencyKey?: string
}

/**
 * Validate, charge and queue a new episode. The Inngest function does the AI work;
 * if queueing fails the charge is refunded here, if the pipeline fails it refunds itself.
 */
export async function startGeneration(deps: EpisodeDeps, input: StartGenerationInput) {
  const { db, kv } = deps
  const topic = sanitizeText(input.topic, 200)
  const language = input.language ?? 'en'
  const duration = input.duration ?? '5min'
  if (topic.length < 3) throw new AppError(ErrorCode.BAD_REQUEST, 'Topic must be at least 3 characters')
  if (!isSupported(language)) throw new AppError(ErrorCode.BAD_REQUEST, `Unsupported language "${language}"`)

  const idemKey = input.idempotencyKey ? `${input.user.id}:${input.idempotencyKey.slice(0, 64)}` : undefined
  if (idemKey) {
    const existing = await getByIdempotencyKey(db, idemKey)
    if (existing) return { episodeId: existing.id, shareId: existing.shareId, status: existing.status, replay: true as const }
  }

  const screen = screenTopic(topic)
  if (!screen.allowed) throw new AppError(ErrorCode.UNPROCESSABLE, screen.reason ?? 'Topic not allowed')

  const credits = assertCanAfford(input.user.credits, duration, input.user.plan)

  const guard = new SpendGuard(kv, { dailyLimitUsd: deps.dailyBudgetUsd ?? 100, now: deps.now })
  if (!(await guard.globalOk())) throw new AppError(ErrorCode.UNAVAILABLE, 'ISAII is very busy right now. Please try again later.')
  if (!(await guard.userOk(input.user.id, planLimits(input.user.plan).maxCostPerHourUsd))) {
    throw new AppError(ErrorCode.RATE_LIMITED, 'Hourly limit reached for your plan. Try again next hour.')
  }

  await chargeCredits(db, input.user.id, credits, `generate_${duration}`)
  const episode = await createEpisode(db, {
    userId: input.user.id, topic, title: topic, language, shareId: randomUUID().replace(/-/g, ''),
    status: 'processing', agentStep: 'queued', idempotencyKey: idemKey ?? randomUUID(),
  })
  await guard.track(estimatedCostUsd(duration), input.user.id)

  try {
    await sendEvent('episode/generate.requested', { episodeId: episode.id, userId: input.user.id, topic, language, duration, credits }, deps.send)
  } catch (e) {
    logger.error('queueing generation failed — refunding', { episodeId: episode.id, error: (e as Error).message })
    await refundCredits(db, input.user.id, credits, `queue_failure_${duration}`)
    await updateEpisode(db, episode.id, { status: 'failed', agentStep: 'failed' })
    throw new AppError(ErrorCode.UNAVAILABLE, 'Could not start generation. Your credits were refunded.')
  }
  return { episodeId: episode.id, shareId: episode.shareId, status: 'processing' as const, replay: false as const }
}
