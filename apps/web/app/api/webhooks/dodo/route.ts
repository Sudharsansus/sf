import { NextResponse } from 'next/server'
import { kv } from '@isaii/cache'
import { getDb } from '@isaii/db'
import { grantPurchase, parseDodoWebhook } from '@isaii/domain-billing'
import { logger } from '@isaii/logger'

export const dynamic = 'force-dynamic'

/** Dodo Payments (Standard Webhooks). Subscribe to `payment.succeeded`. */
export async function POST(req: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const raw = await req.text()
  const h = req.headers
  const parsed = parseDodoWebhook(raw, { id: h.get('webhook-id') ?? '', timestamp: h.get('webhook-timestamp') ?? '', signature: h.get('webhook-signature') ?? '' }, secret)
  if (!parsed.ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  if (!parsed.grant) return NextResponse.json({ ok: true, ignored: parsed.event })
  try {
    const result = await grantPurchase({ db: getDb(), kv: kv() }, { provider: 'dodo', ...parsed.grant })
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    logger.error('dodo webhook failed', { error: (e as Error).message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
