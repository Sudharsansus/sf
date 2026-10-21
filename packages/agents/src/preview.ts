import { getPrompt, languageInstruction } from '@isaii/prompts'
import { Preview } from './schemas'
import { gw, type AgentDeps } from './context'

/** Short two-host teaser for anonymous visitors. Empty lines are dropped. */
export async function writePreview(topic: string, language = 'en', deps?: AgentDeps): Promise<Preview> {
  const out = await gw(deps).generateJSON('preview', {
    system: getPrompt('preview', deps?.env).text,
    user: `Topic: ${topic}${languageInstruction(language)}`,
    schema: Preview,
    ctx: deps?.ctx,
  })
  return { title: out.title.trim(), lines: out.lines.map(l => ({ ...l, text: l.text.trim() })).filter(l => l.text) }
}
