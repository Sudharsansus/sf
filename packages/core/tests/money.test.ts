import { describe, expect, it } from 'vitest'
import { formatMoney, fromMajor, toMajor } from '../src'

describe('money', () => {
  it('stores minor units exactly', () => {
    expect(fromMajor(1299, 'INR')).toEqual({ amount: 129900, currency: 'INR' })
    expect(toMajor(fromMajor(0.1 + 0.2, 'USD'))).toBe(0.3)
  })
  it('formats rupees in Indian grouping', () => {
    expect(formatMoney(fromMajor(14999, 'INR'))).toBe('₹14,999')
    expect(formatMoney(fromMajor(19, 'USD'))).toBe('$19')
  })
})
