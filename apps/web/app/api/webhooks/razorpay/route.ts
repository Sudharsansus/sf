import { NextResponse } from 'next/server'
import { kv } from '@isaii/cache'
import { getDb } from '@isaii/db'
import { grantPurchase, parseRazorpayWebhook } from '@isaii/domain-billing'
import { logger } from '@isaii/logger'

export const dynamic = 'force-dynamic'

/** Subscribe to `order.paid` in the Razorpay dashboard. */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const raw = await req.text()
  const parsed = parseRazorpayWebhook(raw, req.headers.get('x-razorpay-signature') ?? '', secret)
  if (!parsed.ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  if (!parsed.grant) return NextResponse.json({ ok: true, ignored: parsed.event })
  try {
    const result = await grantPurchase({ db: getDb(), kv: kv() }, { provider: 'razorpay', ...parsed.grant })
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    logger.error('razorpay webhook failed', { error: (e as Error).message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
