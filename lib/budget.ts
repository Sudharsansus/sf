import { redis } from './redis'
import { logger } from './logger'

// Cost per episode by plan (what we spend)
export const EPISODE_COST_USD = {
  free:    0.28,  // full Claude + ElevenLabs + Replicate
  starter: 0.28,
  pro:     0.28,
  studio:  0.28,
  agency:  0.28,
}

// Revenue per credit by plan (what we earn)
export const CREDIT_VALUE_USD = {
  free:    0,      // free
  starter: 0.63,   // $19 / 30 credits
  pro:     0.29,   // $29 / 100 credits
  studio:  0.20,   // $79 / 400 credits
  agency:  0.13,   // $199 / 1500 credits
}

// Margin per episode
export const MARGIN_USD = {
  free:    -0.28,  // loss leader — converts to paid
  starter: 0.35,   // $0.63 - $0.28
  pro:     0.01,   // $0.29 - $0.28 (volume play)
  studio:  -0.08,  // $0.20 - $0.28 (must upsell agency)
  agency:  -0.15,  // $0.13 - $0.28 (enterprise contracts)
}

// Per-plan limits — ONLY credit count matters for free
export const PLAN_LIMITS = {
  free: {
    credits: 3,
    generatesPerHour: 3,
    maxCostPerHourUsd: 1.00,  // max 3 full episodes/hr
  },
  starter: {
    credits: 30,
    generatesPerHour: 5,
    maxCostPerHourUsd: 2.00,
  },
  pro: {
    credits: 100,
    generatesPerHour: 8,
    maxCostPerHourUsd: 5.00,
  },
  studio: {
    credits: 400,
    generatesPerHour: 15,
    maxCostPerHourUsd: 10.00,
  },
  agency: {
    credits: 1500,
    generatesPerHour: 30,
    maxCostPerHourUsd: 25.00,
  },
}

export function getLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
}

// Global daily spend guard — protects against abuse at scale
const GLOBAL_DAILY_LIMIT_USD = 50.00

export async function checkGlobalBudget(): Promise<boolean> {
  const key = `sus:cost:global:${new Date().toISOString().slice(0, 10)}`
  const spent = parseFloat((await redis.get<string>(key)) || '0')
  return spent < GLOBAL_DAILY_LIMIT_USD
}

export async function trackGlobalCost(costUsd: number): Promise<void> {
  const key = `sus:cost:global:${new Date().toISOString().slice(0, 10)}`
  await redis.incrbyfloat(key, costUsd)
  await redis.expire(key, 86400 * 2)
}

// Per-user hourly cost guard — stops one user burning budget
export async function checkUserHourlyCost(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = getLimits(plan)
  const key = `sus:cost:hour:${userId}:${Math.floor(Date.now() / 3600000)}`
  const spent = parseFloat((await redis.get<string>(key)) || '0')

  if (spent >= limits.maxCostPerHourUsd) {
    return {
      allowed: false,
      reason: `You've reached your hourly limit. Try again in a few minutes.`
    }
  }
  return { allowed: true }
}

export async function trackUserCost(userId: string, costUsd: number): Promise<void> {
  const key = `sus:cost:hour:${userId}:${Math.floor(Date.now() / 3600000)}`
  await redis.incrbyfloat(key, costUsd)
  await redis.expire(key, 7200)
  logger.info('Cost tracked', { userId, costUsd })
}
