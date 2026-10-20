import { getPrompt, languageInstruction } from '@isaii/prompts'
import { SEO, type ScriptLine } from './schemas'
import { gw, type AgentDeps } from './context'

export function writeSEO(lines: ScriptLine[], topic: string, title: string, language = 'en', deps?: AgentDeps) {
  return gw(deps).generateJSON('seo', {
    system: getPrompt('seo', deps?.env).text,
    user: `Topic: ${topic}\nTitle: ${title}\n\nScript:\n${JSON.stringify(lines, null, 2)}${languageInstruction(language)}`,
    schema: SEO,
    ctx: deps?.ctx,
  })
}
