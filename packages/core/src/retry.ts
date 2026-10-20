export type RetryOptions = {
  attempts?: number
  baseMs?: number
  maxMs?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
  sleep?: (ms: number) => Promise<void>
}

/** Retry with exponential backoff and full jitter. */
export async function retry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseMs = 300, maxMs = 5000, shouldRetry = () => true } = opts
  const sleep = opts.sleep ?? (ms => new Promise<void>(r => setTimeout(r, ms)))
  let last: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt)
    } catch (e) {
      last = e
      if (attempt === attempts || !shouldRetry(e, attempt)) break
      await sleep(Math.random() * Math.min(maxMs, baseMs * 2 ** (attempt - 1)))
    }
  }
  throw last
}
