import { describe, expect, it } from 'vitest'
import { RAZORPAY_CSP, securityHeaders } from '../src'

describe('securityHeaders', () => {
  it('denies framing by default and allows Razorpay when asked', () => {
    const def = securityHeaders().find(h => h.key === 'Content-Security-Policy')!.value
    expect(def).toContain("frame-src 'none'")
    const rp = securityHeaders(RAZORPAY_CSP).find(h => h.key === 'Content-Security-Policy')!.value
    expect(rp).toContain('frame-src https://api.razorpay.com https://checkout.razorpay.com')
    expect(rp).toContain('https://checkout.razorpay.com')
  })
})
