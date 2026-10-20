import type { Script } from './languages'
import { SCRIPT_RANGES } from './scripts'

const inRange = (cp: number, [a, b]: [number, number]) => cp >= a && cp <= b

/** Count letters per script; returns the dominant script and its share of letters. */
export function detectScript(text: string): { script: Script | 'unknown'; share: number } {
  const counts = new Map<Script, number>()
  let letters = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    let found: Script | undefined
    for (const [s, range] of Object.entries(SCRIPT_RANGES) as [Script, [number, number]][]) {
      if (inRange(cp, range)) { found = s; break }
    }
    if (!found && inRange(cp, [0x3040, 0x30ff])) found = 'Jpan'
    if (!found && inRange(cp, [0x4e00, 0x9fff])) found = 'Hans'
    if (!found) continue
    letters++
    counts.set(found, (counts.get(found) ?? 0) + 1)
  }
  if (!letters) return { script: 'unknown', share: 0 }
  const [script, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!
  return { script, share: n / letters }
}

/** True when the text is mostly in the expected script (Latin allowed for code-mixed modes). */
export function isInScript(text: string, expected: Script, minShare = 0.6): boolean {
  const { script, share } = detectScript(text)
  return script === expected && share >= minShare
}
