import { describe, expect, it } from 'vitest'
import { buildOpenAPI } from '../src'

describe('buildOpenAPI', () => {
  it('produces a stable document', () => {
    const doc = buildOpenAPI()
    expect(doc.openapi).toBe('3.0.3')
    expect(Object.keys(doc.paths)).toEqual(['/v1/generations', '/v1/episodes/{id}', '/v1/episodes/{id}/produce', '/v1/billing/checkout'])
    expect(JSON.stringify(doc)).toMatchSnapshot()
  })
})
