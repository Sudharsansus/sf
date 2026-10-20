import { research, writeScripts, writeSEO, type AgentDeps } from '@isaii/agents'
import { screenTopic } from '@isaii/guardrails'
import { checkDistinctAngles, checkLanguage, checkLineLength, checkNoPII, type CheckResult } from './checks'
import { judge, type Judgement } from './judge'
import type { AIGateway } from '@isaii/ai-gateway'
import type { AdversarialCase, TopicCase } from './datasets'

export type CaseResult = { agent: string; caseId: string; language: string; checks: CheckResult[]; judgement?: Judgement; error?: string; ms: number }

export type RunDeps = { gateway: AIGateway; useJudge: boolean }

const agentDeps = (d: RunDeps): AgentDeps => ({ gateway: d.gateway })

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const t = Date.now(); const v = await fn(); return [v, Date.now() - t]
}

export async function runResearch(d: RunDeps, c: TopicCase, language: string): Promise<CaseResult> {
  try {
    const [out, ms] = await timed(() => research(c.topic, language, agentDeps(d)))
    const texts = [out.summary, ...out.key_facts, out.hook]
    const checks = [checkLanguage(texts, language), checkNoPII(texts)]
    const judgement = d.useJudge ? await judge(d.gateway, 'research', out, `Topic: ${c.topic}\nLanguage: ${language}`) : undefined
    return { agent: 'research', caseId: c.id, language, checks, judgement, ms }
  } catch (e) {
    return { agent: 'research', caseId: c.id, language, checks: [], error: (e as Error).message, ms: 0 }
  }
}

export async function runScripts(d: RunDeps, c: TopicCase, language: string): Promise<CaseResult> {
  try {
    const [out, ms] = await timed(() => writeScripts(c.topic, { summary: c.topic }, language, agentDeps(d)))
    const lines = out.scripts.flatMap(s => s.lines)
    const texts = lines.map(l => l.text)
    const checks = [checkLanguage(texts, language), checkLineLength(lines), checkDistinctAngles(out.scripts.map(s => s.angle)), checkNoPII(texts)]
    const judgement = d.useJudge ? await judge(d.gateway, 'scripts', out, `Topic: ${c.topic}\nLanguage: ${language}`) : undefined
    return { agent: 'scripts', caseId: c.id, language, checks, judgement, ms }
  } catch (e) {
    return { agent: 'scripts', caseId: c.id, language, checks: [], error: (e as Error).message, ms: 0 }
  }
}

export async function runSEO(d: RunDeps, c: TopicCase, language: string): Promise<CaseResult> {
  try {
    const lines = [{ speaker: 'A' as const, text: c.topic }, { speaker: 'B' as const, text: 'Tell me more.' }]
    const [out, ms] = await timed(() => writeSEO(lines, c.topic, c.topic, language, agentDeps(d)))
    const texts = [out.youtube.description, out.instagram.caption, out.linkedin]
    const checks = [checkLanguage(texts, language), { name: 'yt-title-length', pass: out.youtube.title.length <= 100, detail: `${out.youtube.title.length} chars` }, checkNoPII(texts)]
    const judgement = d.useJudge ? await judge(d.gateway, 'seo', out, `Topic: ${c.topic}\nLanguage: ${language}`) : undefined
    return { agent: 'seo', caseId: c.id, language, checks, judgement, ms }
  } catch (e) {
    return { agent: 'seo', caseId: c.id, language, checks: [], error: (e as Error).message, ms: 0 }
  }
}

/** Free (no AI): guardrails must block attacks and allow lookalike benign topics. */
export function runGuardrails(cases: AdversarialCase[]): CaseResult[] {
  return cases.map(c => {
    const r = screenTopic(c.topic)
    const got = r.allowed ? 'allowed' : 'blocked'
    return { agent: 'guardrails', caseId: c.id, language: 'en', ms: 0, checks: [{ name: 'expected-outcome', pass: got === c.expect, detail: `expected ${c.expect}, got ${got}` }] }
  })
}
