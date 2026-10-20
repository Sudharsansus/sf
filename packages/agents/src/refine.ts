import { getPrompt, languageInstruction } from '@isaii/prompts'
import { Refined, type Script } from './schemas'
import { gw, type AgentDeps } from './context'

export type SpeakerMode = 'a' | 'b' | 'both'

/** Enforce the chosen speaker mode even if the model drifts. */
export function applySpeakerMode<T extends { lines: { speaker: 'A' | 'B'; text: string }[] }>(s: T, mode: SpeakerMode): T {
  if (mode === 'both') return s
  const speaker = mode === 'a' ? 'A' : 'B'
  return { ...s, lines: s.lines.map(l => ({ ...l, speaker })) }
}

export async function refineScript(script: Script, topic: string, durationLabel: string, mode: SpeakerMode = 'both', language = 'en', deps?: AgentDeps) {
  const out = await gw(deps).generateJSON('refine', {
    system: getPrompt('refine', deps?.env).text,
    user: `Topic: ${topic}\nTarget duration: ${durationLabel}\nSpeaker mode: ${mode}\n\nScript:\n${JSON.stringify(script, null, 2)}${languageInstruction(language)}`,
    schema: Refined,
    ctx: deps?.ctx,
  })
  return applySpeakerMode({ ...out, lines: out.lines.filter(l => l.text.trim()) }, mode)
}
