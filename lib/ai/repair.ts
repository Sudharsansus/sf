// ── JSON REPAIR ───────────────────────────────────────────────────────────────
// Fixes malformed JSON from any model before Zod validation

export function repairJSON(raw: string): string {
  let s = raw.trim()

  // Strip markdown fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')

  // Strip leading/trailing non-JSON text
  const firstBrace = s.indexOf('{')
  const firstBracket = s.indexOf('[')
  let start = -1
  if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket)
  else if (firstBrace !== -1) start = firstBrace
  else if (firstBracket !== -1) start = firstBracket

  if (start > 0) s = s.slice(start)

  const lastBrace = s.lastIndexOf('}')
  const lastBracket = s.lastIndexOf(']')
  const end = Math.max(lastBrace, lastBracket)
  if (end !== -1 && end < s.length - 1) s = s.slice(0, end + 1)

  // Fix common model mistakes
  s = s
    .replace(/,\s*([}\]])/g, '$1')           // trailing commas
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"')       // single-quoted values
    .replace(/\n/g, ' ')                        // newlines in strings
    .replace(/\t/g, ' ')                        // tabs

  return s
}

export function safeParseJSON(raw: string): { ok: true; data: any } | { ok: false; error: string } {
  // Try raw first
  try { return { ok: true, data: JSON.parse(raw) } } catch {}

  // Try repaired
  try {
    const repaired = repairJSON(raw)
    return { ok: true, data: JSON.parse(repaired) }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
