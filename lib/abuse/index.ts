// ── AI ABUSE DETECTION ────────────────────────────────────────────────────────
// Detects: prompt injection, token draining, generation spam, malicious content.

import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

// Patterns that signal prompt injection or abuse
const INJECTION_PATTERNS = [
  /ignore (previous|all) (instructions?|prompts?)/i,
  /system prompt/i,
  /you are now/i,
  /disregard (your|all)/i,
  /jailbreak/i,
  /\[INST\]/i,
  /<<SYS>>/i,
]

const SPAM_TOPICS = [
  /generate \d+ (articles?|posts?|scripts?)/i,
  /bulk (create|generate|produce)/i,
]

export interface AbuseCheck {
  allowed: boolean
  reason?: string
  severity: 'none' | 'low' | 'medium' | 'high'
}

export async function checkForAbuse(userId: string, topic: string): Promise<AbuseCheck> {
  // 1. Prompt injection detection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(topic)) {
      logger.warn('Prompt injection detected', { userId, pattern: pattern.source })
      await flagUser(userId, 'prompt_injection')
      return { allowed: false, reason: 'Invalid topic content', severity: 'high' }
    }
  }

  // 2. Spam pattern detection
  for (const pattern of SPAM_TOPICS) {
    if (pattern.test(topic)) {
      return { allowed: false, reason: 'Bulk generation not supported', severity: 'medium' }
    }
  }

  // 3. Velocity check — sliding window via Ratelimit avoids off-by-one at bucket boundaries
  const { Ratelimit } = await import('@upstash/ratelimit')
  const velocityLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '10 m'),
    prefix: 'sf:abuse:velocity'
  })
  const { success: velocityOk } = await velocityLimiter.limit(userId)
  if (!velocityOk) {
    logger.warn('Velocity abuse detected', { userId })
    return { allowed: false, reason: 'Too many requests. Slow down.', severity: 'high' }
  }

  // 4. Check if user is flagged
  const flagged = await redis.get(`sf:flagged:${userId}`)
  if (flagged) {
    return { allowed: false, reason: 'Account restricted. Contact support.', severity: 'high' }
  }

  return { allowed: true, severity: 'none' }
}

async function flagUser(userId: string, reason: string) {
  await redis.setex(`sf:flagged:${userId}`, 3600, reason) // flag for 1h
}

export async function unflagUser(userId: string) {
  await redis.del(`sf:flagged:${userId}`)
}
