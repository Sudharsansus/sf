import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url:   process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
})

// ── PER-USER LIMITS ───────────────────────────────────────────────────────────
// 5 generations per hour — primary API bill protection
export const generateLimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(5, '1 h'), prefix: 'sus:gen:user'
})

// 3 refines per hour — ElevenLabs is expensive
export const refineLimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(3, '1 h'), prefix: 'sus:refine:user'
})

// 60 chat messages per minute per user
export const chatLimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(60, '1 m'), prefix: 'sus:chat:user'
})

// 20 enumeration-style lookups per minute per user (share/jobs/credits endpoints)
export const enumLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'sus:enum:user'
})

// 3 generations per hour for free users — stricter than paid
export const freeGenerateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'sus:gen:free'
})

// ── PER-IP LIMITS (public + unauthenticated routes) ───────────────────────────
// Prevents IP-level abuse of public endpoints
export const ipLimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'sus:ip'
})

// ── COST-BASED LIMIT ──────────────────────────────────────────────────────────
// Tracks estimated token cost per user per hour in Redis
// Prevents a single user burning $X even within normal request counts
const HOURLY_COST_LIMIT_USD = 2.00  // $2 max per user per hour

export async function checkCostLimit(userId: string, estimatedCostUsd: number): Promise<boolean> {
  const key = `sf:cost:${userId}:${Math.floor(Date.now() / 3600000)}`
  const current = await redis.incrbyfloat(key, estimatedCostUsd)
  if (current === estimatedCostUsd) {
    // First call this hour — set 1h expiry
    await redis.expire(key, 3600)
  }
  return current <= HOURLY_COST_LIMIT_USD
}

export async function getCurrentCost(userId: string): Promise<number> {
  const key = `sf:cost:${userId}:${Math.floor(Date.now() / 3600000)}`
  const val = await redis.get<string>(key)
  return val ? parseFloat(val) : 0
}

// Legacy export name kept for compatibility
export const apiLimit = ipLimit
