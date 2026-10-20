import { describe, expect, it } from 'vitest'
import { costUsd, taskConfig } from '../src'

describe('taskConfig', () => {
  it('uses defaults and per-task overrides, ignoring invalid effort', () => {
    expect(taskConfig('refine', {})).toEqual({ model: 'claude-opus-5-5', effort: 'high', maxTokens: 64_000 })
    expect(taskConfig('seo', { AI_MODEL_SEO: 'claude-haiku-5-5' }).model).toBe('claude-haiku-5-5')
    expect(taskConfig('seo', { AI_EFFORT_SEO: 'extreme' }).effort).toBe('low')
  })
})
describe('costUsd', () => {
  it('prices input, output and cache reads', () => {
    const u = { inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 0 }
    expect(costUsd('claude-opus-5-5', u)).toBeCloseTo(4 + 20 + 0.2)
    expect(costUsd('unknown-model', u)).toBeCloseTo(24.2)
  })
})
