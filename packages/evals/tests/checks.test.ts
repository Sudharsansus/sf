import { describe, expect, it } from 'vitest'
import { checkDistinctAngles, checkDuration, checkLanguage, checkLineLength, checkNoPII, EVAL_LANGUAGES, loadAdversarial, loadTopics, runGuardrails } from '../src'

describe('checks', () => {
  it('detects the right script per language', () => {
    expect(checkLanguage(['ಇಂದು ಮೈಸೂರು ಅರಮನೆಯ ಕಥೆ'], 'kn').pass).toBe(true)
    expect(checkLanguage(['Today the story of Mysore Palace'], 'kn').pass).toBe(false)
    expect(checkLanguage(['آج قطب مینار کی کہانی'], 'ur').pass).toBe(true)
    expect(checkLanguage(['今日は富士山の物語です'], 'ja').pass).toBe(true)
  })
  it('allows Latin in code-mixed modes', () => {
    expect(checkLanguage(['आज का topic है startup funding'], 'hi-en').pass).toBe(true)
    expect(checkLanguage(['Today startup funding explained'], 'hi-en').pass).toBe(true)
  })
  it('checks duration, line length, PII and angle diversity', () => {
    expect(checkDuration(20, '5min').pass).toBe(true)
    expect(checkDuration(4, '5min').pass).toBe(false)
    expect(checkLineLength([{ text: 'a '.repeat(60) }]).pass).toBe(false)
    expect(checkNoPII(['call +91 98765 43210']).pass).toBe(false)
    expect(checkDistinctAngles(['a', 'b', 'c', 'd', 'e']).pass).toBe(true)
    expect(checkDistinctAngles(['a', 'a', 'a', 'a', 'a']).pass).toBe(false)
  })
})

describe('datasets', () => {
  it('loads topics and puts Indian languages first', async () => {
    expect((await loadTopics()).length).toBeGreaterThanOrEqual(10)
    expect(EVAL_LANGUAGES.slice(0, 3)).toEqual(['hi', 'ta', 'te'])
    expect(EVAL_LANGUAGES).toContain('hi-en')
  })
  it('guardrail eval passes on the adversarial set', async () => {
    const results = runGuardrails(await loadAdversarial())
    expect(results.every(r => r.checks.every(c => c.pass))).toBe(true)
  })
})
