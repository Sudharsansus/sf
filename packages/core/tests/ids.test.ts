import { describe, expect, it } from 'vitest'
import { newId } from '../src'

describe('newId', () => {
  it('is prefixed, url-safe and unique', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId('ep')))
    expect(ids.size).toBe(500)
    for (const id of ids) expect(id).toMatch(/^ep_[0-9a-z]{20}$/)
  })
})
