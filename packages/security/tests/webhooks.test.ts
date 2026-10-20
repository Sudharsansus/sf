import { describe, expect, it } from 'vitest'
import { signHmacHex, signStandardWebhook, verifyHmacHex, verifyStandardWebhook } from '../src'

const body = JSON.stringify({ event: 'order.paid', id: 'order_1' })

describe('verifyHmacHex (Razorpay)', () => {
  it('accepts a valid signature, rejects tampering and empty input', () => {
    const sig = signHmacHex(body, 's3cret')
    expect(verifyHmacHex(body, sig, 's3cret')).toBe(true)
    expect(verifyHmacHex(body + ' ', sig, 's3cret')).toBe(false)
    expect(verifyHmacHex(body, sig, 'other')).toBe(false)
    expect(verifyHmacHex(body, '', 's3cret')).toBe(false)
  })
})

describe('verifyStandardWebhook (Dodo)', () => {
  const secret = 'whsec_' + Buffer.from('a-very-secret-key').toString('base64')
  const now = () => 1_800_000_000_000
  const ts = String(1_800_000_000)

  it('accepts a valid v1 signature among several', () => {
    const sig = signStandardWebhook(body, 'msg_1', ts, secret)
    expect(verifyStandardWebhook(body, { id: 'msg_1', timestamp: ts, signature: `v1,bogus ${sig}` }, secret, { now })).toBe(true)
  })
  it('rejects tampered body, wrong id and replays outside tolerance', () => {
    const sig = signStandardWebhook(body, 'msg_1', ts, secret)
    expect(verifyStandardWebhook(body + 'x', { id: 'msg_1', timestamp: ts, signature: sig }, secret, { now })).toBe(false)
    expect(verifyStandardWebhook(body, { id: 'msg_2', timestamp: ts, signature: sig }, secret, { now })).toBe(false)
    const late = () => 1_800_000_000_000 + 10 * 60 * 1000
    expect(verifyStandardWebhook(body, { id: 'msg_1', timestamp: ts, signature: sig }, secret, { now: late })).toBe(false)
  })
  it('rejects missing headers', () => {
    expect(verifyStandardWebhook(body, { id: '', timestamp: ts, signature: 'v1,x' }, secret, { now })).toBe(false)
  })
})
