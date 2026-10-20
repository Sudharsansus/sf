/** Minimal key-value surface the platform needs. Upstash and the in-memory store both implement it. */
export interface KV {
  get<T = string>(key: string): Promise<T | null>
  set(key: string, value: string, opts?: { nx?: boolean; ex?: number; px?: number }): Promise<'OK' | null>
  del(key: string): Promise<number>
  incrbyfloat(key: string, by: number): Promise<number>
  expire(key: string, seconds: number): Promise<number>
}
