import { once, keys, type KV } from '@isaii/cache'
import { addCredits, findUserById, recordLedger, recordPayment, type Database } from '@isaii/db'
import { logger } from '@isaii/logger'
import { getProduct } from './catalogue'

export type GrantInput = {
  provider: 'razorpay' | 'dodo'
  paymentRef: string
  userId: string
  productId: string
  amountMinor?: number
  currency?: string
  raw?: unknown
}
export type GrantResult = 'granted' | 'duplicate' | 'unknown_product' | 'unknown_user'

/**
 * Grant a paid product exactly once per provider payment. Two layers of idempotency:
 * a Redis claim (fast path, released on failure so retries work) and the payments table's unique ref.
 */
export async function grantPurchase(deps: { db: Database; kv: KV }, input: GrantInput): Promise<GrantResult> {
  const product = getProduct(input.productId)
  if (!product) {
    logger.error('payment for unknown product — not granted', { ...input, raw: undefined })
    return 'unknown_product'
  }
  const res = await once(deps.kv, keys.payment(input.provider, input.paymentRef), 60 * 60 * 24 * 120, async (): Promise<GrantResult> => {
    if (!(await findUserById(deps.db, input.userId))) return 'unknown_user'
    const fresh = await recordPayment(deps.db, {
      userId: input.userId, provider: input.provider, providerRef: input.paymentRef, productId: product.id,
      amountMinor: input.amountMinor ?? 0, currency: input.currency ?? 'INR', credits: product.credits, raw: input.raw ?? null,
    })
    if (!fresh) return 'duplicate'
    const balance = await addCredits(deps.db, input.userId, product.credits, product.kind === 'plan' ? product.plan : undefined)
    if (balance === null) return 'unknown_user'
    await recordLedger(deps.db, { userId: input.userId, amount: product.credits, reason: `${input.provider}:${product.id}:${input.paymentRef}` })
    logger.info('purchase granted', { provider: input.provider, product: product.id, userId: input.userId })
    return 'granted'
  })
  return res.status === 'duplicate' ? 'duplicate' : res.value
}
