import { randomUUID } from 'node:crypto'
import type { KV } from './types'
import { keys } from './keys'

/** Best-effort distributed lock with TTL. Release only removes the lock if we still own it. */
export async function withLock<T>(kv: KV, name: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const key = keys.lock(name)
  const token = randomUUID()
  if ((await kv.set(key, token, { nx: true, px: ttlMs })) === null) return null
  try {
    return await fn()
  } finally {
    if ((await kv.get(key)) === token) await kv.del(key)
  }
}
