import { detectScript, getLanguage } from '@isaii/i18n'
import { findPII } from '@isaii/guardrails'
import { DURATION_CREDITS } from '@isaii/domain-billing/plans'

export type CheckResult = { name: string; pass: boolean; detail?: string }

/** Is the text mostly in the language's script? Code-mixed modes allow Latin alongside. */
export function checkLanguage(texts: string[], language: string): CheckResult {
  const lang = getLanguage(language)
  if (!lang) return { name: 'language', pass: false, detail: `unknown language ${language}` }
  const joined = texts.join(' ')
  const { script, share } = detectScript(joined)
  if (lang.codeMixedWith) {
    const ok = script === lang.script || script === 'Latn'
    return { name: 'language', pass: ok, detail: `dominant ${script} (${Math.round(share * 100)}%)` }
  }
  const expected = lang.script === 'Jpan' ? ['Jpan', 'Hans'] : [lang.script]
  const ok = expected.includes(script) && share >= 0.6
  return { name: 'language', pass: ok, detail: `expected ${lang.script}, got ${script} (${Math.round(share * 100)}%)` }
}

/** About 15 seconds per line: allow ±40% of the target. */
export function checkDuration(lineCount: number, durationLabel: string): CheckResult {
  const minutes = DURATION_CREDITS[durationLabel] ?? 5
  const target = (minutes * 60) / 15
  const ok = lineCount >= target * 0.6 && lineCount <= target * 1.4
  return { name: 'duration', pass: ok, detail: `${lineCount} lines for ${durationLabel} (target ≈${target})` }
}

export function checkLineLength(lines: { text: string }[], maxWords = 45): CheckResult {
  const long = lines.filter(l => l.text.trim().split(/\s+/).length > maxWords).length
  return { name: 'line-length', pass: long === 0, detail: long ? `${long} lines over ${maxWords} words` : undefined }
}

export function checkNoPII(texts: string[]): CheckResult {
  const hits = texts.flatMap(t => findPII(t))
  return { name: 'no-pii', pass: hits.length === 0, detail: hits.length ? hits.map(h => h.kind).join(', ') : undefined }
}

export function checkDistinctAngles(angles: string[], expected = 5): CheckResult {
  const unique = new Set(angles).size
  return { name: 'distinct-angles', pass: unique >= Math.min(expected, angles.length) && angles.length >= expected - 1, detail: `${unique} unique of ${angles.length}` }
}
