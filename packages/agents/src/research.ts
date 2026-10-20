import { getPrompt, languageInstruction } from '@isaii/prompts'
import { Research } from './schemas'
import { gw, type AgentDeps } from './context'

export function research(topic: string, language = 'en', deps?: AgentDeps) {
  return gw(deps).generateJSON('research', {
    system: getPrompt('research', deps?.env).text,
    user: `Research this topic: ${topic}${languageInstruction(language)}`,
    schema: Research,
    ctx: deps?.ctx,
  })
}
