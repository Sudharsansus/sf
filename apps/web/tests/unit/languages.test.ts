import { describe, expect, it } from 'vitest'
import { LANGUAGES, INDIAN_LANGUAGE_COUNT, LANGUAGE_COUNT, languageName } from '@/lib/languages'

describe('languages', () => {
  it('lists 21 languages, 11 of them Indian', () => {
    expect(LANGUAGE_COUNT).toBe(21)
    expect(INDIAN_LANGUAGE_COUNT).toBe(11)
  })
  it('has unique codes', () => {
    expect(new Set(LANGUAGES.map(l => l.code)).size).toBe(LANGUAGES.length)
  })
  it('resolves names and falls back to the code', () => {
    expect(languageName('kn')).toBe('Kannada')
    expect(languageName('xx')).toBe('xx')
  })
})
