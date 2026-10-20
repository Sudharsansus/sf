import { describe, expect, it, vi } from 'vitest'
import { ISAII, ISAIIError } from '../src'

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

describe('ISAII SDK', () => {
  it('sends auth + idempotency headers and parses responses', async () => {
    const f = vi.fn().mockResolvedValue(ok({ episodeId: 'e1', shareId: 's', status: 'processing' }, 202))
    const client = new ISAII({ apiKey: 'isaii_k', baseUrl: 'https://api.test/', fetch: f as never })
    const r = await client.generations.create({ topic: 'Hampi', language: 'kn' }, { idempotencyKey: 'abc' })
    expect(r.episodeId).toBe('e1')
    const [url, init] = f.mock.calls[0]!
    expect(url).toBe('https://api.test/v1/generations')
    expect(init.headers).toMatchObject({ authorization: 'Bearer isaii_k', 'idempotency-key': 'abc' })
  })
  it('throws typed errors', async () => {
    const f = vi.fn().mockResolvedValue(ok({ error: 'Not enough credits', code: 'PAYMENT_REQUIRED' }, 402))
    const err = await new ISAII({ apiKey: 'k', fetch: f as never }).generations.create({ topic: 'x y z' }).catch(e => e)
    expect(err).toBeInstanceOf(ISAIIError)
    expect(err).toMatchObject({ status: 402, code: 'PAYMENT_REQUIRED' })
  })
  it('waits until scripts are ready', async () => {
    const states = [{ status: 'scripting', progress: { done: [], finished: false, failed: false } }, { status: 'awaiting_selection', progress: { done: ['research', 'script'], finished: false, failed: false } }]
    const f = vi.fn().mockImplementation(async () => ok(states.shift()))
    const ep = await new ISAII({ apiKey: 'k', fetch: f as never }).episodes.wait('e1', { intervalMs: 1, until: 'scripts' })
    expect(ep.status).toBe('awaiting_selection')
  })
})
