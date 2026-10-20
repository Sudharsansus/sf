import { describe, expect, it } from 'vitest'
import { isCrossOriginBlocked } from '../src'

const base = { allowedOrigins: ['https://isaii.si', 'https://www.isaii.si/'] }

describe('isCrossOriginBlocked', () => {
  it('blocks foreign origins on mutating API calls', () => {
    expect(isCrossOriginBlocked({ ...base, method: 'POST', pathname: '/api/generate', origin: 'https://evil.com' })).toBe(true)
  })
  it('allows same origin, safe methods, webhooks and missing origin', () => {
    expect(isCrossOriginBlocked({ ...base, method: 'POST', pathname: '/api/generate', origin: 'https://www.isaii.si' })).toBe(false)
    expect(isCrossOriginBlocked({ ...base, method: 'GET', pathname: '/api/jobs', origin: 'https://evil.com' })).toBe(false)
    expect(isCrossOriginBlocked({ ...base, method: 'POST', pathname: '/api/webhooks/razorpay', origin: 'https://evil.com' })).toBe(false)
    expect(isCrossOriginBlocked({ ...base, method: 'POST', pathname: '/api/generate', origin: null })).toBe(false)
  })
  it('does not match origins by prefix', () => {
    expect(isCrossOriginBlocked({ ...base, method: 'POST', pathname: '/api/x', origin: 'https://isaii.si.evil.com' })).toBe(true)
  })
})
