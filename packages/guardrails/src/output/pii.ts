const PATTERNS: [RegExp, string][] = [
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'email'],
  [/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g, 'indian-phone'],
  [/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'aadhaar-like'],
  [/\b[A-Z]{5}\d{4}[A-Z]\b/g, 'pan'],
  [/\b(?:\d[ -]?){13,16}\b/g, 'card-like'],
]

export type PIIMatch = { kind: string; value: string }

/** Find personal data in generated text before it is published. */
export function findPII(text: string): PIIMatch[] {
  const out: PIIMatch[] = []
  for (const [re, kind] of PATTERNS) for (const m of text.matchAll(re)) out.push({ kind, value: m[0] })
  return out
}

export function maskPII(text: string): string {
  let masked = text
  for (const [re] of PATTERNS) masked = masked.replace(re, '[removed]')
  return masked
}
