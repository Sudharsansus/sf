import { describe, expect, it } from 'vitest'
import { CODE_MIXED, INDIAN_LANGUAGE_COUNT, LANGUAGES, LANGUAGE_COUNT, getLanguage, languageName } from '../src'

describe('languages', () => {
  it('has 21 languages, 11 Indian, unique codes', () => {
    expect(LANGUAGE_COUNT).toBe(21)
    expect(INDIAN_LANGUAGE_COUNT).toBe(11)
    const codes = [...LANGUAGES, ...CODE_MIXED].map(l => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
  it('marks RTL scripts and code-mixed modes', () => {
    expect(getLanguage('ur')?.dir).toBe('rtl')
    expect(getLanguage('hi-en')?.codeMixedWith).toBe('en')
    expect(languageName('ta-en')).toBe('Tanglish')
    expect(languageName('zz')).toBe('zz')
  })
})
