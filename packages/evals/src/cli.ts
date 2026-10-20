// npm run eval -- --agents research,scripts --langs hi,ta,kn --n 2 --judge --budget 3 [--baseline]
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { AIGateway, AnthropicProvider, taskConfig, type UsageRecord } from '@isaii/ai-gateway'
import { loadAdversarial, loadTopics } from './datasets'
import { runGuardrails, runResearch, runScripts, runSEO, type CaseResult } from './runners'
import { compare, summarise, toMarkdown, type Summary } from './report'

const arg = (name: string, fallback?: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? (process.argv[i + 1] && !process.argv[i + 1]!.startsWith('--') ? process.argv[i + 1] : 'true') : fallback
}

const agents = (arg('agents', 'guardrails,research,scripts') ?? '').split(',')
const langs = (arg('langs', 'hi,ta,kn') ?? '').split(',')
const n = Number(arg('n', '1'))
const useJudge = arg('judge') === 'true'
const budget = Number(arg('budget', '2'))
const writeBaseline = arg('baseline') === 'true'

let spent = 0
class BudgetExceeded extends Error {}
const gateway = new AIGateway({
  provider: new AnthropicProvider(),
  sinks: [(r: UsageRecord) => { spent += r.costUsd }],
})

async function main() {
  const results: CaseResult[] = []
  if (agents.includes('guardrails')) results.push(...runGuardrails(await loadAdversarial()))
  const topics = (await loadTopics()).slice(0, n)
  const deps = { gateway, useJudge }
  const runners = { research: runResearch, scripts: runScripts, seo: runSEO } as const
  try {
    for (const agent of agents) {
      const run = runners[agent as keyof typeof runners]
      if (!run) continue
      for (const t of topics) for (const lang of langs) {
        if (spent >= budget) throw new BudgetExceeded()
        process.stdout.write(`${agent} ${t.id} ${lang} … `)
        const r = await run(deps, t, lang)
        results.push(r)
        console.log(r.error ? `error: ${r.error}` : `${r.checks.filter(c => c.pass).length}/${r.checks.length} checks${r.judgement ? `, judge ${r.judgement.overall}` : ''} ($${spent.toFixed(3)})`)
      }
    }
  } catch (e) {
    if (!(e instanceof BudgetExceeded)) throw e
    console.log(`\nBudget of $${budget} reached — stopping early.`)
  }

  const summaries = summarise(results)
  const dir = fileURLToPath(new URL('..', import.meta.url))
  const baselinePath = `${dir}baselines/latest.json`
  let baseline: Summary[] = []
  try { baseline = JSON.parse(await readFile(baselinePath, 'utf8')).summaries } catch {}
  const regressions = compare(baseline, summaries)
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const md = toMarkdown(summaries, { model: taskConfig('scripts').model, costUsd: spent, date, regressions }, results)
  await mkdir(`${dir}results`, { recursive: true })
  await writeFile(`${dir}results/${date}.json`, JSON.stringify({ summaries, results }, null, 2))
  await writeFile(`${dir}results/${date}.md`, md)
  if (writeBaseline) {
    await mkdir(`${dir}baselines`, { recursive: true })
    await writeFile(baselinePath, JSON.stringify({ date, model: taskConfig('scripts').model, summaries }, null, 2))
    await writeFile(`${dir}baselines/latest.md`, md)
  }
  console.log('\n' + md)
  if (regressions.length) process.exitCode = 1
}

main().catch(e => { console.error(e); process.exit(1) })
