import { getPrompt, languageInstruction } from '@isaii/prompts'
import { AIOutputError } from '@isaii/ai-gateway'
import { Scripts, type Script } from './schemas'
import { gw, type AgentDeps } from './context'

/** Drop empty lines and make sure both speakers exist. */
export function normaliseScript(s: Script): Script {
  const lines = s.lines.map(l => ({ ...l, text: l.text.trim() })).filter(l => l.text.length > 0)
  const ids = new Set(s.speakers.map(sp => sp.id))
  const speakers = [...s.speakers]
  if (!ids.has('A')) speakers.unshift({ id: 'A', name: 'Host A', personality: 'curious' })
  if (!ids.has('B')) speakers.push({ id: 'B', name: 'Host B', personality: 'expert' })
  return { ...s, lines, speakers }
}

export async function writeScripts(topic: string, researchNotes: unknown, language = 'en', deps?: AgentDeps) {
  const out = await gw(deps).generateJSON('scripts', {
    system: getPrompt('scripts', deps?.env).text,
    user: `Topic: ${topic}\n\nResearch:\n${JSON.stringify(researchNotes, null, 2)}${languageInstruction(language)}`,
    schema: Scripts,
    ctx: deps?.ctx,
  })
  const scripts = out.scripts.map(normaliseScript).filter(s => s.lines.length >= 2)
  if (!scripts.length) throw new AIOutputError('scripts', 'no usable scripts')
  return { scripts }
}
