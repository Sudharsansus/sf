import { Ratelimit } from '@upstash/ratelimit'
import type { Redis } from '@upstash/redis'

type Window = `${number} ${'s' | 'm' | 'h' | 'd'}`

/** Factory for sliding-window limiters, cached per (name, limit, window). */
export function createLimiterFactory(redis: Redis, prefix = 'sus:rl') {
  const cache = new Map<string, Ratelimit>()
  return (name: string, limit: number, window: Window) => {
    const k = `${name}:${limit}:${window}`
    let l = cache.get(k)
    if (!l) {
      l = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window), prefix: `${prefix}:${name}` })
      cache.set(k, l)
    }
    return l
  }
}

/** Best-effort client IP from proxy headers. */
export function clientIp(headers: Headers): string {
  return headers.get('x-real-ip') || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
