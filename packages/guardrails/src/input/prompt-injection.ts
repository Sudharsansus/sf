const PATTERNS: [RegExp, string][] = [
  [/ignore (all |any )?(previous|prior|above) (instructions?|prompts?|rules)/i, 'override-instructions'],
  [/disregard (your|all|the) (rules|instructions|system)/i, 'override-instructions'],
  [/\b(system|developer) prompt\b/i, 'prompt-exfiltration'],
  [/reveal (your|the) (prompt|instructions)/i, 'prompt-exfiltration'],
  [/\byou are now\b|\bact as (an? )?(unfiltered|jailbroken)/i, 'role-override'],
  [/\bjailbreak\b|\bDAN mode\b/i, 'jailbreak'],
  [/\[INST\]|<<SYS>>|<\|im_start\|>|<\/?system>/i, 'template-injection'],
]

export type InjectionResult = { flagged: boolean; reasons: string[] }

/** Cheap first-line detection of prompt-injection attempts in user topics and uploads. */
export function detectPromptInjection(text: string): InjectionResult {
  const reasons = [...new Set(PATTERNS.filter(([re]) => re.test(text)).map(([, r]) => r))]
  return { flagged: reasons.length > 0, reasons }
}
