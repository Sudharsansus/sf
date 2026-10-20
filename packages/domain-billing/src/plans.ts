import { AppError, ErrorCode } from '@isaii/core'

/** 1 credit = 1 minute of finished audio. */
export const DURATION_CREDITS: Record<string, number> = {
  '1min': 1, '2min': 2, '5min': 5, '10min': 10, '15min': 15, '20min': 20, '30min': 30, '45min': 45, '60min': 60,
}

/** Our estimated cost per episode length (USD) — used by spend guards. */
export const DURATION_COST_USD: Record<string, number> = {
  '1min': 0.19, '2min': 0.3, '5min': 0.59, '10min': 1.09, '15min': 1.52, '20min': 2.1, '30min': 3.11, '45min': 4.62, '60min': 6.13,
}

export type PlanLimits = { maxDurationMinutes: number; generatesPerHour: number; maxCostPerHourUsd: number; freeUploads: boolean }

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { maxDurationMinutes: 5, generatesPerHour: 3, maxCostPerHourUsd: 0.7, freeUploads: true },
  lite: { maxDurationMinutes: 10, generatesPerHour: 4, maxCostPerHourUsd: 2, freeUploads: false },
  starter: { maxDurationMinutes: 20, generatesPerHour: 5, maxCostPerHourUsd: 3, freeUploads: false },
  pro: { maxDurationMinutes: 45, generatesPerHour: 8, maxCostPerHourUsd: 6, freeUploads: false },
  studio: { maxDurationMinutes: 60, generatesPerHour: 15, maxCostPerHourUsd: 12, freeUploads: false },
  agency: { maxDurationMinutes: 60, generatesPerHour: 30, maxCostPerHourUsd: 25, freeUploads: false },
}

export const FREE_SIGNUP_CREDITS = 10

export const planLimits = (plan: string): PlanLimits => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free!

export function creditsFor(duration: string): number {
  const c = DURATION_CREDITS[duration]
  if (c === undefined) throw new AppError(ErrorCode.BAD_REQUEST, `Unknown duration "${duration}"`)
  return c
}

export const estimatedCostUsd = (duration: string) => DURATION_COST_USD[duration] ?? DURATION_COST_USD['60min']!

/** Throws a user-facing error when the plan or balance can't cover this length. */
export function assertCanAfford(credits: number, duration: string, plan: string): number {
  const required = creditsFor(duration)
  const limits = planLimits(plan)
  if (required > limits.maxDurationMinutes) {
    throw new AppError(ErrorCode.PAYMENT_REQUIRED, `Your plan supports episodes up to ${limits.maxDurationMinutes} minutes. Upgrade for longer.`, { details: { upgrade: true } })
  }
  if (credits < required) {
    throw new AppError(ErrorCode.PAYMENT_REQUIRED, `This episode needs ${required} credits (${duration}). You have ${credits}.`, { details: { upgrade: true, required, available: credits } })
  }
  return required
}
