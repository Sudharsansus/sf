export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyStandardWebhook } from '@isaii/security'
import { grantPurchase } from '@/lib/billing'
import { logger } from '@isaii/logger'

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const id = req.headers.get('webhook-id') || ''
  if (!verifyStandardWebhook(raw, { id, timestamp: req.headers.get('webhook-timestamp') || '', signature: req.headers.get('webhook-signature') || '' }, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const { type, data } = JSON.parse(raw)
    if (type !== 'payment.succeeded') return NextResponse.json({ ok: true, ignored: type })

    const meta = data?.metadata || {}
    if (!meta.userId || !meta.productId) {
      logger.error('Dodo payment without metadata', { paymentId: data?.payment_id })
      return NextResponse.json({ ok: true, ignored: 'missing metadata' })
    }

    const result = await grantPurchase({
      provider: 'dodo', paymentRef: data.payment_id || id,
      userId: meta.userId, productId: meta.productId,
      amount: typeof data.total_amount === 'number' ? data.total_amount / 100 : undefined, currency: data.currency,
    })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    logger.error('Dodo webhook error', { error: e.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
