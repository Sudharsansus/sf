// ── SEMANTIC CACHE ────────────────────────────────────────────────────────────
// Caches repeated AI outputs by prompt hash — massive cost reduction at scale.
// Especially effective for: SEO, research, summaries, repeated topics.

import { redis } from '@/lib/redis'
import crypto from 'crypto'

const TTL_SECONDS = {
  research: 60 * 60 * 6,    // 6h — topic research stays fresh
  seo:      60 * 60 * 24,   // 24h — SEO copy reusable
  evaluate: 60 * 60 * 2,    // 2h — evaluation scores
  default:  60 * 60         // 1h
}

function hashPrompt(system: string, user: string): string {
  return crypto.createHash('sha256').update(`${system}::${user}`).digest('hex').slice(0, 32)
}

export async function getCached<T>(system: string, user: string): Promise<T | null> {
  try {
    const key = `sf:cache:${hashPrompt(system, user)}`
    const val = await redis.get<string>(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

export async function setCache<T>(
  system: string, user: string, value: T,
  taskType: 'research' | 'seo' | 'evaluate' | 'default' = 'default'
): Promise<void> {
  try {
    const key = `sf:cache:${hashPrompt(system, user)}`
    const ttl = TTL_SECONDS[taskType] || TTL_SECONDS.default
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch {}
}

export async function invalidateCache(pattern: string): Promise<void> {
  // Note: Upstash doesn't support SCAN — invalidation is TTL-based
  // For targeted invalidation, use explicit keys
}
