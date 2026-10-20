import type { KV } from './types'

/** In-memory KV for tests and offline dev. Honours nx/ex/px semantics. */
export class MemoryKV implements KV {
  private store = new Map<string, { v: string; exp?: number }>()
  constructor(private now: () => number = Date.now) {}

  private live(key: string) {
    const e = this.store.get(key)
    if (e?.exp !== undefined && e.exp <= this.now()) { this.store.delete(key); return undefined }
    return e
  }
  async get<T = string>(key: string) { return (this.live(key)?.v as T | undefined) ?? null }
  async set(key: string, value: string, opts: { nx?: boolean; ex?: number; px?: number } = {}) {
    if (opts.nx && this.live(key)) return null
    const ttl = opts.px ?? (opts.ex !== undefined ? opts.ex * 1000 : undefined)
    this.store.set(key, { v: value, exp: ttl !== undefined ? this.now() + ttl : undefined })
    return 'OK' as const
  }
  async del(key: string) { return this.store.delete(key) ? 1 : 0 }
  async incrbyfloat(key: string, by: number) {
    const next = Number(this.live(key)?.v ?? 0) + by
    const exp = this.store.get(key)?.exp
    this.store.set(key, { v: String(next), exp })
    return next
  }
  async expire(key: string, seconds: number) {
    const e = this.live(key); if (!e) return 0
    e.exp = this.now() + seconds * 1000; return 1
  }
}
