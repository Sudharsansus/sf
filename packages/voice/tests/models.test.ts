import { describe, expect, it } from 'vitest'
import { supportsContext, ttsModelFor, TTS_V2, TTS_V3 } from '../src'

describe('ttsModelFor', () => {
  it.each(['te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or', 'ur'])('%s → v3', l => expect(ttsModelFor(l)).toBe(TTS_V3))
  it.each(['en', 'hi', 'ta', 'es', 'ja'])('%s → v2', l => expect(ttsModelFor(l)).toBe(TTS_V2))
  it('routes code-mixed modes to v3', () => {
    expect(ttsModelFor('hi-en')).toBe(TTS_V3)
    expect(ttsModelFor('ta-en')).toBe(TTS_V3)
  })
  it('only v2 takes neighbouring context', () => {
    expect(supportsContext(TTS_V2)).toBe(true)
    expect(supportsContext(TTS_V3)).toBe(false)
  })
})
