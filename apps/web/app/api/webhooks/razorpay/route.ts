export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacHex } from '@isaii/security'
import { grantPurchase } from '@/lib/billing'
import { logger } from '@isaii/logger'

/** Razorpay webhook — subscribe to `order.paid` in the Razorpay dashboard. */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  if (!verifyHmacHex(raw, req.headers.get('x-razorpay-signature') || '', secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(raw)
    if (event.event !== 'order.paid') return NextResponse.json({ ok: true, ignored: event.event })

    const order = event.payload?.order?.entity
    const notes = order?.notes || {}
    if (!order?.id || !notes.userId || !notes.productId) {
      logger.error('Razorpay order.paid without notes', { orderId: order?.id })
      return NextResponse.json({ ok: true, ignored: 'missing notes' })
    }

    // Keyed by order id: one order can only ever grant once.
    const result = await grantPurchase({
      provider: 'razorpay', paymentRef: order.id, userId: notes.userId, productId: notes.productId,
      amount: order.amount_paid / 100, currency: order.currency,
    })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    logger.error('Razorpay webhook error', { error: e.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
