import { getPrompt } from '@isaii/prompts'
import { Evaluation, type Scripts } from './schemas'
import { gw, type AgentDeps } from './context'

/** Score scripts. The winner is re-derived from totals so it always names a real angle. */
export async function evaluateScripts(scripts: Scripts, deps?: AgentDeps) {
  const out = await gw(deps).generateJSON('evaluate', {
    system: getPrompt('evaluate', deps?.env).text,
    user: `Evaluate these scripts:\n${JSON.stringify(scripts, null, 2)}`,
    schema: Evaluation,
    ctx: deps?.ctx,
  })
  const angles = new Set(scripts.scripts.map(s => s.angle))
  const ranked = [...out.scores].filter(s => angles.has(s.angle)).sort((a, b) => b.total - a.total)
  return {
    ...out,
    winner: ranked[0]?.angle ?? scripts.scripts[0]?.angle ?? '',
    runner_up: ranked[1]?.angle ?? scripts.scripts[1]?.angle ?? '',
  }
}
