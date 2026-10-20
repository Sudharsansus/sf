import type { Line, Word } from './types'

/** Turn diarized words into editable A/B lines. First voice heard = A, second = B, extras fold into B. */
export function wordsToLines(words: Word[], fallbackText = '', maxWords = 35): Line[] {
  const labels = new Map<string, 'A' | 'B'>()
  const label = (id = 'speaker_0') => {
    if (!labels.has(id)) labels.set(id, labels.size === 0 ? 'A' : 'B')
    return labels.get(id)!
  }
  const lines: Line[] = []
  let cur: { speaker: 'A' | 'B'; parts: string[] } | null = null
  const flush = () => {
    const text = cur?.parts.join('').replace(/\s+/g, ' ').trim()
    if (cur && text) lines.push({ speaker: cur.speaker, text })
    cur = null
  }
  for (const w of words) {
    if (w.type === 'audio_event') continue
    const speaker = label(w.speakerId)
    if (!cur || cur.speaker !== speaker) { flush(); cur = { speaker, parts: [] } }
    cur.parts.push(w.text)
    const count = cur.parts.filter(p => p.trim()).length
    if (count >= maxWords && /[.!?।॥]$/.test(w.text)) flush()
  }
  flush()
  if (!lines.length && fallbackText.trim()) lines.push({ speaker: 'A', text: fallbackText.trim() })
  return lines
}
