import { describe, expect, it } from 'vitest'
import { AppError } from '@isaii/core'
import { PRODUCTS, assertCanAfford, creditsFor, formatPrice, getProduct, perMinute } from '../src'

describe('plans', () => {
  it('charges one credit per minute and rejects unknown durations', () => {
    expect(creditsFor('10min')).toBe(10)
    expect(() => creditsFor('7min')).toThrow(AppError)
  })
  it('enforces plan length limits and balances', () => {
    expect(assertCanAfford(10, '5min', 'free')).toBe(5)
    expect(() => assertCanAfford(100, '10min', 'free')).toThrow(/up to 5 minutes/)
    expect(() => assertCanAfford(3, '5min', 'pro')).toThrow(/needs 5 credits/)
    expect(() => assertCanAfford(100, '10min', 'unknown')).toThrow(/up to 5 minutes/)
  })
})
describe('catalogue', () => {
  it('has unique ids and sensible prices', () => {
    expect(new Set(PRODUCTS.map(p => p.id)).size).toBe(PRODUCTS.length)
    for (const p of PRODUCTS) { expect(p.inr).toBeGreaterThan(p.usd); expect(p.credits).toBeGreaterThan(0) }
  })
  it('formats prices and per-minute rates', () => {
    expect(formatPrice(getProduct('agency')!, 'INR')).toBe('₹14,999')
    expect(formatPrice(getProduct('pro')!, 'USD')).toBe('$39')
    expect(perMinute(getProduct('pro')!, 'USD')).toBeCloseTo(0.195)
  })
})
