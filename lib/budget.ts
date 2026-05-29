import { redis } from './redis'
import { logger } from './logger'

export const COST_PER_MINUTE_USD = 0.12  // ElevenLabs + Claude + infra blended

// Credits required per duration
export const DURATION_CREDITS: Record<string, number> = {
  '1min':  1,
  '2min':  2,
  '5min':  5,
  '10min': 10,
  '15min': 15,
  '20min': 20,
  '30min': 30,
  '45min': 45,
  '60min': 60,
}

// Cost per duration in USD (what YOU pay)
export const DURATION_COST_USD: Record<string, number> = {
  '1min':  0.19,
  '2min':  0.30,
  '5min':  0.59,
  '10min': 1.09,
  '15min': 1.52,
  '20min': 2.10,
  '30min': 3.11,
  '45min': 4.62,
  '60min': 6.13,
}

// Plan pricing — credits = minutes of audio
export const PLANS = {
  free: {
    credits: 10,
    priceMonthly: 0,
    priceYearly: 0,
    minutesIncluded: 10,
    maxDuration: '5min',
    languages: 1,
    voices: 4,
    thumbnails: true,
    generatesPerHour: 3,
    maxCostPerHourUsd: 0.70,
  },
  starter: {
    credits: 60,
    priceMonthly: 19,
    priceYearly: 15,
    minutesIncluded: 60,
    maxDuration: '20min',
    languages: 12,
    voices: 16,
    thumbnails: true,
    generatesPerHour: 5,
    maxCostPerHourUsd: 3.00,
  },
  pro: {
    credits: 200,
    priceMonthly: 39,
    priceYearly: 31,
    minutesIncluded: 200,
    maxDuration: '45min',
    languages: 12,
    voices: 16,
    thumbnails: true,
    generatesPerHour: 8,
    maxCostPerHourUsd: 6.00,
  },
  studio: {
    credits: 600,
    priceMonthly: 79,
    priceYearly: 63,
    minutesIncluded: 600,
    maxDuration: '60min',
    languages: 12,
    voices: 16,
    thumbnails: true,
    generatesPerHour: 15,
    maxCostPerHourUsd: 12.00,
  },
  agency: {
    credits: 2000,
    priceMonthly: 199,
    priceYearly: 159,
    minutesIncluded: 2000,
    maxDuration: '60min',
    languages: 12,
    voices: 16,
    thumbnails: true,
    generatesPerHour: 30,
    maxCostPerHourUsd: 25.00,
  },
}

// Revenue per minute (what they pay / minutes included)
export const REVENUE_PER_MINUTE = {
  free:    0,
  starter: 0.317,  // $19 / 60 min
  pro:     0.195,  // $39 / 200 min
  studio:  0.132,  // $79 / 600 min
  agency:  0.100,  // $199 / 2000 min
}

// Margin per minute
export const MARGIN_PER_MINUTE = {
  free:    -0.12,  // loss
  starter: +0.197, // $0.317 - $0.12
  pro:     +0.075, // $0.195 - $0.12
  studio:  +0.012, // $0.132 - $0.12
  agency:  -0.02,  // volume + upsell play
}

// Extra credit packs (minutes top-up)
export const CREDIT_PACKS = [
  { minutes: 30,  credits: 30,  priceUsd: 12, label: '30 min'  },
  { minutes: 60,  credits: 60,  priceUsd: 22, label: '1 hour'  },
  { minutes: 120, credits: 120, priceUsd: 40, label: '2 hours' },
  { minutes: 300, credits: 300, priceUsd: 89, label: '5 hours' },
]

export type Plan = keyof typeof PLANS

export function getPlan(plan: string) {
  return PLANS[plan as Plan] || PLANS.free
}

export function getCreditsForDuration(duration: string): number {
  return DURATION_CREDITS[duration] || 5
}

export function getCostForDuration(duration: string): number {
  return DURATION_COST_USD[duration] || 0.59
}

export function canAffordDuration(
  credits: number,
  duration: string,
  plan: string
): { allowed: boolean; reason?: string; required: number } {
  const required = getCreditsForDuration(duration)
  const planLimits = getPlan(plan)

  const durationMins = parseInt(duration)
  const maxMins = parseInt(planLimits.maxDuration)
  if (durationMins > maxMins) {
    return {
      allowed: false,
      required,
      reason: `Your plan supports up to ${planLimits.maxDuration} episodes. Upgrade for longer.`
    }
  }

  if (credits < required) {
    return {
      allowed: false,
      required,
      reason: `This episode needs ${required} credits (${duration}). You have ${credits}.`
    }
  }
  return { allowed: true, required }
}

const GLOBAL_DAILY_LIMIT_USD = 100.00

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

export async function checkUserHourlyCost(
  userId: string, plan: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = getPlan(plan)
  const key = `sus:cost:hour:${userId}:${Math.floor(Date.now() / 3600000)}`
  const spent = parseFloat((await redis.get<string>(key)) || '0')
  if (spent >= limits.maxCostPerHourUsd) {
    return { allowed: false, reason: 'Hourly spend limit reached. Try again next hour.' }
  }
  return { allowed: true }
}

export async function trackUserCost(userId: string, costUsd: number): Promise<void> {
  const key = `sus:cost:hour:${userId}:${Math.floor(Date.now() / 3600000)}`
  await redis.incrbyfloat(key, costUsd)
  await redis.expire(key, 7200)
  logger.info('Cost tracked', { userId, costUsd })
}
