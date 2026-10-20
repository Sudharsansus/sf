import { getDb } from '@isaii/db'
import { getRedis, kv } from '@isaii/cache'
import { createLimiterFactory } from '@isaii/security'
import type { EpisodeDeps } from '@isaii/domain-episodes'

export const episodeDeps = (): EpisodeDeps => ({ db: getDb(), kv: kv(), dailyBudgetUsd: Number(process.env.AI_DAILY_BUDGET_USD ?? 100) })

let limiter: ReturnType<typeof createLimiterFactory> | null = null
/** Sliding-window rate limiters backed by Upstash. */
export const limit = (name: string, max: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) =>
  (limiter ??= createLimiterFactory(getRedis()))(name, max, window)
