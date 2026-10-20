import { verifyHmacHex } from '@isaii/security'
import type { Product } from '../catalogue'
import type { GrantInput } from '../grant'

export type RazorpayConfig = { keyId: string; keySecret: string; webhookSecret?: string }

export async function createRazorpayOrder(cfg: RazorpayConfig, p: Product, notes: { userId: string; productId: string }, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: p.inr * 100, currency: 'INR', receipt: `${p.id}-${Date.now()}`, notes }),
  })
  const order = await res.json() as { id?: string; amount?: number; error?: { description?: string } }
  if (!res.ok || !order.id) throw new Error(`Razorpay ${res.status}: ${order.error?.description ?? 'order failed'}`)
  return { orderId: order.id, amount: order.amount ?? p.inr * 100 }
}

/** Verify and interpret a Razorpay webhook. Only `order.paid` grants anything. */
export function parseRazorpayWebhook(raw: string, signature: string, secret: string): { ok: false; reason: 'invalid_signature' } | { ok: true; grant: Omit<GrantInput, 'provider'> | null; event: string } {
  if (!verifyHmacHex(raw, signature, secret)) return { ok: false, reason: 'invalid_signature' }
  const ev = JSON.parse(raw) as { event: string; payload?: { order?: { entity?: { id: string; amount_paid?: number; currency?: string; notes?: Record<string, string> } } } }
  if (ev.event !== 'order.paid') return { ok: true, grant: null, event: ev.event }
  const order = ev.payload?.order?.entity
  if (!order?.id || !order.notes?.userId || !order.notes?.productId) return { ok: true, grant: null, event: ev.event }
  return { ok: true, event: ev.event, grant: { paymentRef: order.id, userId: order.notes.userId, productId: order.notes.productId, amountMinor: order.amount_paid, currency: order.currency, raw: ev } }
}
