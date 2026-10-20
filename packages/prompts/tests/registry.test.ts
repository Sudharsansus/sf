import { describe, expect, it } from 'vitest'
import { getPrompt, languageInstruction, promptTasks, promptVersions } from '../src'

describe('prompt registry', () => {
  it('every task has an active, non-empty prompt', () => {
    for (const t of promptTasks) {
      const p = getPrompt(t, {})
      expect(p.text.length).toBeGreaterThan(50)
      expect(p.id).toBe(`${t}@v1`)
      expect(promptVersions(t)).toContain('v1')
    }
  })
  it('resolves explicit and env-pinned versions, rejects unknown ones', () => {
    expect(getPrompt('scripts@v1', {}).id).toBe('scripts@v1')
    expect(() => getPrompt('scripts', { PROMPT_SCRIPTS: 'v9' })).toThrow('scripts@v9')
    expect(() => getPrompt('nope' as never, {})).toThrow('Unknown prompt task')
  })
  it('system prompts are stable (cache prefix)', () => {
    expect(promptTasks.map(t => getPrompt(t, {}).text)).toMatchSnapshot()
  })
})

describe('languageInstruction', () => {
  it('is empty for English and names native script otherwise', () => {
    expect(languageInstruction('en')).toBe('')
    expect(languageInstruction('kn')).toContain('Kannada')
    expect(languageInstruction('kn')).toContain('native script')
    expect(languageInstruction('ur')).toContain('right-to-left')
  })
  it('describes code-mixed modes', () => {
    expect(languageInstruction('hi-en')).toContain('Hinglish')
    expect(languageInstruction('ta-en')).toContain('Tanglish')
  })
})
