import { describe, expect, it } from 'vitest'
import { recordAIUsage, recordStep, withSpan } from '../src'

describe('telemetry (no SDK registered = no-op)', () => {
  it('records metrics without throwing', () => {
    expect(() => recordAIUsage({ task: 'scripts', model: 'm', inputTokens: 10, outputTokens: 5, costUsd: 0.01 })).not.toThrow()
    expect(() => recordStep('research', 1200, true)).not.toThrow()
  })
  it('withSpan returns the value and rethrows errors', async () => {
    await expect(withSpan('ok', {}, async () => 42)).resolves.toBe(42)
    await expect(withSpan('bad', {}, async () => { throw new Error('x') })).rejects.toThrow('x')
  })
})
