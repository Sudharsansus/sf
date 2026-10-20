import type { KV } from './types'

/**
 * Claim a key once. Returns `run` for the first caller and `duplicate` afterwards.
 * If `fn` throws, the claim is released so the caller (e.g. a webhook retry) can try again.
 */
export async function once<T>(kv: KV, key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<{ status: 'run'; value: T } | { status: 'duplicate' }> {
  const claimed = await kv.set(key, '1', { nx: true, ex: ttlSeconds })
  if (claimed === null) return { status: 'duplicate' }
  try {
    return { status: 'run', value: await fn() }
  } catch (e) {
    await kv.del(key)
    throw e
  }
}
