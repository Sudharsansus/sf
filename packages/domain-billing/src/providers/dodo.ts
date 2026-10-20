import { verifyStandardWebhook } from '@isaii/security'
import type { GrantInput } from '../grant'

export type DodoConfig = { apiKey: string; env: 'test' | 'live'; productIds: Record<string, string | undefined> }

export const dodoBase = (env: 'test' | 'live') => (env === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com')

export async function createDodoCheckout(cfg: DodoConfig, productId: string, customer: { email: string; name?: string | null }, returnUrl: string, metadata: { userId: string; productId: string }, fetchImpl: typeof fetch = fetch) {
  const dodoProduct = cfg.productIds[productId]
  if (!dodoProduct) throw new Error(`No Dodo product configured for ${productId}`)
  const res = await fetchImpl(`${dodoBase(cfg.env)}/checkouts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_cart: [{ product_id: dodoProduct, quantity: 1 }], customer: { email: customer.email, name: customer.name ?? undefined }, return_url: returnUrl, metadata }),
  })
  const data = await res.json() as { checkout_url?: string }
  if (!res.ok || !data.checkout_url) throw new Error(`Dodo ${res.status}: ${JSON.stringify(data).slice(0, 200)}`)
  return { url: data.checkout_url }
}

export function dodoProductIdsFromEnv(env: Record<string, string | undefined> = process.env): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(env)) if (k.startsWith('DODO_PRODUCT_')) out[k.slice(13).toLowerCase()] = v
  return out
}

/** Verify and interpret a Dodo (Standard Webhooks) event. Only `payment.succeeded` grants. */
export function parseDodoWebhook(raw: string, headers: { id: string; timestamp: string; signature: string }, secret: string, now?: () => number) {
  if (!verifyStandardWebhook(raw, headers, secret, { now })) return { ok: false as const, reason: 'invalid_signature' as const }
  const ev = JSON.parse(raw) as { type: string; data?: { payment_id?: string; total_amount?: number; currency?: string; metadata?: Record<string, string> } }
  if (ev.type !== 'payment.succeeded') return { ok: true as const, grant: null, event: ev.type }
  const meta = ev.data?.metadata ?? {}
  if (!meta.userId || !meta.productId) return { ok: true as const, grant: null, event: ev.type }
  const grant: Omit<GrantInput, 'provider'> = { paymentRef: ev.data?.payment_id || headers.id, userId: meta.userId, productId: meta.productId, amountMinor: ev.data?.total_amount, currency: ev.data?.currency, raw: ev }
  return { ok: true as const, grant, event: ev.type }
}
