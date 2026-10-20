// ── BILLING ───────────────────────────────────────────────────────────────────
// One catalogue for both providers: Razorpay (India, ₹ + UPI) and Dodo (international, $).
// Every purchase is granted exactly once, keyed by the provider's order/payment id.

import { db, users, creditsLedger } from '@isaii/db'
import { eq, sql } from 'drizzle-orm'
import { redis } from './redis'
import { auditLog } from './security'
import { logger } from '@isaii/logger'

export type Currency = 'INR' | 'USD'
export type Provider = 'razorpay' | 'dodo'

export type Product = {
  id: string
  kind: 'plan' | 'pack'
  name: string
  credits: number        // minutes of audio
  inr: number            // rupees
  usd: number            // dollars
  plan?: string          // plan to switch to (plans only)
  blurb: string
}

// Prices are one-month passes for plans, one-off for packs.
export const PRODUCTS: Product[] = [
  { id: 'lite',    kind: 'plan', plan: 'lite',    name: 'Lite',    credits: 15,   inr: 399,   usd: 6,   blurb: 'Try it for real' },
  { id: 'starter', kind: 'plan', plan: 'starter', name: 'Starter', credits: 60,   inr: 1299,  usd: 19,  blurb: 'Best for creators' },
  { id: 'pro',     kind: 'plan', plan: 'pro',     name: 'Pro',     credits: 200,  inr: 2999,  usd: 39,  blurb: 'Most popular' },
  { id: 'studio',  kind: 'plan', plan: 'studio',  name: 'Studio',  credits: 600,  inr: 5999,  usd: 79,  blurb: 'For studios' },
  { id: 'agency',  kind: 'plan', plan: 'agency',  name: 'Agency',  credits: 2000, inr: 14999, usd: 199, blurb: 'For agencies' },
  { id: 'pack_30',  kind: 'pack', name: '30 minutes',  credits: 30,  inr: 899,  usd: 12, blurb: 'Top-up' },
  { id: 'pack_60',  kind: 'pack', name: '1 hour',      credits: 60,  inr: 1599, usd: 22, blurb: 'Top-up' },
  { id: 'pack_120', kind: 'pack', name: '2 hours',     credits: 120, inr: 2999, usd: 40, blurb: 'Top-up' },
  { id: 'pack_300', kind: 'pack', name: '5 hours',     credits: 300, inr: 6499, usd: 89, blurb: 'Top-up' },
]

export const getProduct = (id: string) => PRODUCTS.find(p => p.id === id)
export const PLAN_PRODUCTS = PRODUCTS.filter(p => p.kind === 'plan')
export const PACK_PRODUCTS = PRODUCTS.filter(p => p.kind === 'pack')

export function formatPrice(p: Product, currency: Currency) {
  return currency === 'INR' ? `₹${p.inr.toLocaleString('en-IN')}` : `$${p.usd}`
}

/** Dodo product ids live in env, e.g. DODO_PRODUCT_PRO=pdt_abc. */
export const dodoProductId = (productId: string) =>
  process.env[`DODO_PRODUCT_${productId.toUpperCase()}`]

/**
 * Grant a paid product to a user. Idempotent: the same `paymentRef` never
 * grants twice, even if a webhook is delivered many times or by two events.
 */
export async function grantPurchase(opts: {
  provider: Provider; paymentRef: string; userId: string; productId: string; amount?: number; currency?: string
}): Promise<'granted' | 'duplicate' | 'unknown_product' | 'unknown_user'> {
  const product = getProduct(opts.productId)
  if (!product) {
    logger.error('Payment for unknown product — not granted', opts)
    return 'unknown_product'
  }

  const key = `sus:pay:${opts.provider}:${opts.paymentRef}`
  const first = await redis.set(key, '1', { nx: true, ex: 60 * 60 * 24 * 120 })
  if (first === null) return 'duplicate'

  try {
    const updated = await db.update(users)
      .set({
        credits: sql`${users.credits} + ${product.credits}`,
        ...(product.kind === 'plan' && product.plan ? { plan: product.plan } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, opts.userId))
      .returning({ id: users.id })
    if (!updated.length) {
      await redis.del(key)
      logger.error('Payment for unknown user — not granted', opts)
      return 'unknown_user'
    }
    await db.insert(creditsLedger).values({
      userId: opts.userId, amount: product.credits,
      reason: `${opts.provider}:${product.id}:${opts.paymentRef}`,
    })
    await auditLog({
      userId: opts.userId, action: 'credit.purchase', resource: `user:${opts.userId}`,
      metadata: { provider: opts.provider, product: product.id, credits: product.credits, amount: opts.amount, currency: opts.currency, ref: opts.paymentRef },
    })
    logger.info('Purchase granted', { provider: opts.provider, product: product.id, userId: opts.userId })
    return 'granted'
  } catch (e) {
    // Let the provider retry: release the idempotency key.
    await redis.del(key)
    throw e
  }
}
