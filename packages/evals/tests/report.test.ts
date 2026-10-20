import { describe, expect, it } from 'vitest'
import { compare, summarise, toMarkdown, type CaseResult } from '../src'

const r = (agent: string, language: string, pass: boolean[], overall?: number): CaseResult => ({
  agent, caseId: 'c', language, ms: 1, checks: pass.map((p, i) => ({ name: `c${i}`, pass: p })),
  judgement: overall === undefined ? undefined : { overall, scores: [], issues: [] },
})

describe('report', () => {
  it('summarises per agent and language', () => {
    const [s] = summarise([r('scripts', 'kn', [true, false], 8), r('scripts', 'hi', [true, true], 6)])
    expect(s!.checkPassRate).toBe(0.75)
    expect(s!.judgeMean).toBe(7)
    expect(s!.byLanguage.kn!.checkPassRate).toBe(0.5)
  })
  it('flags regressions beyond tolerance only', () => {
    const base = summarise([r('scripts', 'kn', [true, true], 8)])
    expect(compare(base, summarise([r('scripts', 'kn', [true, true], 7.8)]))).toEqual([])
    expect(compare(base, summarise([r('scripts', 'kn', [true, false], 6)])).map(x => x.metric)).toEqual(['checkPassRate', 'judgeMean'])
  })
  it('renders markdown with failures', () => {
    const md = toMarkdown(summarise([r('research', 'ta', [false])]), { model: 'm', costUsd: 0.1, date: 'd', regressions: [] }, [r('research', 'ta', [false])])
    expect(md).toContain('| research | 1 | 0 | 0% |')
    expect(md).toContain('## Failures')
  })
})
