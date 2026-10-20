import { createHmac, timingSafeEqual } from 'node:crypto'

export type StandardWebhookHeaders = { id: string; timestamp: string; signature: string }

const keyFrom = (secret: string) => (secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret))

/** Standard Webhooks (used by Dodo Payments): base64 HMAC over `${id}.${timestamp}.${body}`, `v1,` entries. */
export function verifyStandardWebhook(
  rawBody: string, h: StandardWebhookHeaders, secret: string,
  opts: { toleranceSeconds?: number; now?: () => number } = {},
): boolean {
  const { toleranceSeconds = 300, now = () => Date.now() } = opts
  if (!h.id || !h.timestamp || !h.signature || !secret) return false
  const ts = Number(h.timestamp)
  if (!Number.isFinite(ts) || Math.abs(now() / 1000 - ts) > toleranceSeconds) return false
  const expected = createHmac('sha256', keyFrom(secret)).update(`${h.id}.${h.timestamp}.${rawBody}`).digest()
  return h.signature.split(' ').some(part => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig) return false
    const got = Buffer.from(sig, 'base64')
    return got.length === expected.length && timingSafeEqual(got, expected)
  })
}

export function signStandardWebhook(rawBody: string, id: string, timestamp: string, secret: string) {
  return 'v1,' + createHmac('sha256', keyFrom(secret)).update(`${id}.${timestamp}.${rawBody}`).digest('base64')
}
