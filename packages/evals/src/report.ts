import type { CaseResult } from './runners'

export type Summary = {
  agent: string
  cases: number
  errors: number
  checkPassRate: number
  judgeMean: number | null
  byLanguage: Record<string, { cases: number; checkPassRate: number; judgeMean: number | null }>
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export function summarise(results: CaseResult[]): Summary[] {
  const agents = [...new Set(results.map(r => r.agent))]
  return agents.map(agent => {
    const rs = results.filter(r => r.agent === agent)
    const rate = (xs: CaseResult[]) => {
      const checks = xs.flatMap(r => r.checks)
      return checks.length ? checks.filter(c => c.pass).length / checks.length : 0
    }
    const byLanguage: Summary['byLanguage'] = {}
    for (const lang of [...new Set(rs.map(r => r.language))]) {
      const lr = rs.filter(r => r.language === lang)
      byLanguage[lang] = { cases: lr.length, checkPassRate: rate(lr), judgeMean: mean(lr.flatMap(r => (r.judgement ? [r.judgement.overall] : []))) }
    }
    return { agent, cases: rs.length, errors: rs.filter(r => r.error).length, checkPassRate: rate(rs), judgeMean: mean(rs.flatMap(r => (r.judgement ? [r.judgement.overall] : []))), byLanguage }
  })
}

export type Regression = { agent: string; metric: 'checkPassRate' | 'judgeMean'; baseline: number; current: number }

/** Flag drops larger than the tolerance (5 points of pass rate, 0.5 judge points). */
export function compare(baseline: Summary[], current: Summary[]): Regression[] {
  const out: Regression[] = []
  for (const cur of current) {
    const base = baseline.find(b => b.agent === cur.agent)
    if (!base) continue
    if (cur.checkPassRate < base.checkPassRate - 0.05) out.push({ agent: cur.agent, metric: 'checkPassRate', baseline: base.checkPassRate, current: cur.checkPassRate })
    if (base.judgeMean !== null && cur.judgeMean !== null && cur.judgeMean < base.judgeMean - 0.5) out.push({ agent: cur.agent, metric: 'judgeMean', baseline: base.judgeMean, current: cur.judgeMean })
  }
  return out
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const num = (x: number | null) => (x === null ? '—' : x.toFixed(1))

export function toMarkdown(summaries: Summary[], meta: { model: string; costUsd: number; date: string; regressions: Regression[] }, results: CaseResult[]): string {
  const lines = [`# ISAII eval report — ${meta.date}`, '', `Model: \`${meta.model}\` · Spend: $${meta.costUsd.toFixed(3)}`, '']
  lines.push('| Agent | Cases | Errors | Checks passed | Judge (1–10) |', '|---|---|---|---|---|')
  for (const s of summaries) lines.push(`| ${s.agent} | ${s.cases} | ${s.errors} | ${pct(s.checkPassRate)} | ${num(s.judgeMean)} |`)
  for (const s of summaries) {
    lines.push('', `## ${s.agent} by language`, '', '| Language | Cases | Checks | Judge |', '|---|---|---|---|')
    for (const [l, v] of Object.entries(s.byLanguage)) lines.push(`| ${l} | ${v.cases} | ${pct(v.checkPassRate)} | ${num(v.judgeMean)} |`)
  }
  const failures = results.flatMap(r => [...r.checks.filter(c => !c.pass).map(c => `- ${r.agent}/${r.caseId}/${r.language}: **${c.name}** — ${c.detail ?? ''}`), ...(r.error ? [`- ${r.agent}/${r.caseId}/${r.language}: error — ${r.error}`] : [])])
  if (failures.length) lines.push('', '## Failures', '', ...failures)
  if (meta.regressions.length) {
    lines.push('', '## Regressions vs baseline', '')
    for (const r of meta.regressions) lines.push(`- **${r.agent}** ${r.metric}: ${r.baseline.toFixed(2)} → ${r.current.toFixed(2)}`)
  }
  return lines.join('\n') + '\n'
}
