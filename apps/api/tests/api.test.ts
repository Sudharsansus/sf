import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryKV } from '@isaii/cache'
import { upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { createApiKey } from '@isaii/domain-identity'
import { signHmacHex } from '@isaii/security'
import { createApp } from '../src/app'

let db: Database, close: () => Promise<void>, key: string, app: ReturnType<typeof createApp>
const send = vi.fn().mockResolvedValue({})

beforeAll(async () => {
  ;({ db, close } = await createTestDb())
  const u = await upsertUserOnSignIn(db, { email: 'api@x.in' }, 10)
  key = (await createApiKey(db, u.id, 'test')).key
  app = createApp({ db, kv: new MemoryKV(), send, secrets: { razorpayWebhook: 'rzp_secret' } })
}, 120_000)
afterAll(() => close())

const auth = () => ({ authorization: `Bearer ${key}`, 'content-type': 'application/json' })

describe('public API v1', () => {
  it('serves health and OpenAPI without a key', async () => {
    expect((await app.request('/health')).status).toBe(200)
    const doc = await (await app.request('/v1/openapi.json')).json() as { openapi: string }
    expect(doc.openapi).toBe('3.0.3')
  })
  it('rejects missing or wrong keys with a request id', async () => {
    const r = await app.request('/v1/generations', { method: 'POST' })
    expect(r.status).toBe(401)
    expect(r.headers.get('x-request-id')).toBeTruthy()
  })
  it('validates bodies', async () => {
    const r = await app.request('/v1/generations', { method: 'POST', headers: auth(), body: JSON.stringify({ topic: 'x' }) })
    expect(r.status).toBe(400)
  })
  it('starts a generation and reads it back with progress', async () => {
    const r = await app.request('/v1/generations', { method: 'POST', headers: auth(), body: JSON.stringify({ topic: 'History of Hampi', language: 'kn', duration: '2min' }) })
    expect(r.status).toBe(202)
    const { episodeId } = await r.json() as { episodeId: string }
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ name: 'episode/generate.requested' }))
    const ep = await (await app.request(`/v1/episodes/${episodeId}`, { headers: auth() })).json() as { language: string; progress: { finished: boolean } }
    expect(ep.language).toBe('kn')
    expect(ep.progress.finished).toBe(false)
  })
  it('returns 404 for episodes the key does not own', async () => {
    expect((await app.request('/v1/episodes/00000000-0000-0000-0000-000000000000', { headers: auth() })).status).toBe(404)
  })
  it('maps domain errors (plan limit) to 402', async () => {
    const r = await app.request('/v1/generations', { method: 'POST', headers: auth(), body: JSON.stringify({ topic: 'Long one', duration: '60min' }) })
    expect(r.status).toBe(402)
  })
})

describe('webhooks', () => {
  it('rejects bad signatures and ignores non-payment events', async () => {
    expect((await app.request('/webhooks/razorpay', { method: 'POST', body: '{}', headers: { 'x-razorpay-signature': 'nope' } })).status).toBe(401)
    const raw = JSON.stringify({ event: 'payment.failed' })
    const ok = await app.request('/webhooks/razorpay', { method: 'POST', body: raw, headers: { 'x-razorpay-signature': signHmacHex(raw, 'rzp_secret') } })
    expect(await ok.json()).toEqual({ ok: true, ignored: 'payment.failed' })
    expect((await app.request('/webhooks/dodo', { method: 'POST', body: '{}' })).status).toBe(503)
  })
})
