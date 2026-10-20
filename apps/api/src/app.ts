import { Hono } from 'hono'
import type { Context } from 'hono'
import { AppError, ErrorCode, toHttpError } from '@isaii/core'
import { buildOpenAPI, GenerateRequest, ProduceRequest } from '@isaii/contracts'
import { findUserById, getOwnedEpisode, type Database } from '@isaii/db'
import type { KV } from '@isaii/cache'
import type { Sender } from '@isaii/queue'
import { grantPurchase, parseDodoWebhook, parseRazorpayWebhook } from '@isaii/domain-billing'
import { verifyApiKey } from '@isaii/domain-identity'
import { progressOf, startGeneration, startProduction } from '@isaii/domain-episodes'
import { logger } from '@isaii/logger'

export type ApiDeps = {
  db: Database
  kv: KV
  send?: Sender
  /** Per-key request limiter; returns false when over the limit. */
  allow?: (key: string) => Promise<boolean>
  secrets: { razorpayWebhook?: string; dodoWebhook?: string }
}

type Env = { Variables: { userId: string; requestId: string } }

/** Public REST API v1 + payment webhooks. Pure factory so tests can inject a PGlite db and fakes. */
export function createApp(deps: ApiDeps) {
  const app = new Hono<Env>()

  app.use('*', async (c, next) => {
    c.set('requestId', c.req.header('x-request-id') ?? crypto.randomUUID())
    await next()
    c.header('x-request-id', c.get('requestId'))
  })

  app.onError((e, c) => {
    const { status, body } = toHttpError(e)
    if (status >= 500) logger.error('api error', { requestId: c.get('requestId'), error: e.message })
    return c.json(body, status as 400)
  })

  app.get('/health', c => c.json({ status: 'ok' }))
  app.get('/v1/openapi.json', c => c.json(buildOpenAPI()))

  // ── API-key authenticated routes ──
  app.use('/v1/*', async (c, next) => {
    if (c.req.path === '/v1/openapi.json') return next()
    const key = c.req.header('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
    const owner = await verifyApiKey(deps.db, key)
    if (!owner) throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or missing API key')
    if (deps.allow && !(await deps.allow(owner.userId))) throw new AppError(ErrorCode.RATE_LIMITED, 'Rate limit exceeded')
    c.set('userId', owner.userId)
    await next()
  })

  const body = async <T>(c: Context, parse: (v: unknown) => T) => {
    const raw = await c.req.json().catch(() => { throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid JSON body') })
    try { return parse(raw) } catch (e) { throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid request', { details: { issues: (e as { issues?: unknown }).issues } }) }
  }
  const user = async (c: Context<Env>) => {
    const u = await findUserById(deps.db, c.get('userId'))
    if (!u) throw new AppError(ErrorCode.UNAUTHORIZED, 'Account not found')
    return u
  }

  app.post('/v1/generations', async c => {
    const u = await user(c)
    const req = await body(c, v => GenerateRequest.parse(v))
    const r = await startGeneration({ db: deps.db, kv: deps.kv, send: deps.send }, { user: { id: u.id, credits: u.credits, plan: u.plan }, ...req, idempotencyKey: c.req.header('idempotency-key') })
    return c.json({ episodeId: r.episodeId, shareId: r.shareId, status: r.status }, r.replay ? 200 : 202)
  })

  app.get('/v1/episodes/:id', async c => {
    const ep = await getOwnedEpisode(deps.db, c.req.param('id'), c.get('userId'))
    if (!ep) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
    return c.json({
      id: ep.id, shareId: ep.shareId, topic: ep.topic, title: ep.title, status: ep.status, language: ep.language,
      audioUrl: ep.audioUrl, videoUrl: ep.videoUrl, thumbnailUrls: ep.thumbnailUrls, scripts: (ep.allScripts as { scripts?: unknown } | null)?.scripts ?? null,
      seo: ep.seoData, progress: progressOf(ep), createdAt: ep.createdAt.toISOString(),
    })
  })

  app.post('/v1/episodes/:id/produce', async c => {
    const req = await body(c, v => ProduceRequest.omit({ episodeId: true }).parse(v))
    const r = await startProduction({ db: deps.db, kv: deps.kv, send: deps.send }, { userId: c.get('userId'), episodeId: c.req.param('id'), ...req })
    return c.json({ episodeId: r.episodeId, status: r.status }, r.status === 'complete' ? 200 : 202)
  })

  // ── Webhooks (signature-verified, no API key) ──
  app.post('/webhooks/razorpay', async c => {
    if (!deps.secrets.razorpayWebhook) return c.json({ error: 'Not configured' }, 503)
    const parsed = parseRazorpayWebhook(await c.req.text(), c.req.header('x-razorpay-signature') ?? '', deps.secrets.razorpayWebhook)
    if (!parsed.ok) return c.json({ error: 'Invalid signature' }, 401)
    if (!parsed.grant) return c.json({ ok: true, ignored: parsed.event })
    return c.json({ ok: true, result: await grantPurchase({ db: deps.db, kv: deps.kv }, { provider: 'razorpay', ...parsed.grant }) })
  })

  app.post('/webhooks/dodo', async c => {
    if (!deps.secrets.dodoWebhook) return c.json({ error: 'Not configured' }, 503)
    const h = { id: c.req.header('webhook-id') ?? '', timestamp: c.req.header('webhook-timestamp') ?? '', signature: c.req.header('webhook-signature') ?? '' }
    const parsed = parseDodoWebhook(await c.req.text(), h, deps.secrets.dodoWebhook)
    if (!parsed.ok) return c.json({ error: 'Invalid signature' }, 401)
    if (!parsed.grant) return c.json({ ok: true, ignored: parsed.event })
    return c.json({ ok: true, result: await grantPurchase({ db: deps.db, kv: deps.kv }, { provider: 'dodo', ...parsed.grant }) })
  })

  return app
}
