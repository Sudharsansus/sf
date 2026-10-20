export type Cue = { start: number; end: number; text: string }
export type TimedLine = { text: string; start?: number; end?: number }

/** Words per second for timing estimates when the TTS gives no timestamps. */
const WPS = 2.6

/** Build caption cues; estimate timings from word counts when real ones are missing. */
export function buildCues(lines: TimedLine[], opts: { maxChars?: number; gapSeconds?: number } = {}): Cue[] {
  const { maxChars = 42, gapSeconds = 0.25 } = opts
  const cues: Cue[] = []
  let t = 0
  for (const line of lines) {
    const words = line.text.trim().split(/\s+/).filter(Boolean)
    if (!words.length) continue
    const start = line.start ?? t
    const end = line.end ?? start + Math.max(1.2, words.length / WPS)
    const chunks: string[] = []
    let cur = ''
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars && cur) { chunks.push(cur); cur = w } else cur = (cur + ' ' + w).trim()
    }
    if (cur) chunks.push(cur)
    const span = (end - start) / chunks.length
    chunks.forEach((text, i) => cues.push({ start: start + i * span, end: start + (i + 1) * span, text }))
    t = end + gapSeconds
  }
  return cues
}

const pad = (n: number, w = 2) => String(Math.floor(n)).padStart(w, '0')
function stamp(s: number, sep: ',' | '.') {
  const ms = Math.round(s * 1000)
  return `${pad(ms / 3_600_000)}:${pad((ms / 60_000) % 60)}:${pad((ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`
}

export const toSRT = (cues: Cue[]) => cues.map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${c.text}\n`).join('\n')
export const toVTT = (cues: Cue[]) => 'WEBVTT\n\n' + cues.map(c => `${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${c.text}\n`).join('\n')
