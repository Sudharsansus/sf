import type * as z from 'zod'
import type { CheckoutResponse, Episode, GenerateRequest, GenerateResponse, ProduceRequest } from '@isaii/contracts'

export class ISAIIError extends Error {
  constructor(readonly status: number, message: string, readonly code?: string) { super(message); this.name = 'ISAIIError' }
}

export type ClientOptions = { apiKey: string; baseUrl?: string; fetch?: typeof fetch }

/** Typed client for the ISAII public API (v1). */
export class ISAII {
  private base: string
  private f: typeof fetch
  constructor(private opts: ClientOptions) {
    this.base = (opts.baseUrl ?? 'https://api.isaii.si').replace(/\/$/, '')
    this.f = opts.fetch ?? fetch
  }

  private async req<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
    const res = await this.f(`${this.base}${path}`, {
      method,
      headers: { authorization: `Bearer ${this.opts.apiKey}`, 'content-type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
    if (!res.ok) throw new ISAIIError(res.status, data.error ?? res.statusText, data.code)
    return data as T
  }

  readonly generations = {
    create: (input: z.input<typeof GenerateRequest>, opts: { idempotencyKey?: string } = {}) =>
      this.req<z.infer<typeof GenerateResponse>>('POST', '/v1/generations', input, opts.idempotencyKey ? { 'idempotency-key': opts.idempotencyKey } : {}),
  }

  readonly episodes = {
    get: (id: string) => this.req<z.infer<typeof Episode> & { progress: { done: string[]; finished: boolean; failed: boolean } }>('GET', `/v1/episodes/${encodeURIComponent(id)}`),
    produce: (id: string, input: Omit<z.input<typeof ProduceRequest>, 'episodeId'>) => this.req<{ episodeId: string; status: string }>('POST', `/v1/episodes/${encodeURIComponent(id)}/produce`, input),
    /** Poll until the episode finishes (or fails). */
    wait: async (id: string, opts: { intervalMs?: number; timeoutMs?: number; until?: 'scripts' | 'complete' } = {}) => {
      const { intervalMs = 3000, timeoutMs = 30 * 60_000, until = 'complete' } = opts
      const start = Date.now()
      for (;;) {
        const ep = await this.episodes.get(id)
        if (ep.progress.failed) throw new ISAIIError(500, 'Episode failed')
        if (until === 'scripts' && ep.status === 'awaiting_selection') return ep
        if (ep.progress.finished) return ep
        if (Date.now() - start > timeoutMs) throw new ISAIIError(408, 'Timed out waiting for episode')
        await new Promise(r => setTimeout(r, intervalMs))
      }
    },
  }
}

export type { CheckoutResponse }
