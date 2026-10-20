export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { grantPurchase } from '@/lib/billing'
import { logger } from '@/lib/logger'

const TOLERANCE_S = 5 * 60

/** Standard Webhooks verification, as used by Dodo Payments. */
function verify(raw: string, id: string, timestamp: string, signatureHeader: string, secret: string) {
  if (!id || !timestamp || !signatureHeader) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_S) return false
  const key = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret)
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${raw}`).digest()
  return signatureHeader.split(' ').some(part => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig) return false
    const got = Buffer.from(sig, 'base64')
    return got.length === expected.length && crypto.timingSafeEqual(got, expected)
  })
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const id = req.headers.get('webhook-id') || ''
  if (!verify(raw, id, req.headers.get('webhook-timestamp') || '', req.headers.get('webhook-signature') || '', secret)) {
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
