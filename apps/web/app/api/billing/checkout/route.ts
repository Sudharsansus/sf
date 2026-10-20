export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, users } from '@sus/db'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { getProduct, dodoProductId } from '@/lib/billing'
import { logger } from '@/lib/logger'

const Body = z.object({
  productId: z.string(),
  currency: z.enum(['INR', 'USD']),
})

const DODO_BASE = process.env.DODO_PAYMENTS_ENV === 'live'
  ? 'https://live.dodopayments.com'
  : 'https://test.dodopayments.com'

/** Start a checkout. ₹ goes through Razorpay (UPI, cards, netbanking); $ through Dodo. */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Sign in to buy credits' }, { status: 401 })

  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const product = getProduct(parsed.data.productId)
  if (!product) return NextResponse.json({ error: 'Unknown product' }, { status: 404 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const notes = { userId: user.id, productId: product.id }

  try {
    if (parsed.data.currency === 'INR') {
      const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET
      if (!keyId || !secret) return NextResponse.json({ error: 'INR payments are not configured yet' }, { status: 503 })
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: product.inr * 100, currency: 'INR', receipt: `${product.id}-${Date.now()}`, notes }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(`Razorpay ${res.status}: ${order?.error?.description || 'order failed'}`)
      return NextResponse.json({
        provider: 'razorpay', keyId, orderId: order.id, amount: order.amount, currency: 'INR',
        name: 'ISAII', description: `${product.name} · ${product.credits} min`,
        prefill: { email: user.email, name: user.name ?? undefined },
      })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const dodoProduct = dodoProductId(product.id)
    if (!apiKey || !dodoProduct) return NextResponse.json({ error: 'USD payments are not configured yet' }, { status: 503 })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const res = await fetch(`${DODO_BASE}/checkouts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_cart: [{ product_id: dodoProduct, quantity: 1 }],
        customer: { email: user.email, name: user.name ?? undefined },
        return_url: `${appUrl}/dashboard?paid=1`,
        metadata: notes,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.checkout_url) throw new Error(`Dodo ${res.status}: ${JSON.stringify(data).slice(0, 200)}`)
    return NextResponse.json({ provider: 'dodo', url: data.checkout_url })
  } catch (e: any) {
    logger.error('Checkout failed', { product: product.id, error: e.message })
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 502 })
  }
}
