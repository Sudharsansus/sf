import { CheckoutRequest } from '@isaii/contracts'
import { AppError, ErrorCode } from '@isaii/core'
import { createDodoCheckout, createRazorpayOrder, dodoProductIdsFromEnv, getProduct } from '@isaii/domain-billing'
import { logger } from '@isaii/logger'
import { appUrl, json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

/** ₹ → Razorpay order (UPI, cards, netbanking). $ → Dodo hosted checkout. */
export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const body = await readJson(req, v => CheckoutRequest.parse(v))
  const product = getProduct(body.productId)
  if (!product) throw new AppError(ErrorCode.NOT_FOUND, 'Unknown product')
  const notes = { userId: user.id, productId: product.id }
  try {
    if (body.currency === 'INR') {
      const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keyId || !keySecret) throw new AppError(ErrorCode.UNAVAILABLE, 'INR payments are not configured yet')
      const order = await createRazorpayOrder({ keyId, keySecret }, product, notes)
      return json({ provider: 'razorpay', keyId, ...order, currency: 'INR', name: 'ISAII', description: `${product.name} · ${product.credits} min`, prefill: { email: user.email, name: user.name ?? undefined } })
    }
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) throw new AppError(ErrorCode.UNAVAILABLE, 'USD payments are not configured yet')
    const env = process.env.DODO_PAYMENTS_ENV === 'live' ? 'live' : 'test'
    const { url } = await createDodoCheckout({ apiKey, env, productIds: dodoProductIdsFromEnv() }, product.id, { email: user.email, name: user.name }, `${appUrl(req)}/dashboard?paid=1`, notes)
    return json({ provider: 'dodo', url })
  } catch (e) {
    if (e instanceof AppError) throw e
    logger.error('checkout failed', { product: product.id, error: (e as Error).message })
    throw new AppError(ErrorCode.UPSTREAM, 'Could not start checkout. Please try again.')
  }
})
