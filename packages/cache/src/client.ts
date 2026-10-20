import { Redis } from '@upstash/redis'
import type { KV } from './types'

let redis: Redis | null = null

/** Shared Upstash client (REST, works on serverless + edge). Reads REDIS_URL / REDIS_TOKEN lazily. */
export function getRedis(): Redis {
  redis ??= new Redis({ url: process.env.REDIS_URL!, token: process.env.REDIS_TOKEN! })
  return redis
}

export const kv = (): KV => getRedis() as unknown as KV
