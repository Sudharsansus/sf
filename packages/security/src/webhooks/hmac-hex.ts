import { createHmac, timingSafeEqual } from 'node:crypto'

/** Verify `hex(HMAC_SHA256(secret, body))` — used by Razorpay (x-razorpay-signature). */
export function verifyHmacHex(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'))
  const got = Buffer.from(signature.trim().toLowerCase())
  return expected.length === got.length && timingSafeEqual(expected, got)
}

export const signHmacHex = (rawBody: string, secret: string) => createHmac('sha256', secret).update(rawBody).digest('hex')
