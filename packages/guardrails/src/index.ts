export { detectPromptInjection } from './input/prompt-injection'
export type { InjectionResult } from './input/prompt-injection'
export { checkTopicPolicy } from './input/topic-policy'
export type { PolicyResult } from './input/topic-policy'
export { findPII, maskPII } from './output/pii'
export type { PIIMatch } from './output/pii'

import { detectPromptInjection } from './input/prompt-injection'
import { checkTopicPolicy } from './input/topic-policy'

/** One call for user-submitted topics. */
export function screenTopic(topic: string): { allowed: boolean; reason?: string; injection: string[] } {
  const inj = detectPromptInjection(topic)
  if (inj.flagged) return { allowed: false, reason: 'This topic looks like an attempt to change how ISAII works. Please rephrase it.', injection: inj.reasons }
  const pol = checkTopicPolicy(topic)
  return { ...pol, injection: [] }
}
