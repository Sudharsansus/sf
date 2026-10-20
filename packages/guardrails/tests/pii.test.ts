import { describe, expect, it } from 'vitest'
import { findPII, maskPII } from '../src'

describe('PII', () => {
  it('finds Indian phone numbers, PAN, Aadhaar-like numbers and emails', () => {
    const kinds = findPII('Call +91 98765 43210 or mail a@b.in, PAN ABCDE1234F, id 1234 5678 9012').map(m => m.kind)
    expect(kinds).toEqual(expect.arrayContaining(['indian-phone', 'email', 'pan', 'aadhaar-like']))
  })
  it('masks them', () => {
    expect(maskPII('mail me at a@b.in')).toBe('mail me at [removed]')
  })
  it('leaves normal text alone', () => {
    expect(findPII('The Taj Mahal was finished in 1653.')).toEqual([])
  })
})
