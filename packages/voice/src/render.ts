import type { Line, TTSProvider } from './types'

export type Voices = { A: string; B: string }

/**
 * Render a slice of a script with bounded concurrency. `offset` keeps each line's real
 * neighbours as context. Buffers share one MP3 encoding, so they concatenate cleanly.
 */
export async function renderLines(tts: TTSProvider, opts: { lines: Line[]; offset: number; count: number; voices: Voices; language: string; concurrency?: number }): Promise<Uint8Array> {
  const { lines, offset, count, voices, language, concurrency = 4 } = opts
  const slice = lines.slice(offset, offset + count)
  const out: Uint8Array[] = new Array(slice.length)
  let next = 0
  const worker = async () => {
    while (next < slice.length) {
      const i = next++
      const line = slice[i]!
      out[i] = await tts.synthesize({
        text: line.text, voiceId: line.speaker === 'B' ? voices.B : voices.A, language,
        previous: lines[offset + i - 1]?.text, next: lines[offset + i + 1]?.text,
      })
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, slice.length) }, worker))
  return concat(out)
}

export function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const buf = new Uint8Array(total)
  let at = 0
  for (const p of parts) { buf.set(p, at); at += p.length }
  return buf
}
