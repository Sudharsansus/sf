import { describe, expect, it } from 'vitest'
import { CheckoutResponse, GenerateRequest, ProduceRequest, SaveScriptRequest } from '../src'

describe('contracts', () => {
  it('applies defaults to generate requests', () => {
    expect(GenerateRequest.parse({ topic: 'Why sleep matters' })).toMatchObject({ language: 'en', duration: '5min' })
  })
  it('accepts Indian and code-mixed language codes, rejects junk', () => {
    expect(GenerateRequest.safeParse({ topic: 'abc', language: 'kn' }).success).toBe(true)
    expect(GenerateRequest.safeParse({ topic: 'abc', language: 'hi-en' }).success).toBe(true)
    expect(GenerateRequest.safeParse({ topic: 'abc', language: 'kannada' }).success).toBe(false)
  })
  it('validates produce + script saves', () => {
    expect(ProduceRequest.parse({ episodeId: 'e1', selectedAngle: 'story' }).selectedSpeaker).toBe('both')
    expect(SaveScriptRequest.safeParse({ lines: [{ speaker: 'C', text: 'x' }] }).success).toBe(false)
  })
  it('discriminates checkout responses by provider', () => {
    expect(CheckoutResponse.safeParse({ provider: 'dodo', url: 'https://checkout.example.com/s/1' }).success).toBe(true)
    expect(CheckoutResponse.safeParse({ provider: 'dodo', orderId: 'x' }).success).toBe(false)
  })
})
