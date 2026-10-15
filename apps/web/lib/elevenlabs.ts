import { logger } from './logger'

const BASE = 'https://api.elevenlabs.io/v1'
const key = () => process.env.ELEVENLABS_API_KEY!

export const VOICE_A = process.env.ELEVENLABS_VOICE_A || '21m00Tcm4TlvDq8ikWAM' // Rachel
export const VOICE_B = process.env.ELEVENLABS_VOICE_B || 'AZnzlk1XvdvUeBnXmlld' // Domi

const TTS_V2 = 'eleven_multilingual_v2'
const TTS_V3 = 'eleven_v3'
const STT_MODEL = process.env.ELEVENLABS_STT_MODEL || 'scribe_v2'

// Multilingual v2 is steadier for these; v3 covers the rest, including Telugu,
// Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia and Urdu.
const V2_LANGS = new Set(['en', 'hi', 'ta', 'es', 'fr', 'de', 'pt', 'ar', 'ja', 'ko', 'it', 'zh'])
export const ttsModelFor = (language = 'en') => (V2_LANGS.has(language) ? TTS_V2 : TTS_V3)
const CONCURRENCY = 4

export type Line = { speaker: string; text: string }

// ── TEXT TO SPEECH ────────────────────────────────────────────────────────────
export async function textToSpeech(
  text: string, voiceId: string, model: string = TTS_V2, context?: { previous?: string; next?: string }
): Promise<Buffer> {
  const res = await fetch(`${BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: model,
      // v3 doesn't accept neighbouring-text context
      ...(model === TTS_V2 ? { previous_text: context?.previous, next_text: context?.next } : {}),
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Render a slice of a script. `offset` is the slice's position in the full script
 * so each line still gets its real neighbours as context. Every line uses the same
 * MP3 encoding, so the buffers concatenate into one playable file.
 */
export async function renderLines(
  all: Line[], offset: number, count: number,
  voices: { A: string; B: string } = { A: VOICE_A, B: VOICE_B },
  language = 'en'
): Promise<Buffer> {
  const model = ttsModelFor(language)
  const slice = all.slice(offset, offset + count)
  const out: Buffer[] = new Array(slice.length)
  let next = 0
  async function worker() {
    while (next < slice.length) {
      const i = next++
      const idx = offset + i
      const line = slice[i]
      out[i] = await textToSpeech(line.text, line.speaker === 'B' ? voices.B : voices.A, model, {
        previous: all[idx - 1]?.text,
        next: all[idx + 1]?.text,
      })
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, slice.length) }, worker))
  logger.info('ElevenLabs rendered', { offset, lines: slice.length, model })
  return Buffer.concat(out)
}

// ── SPEECH TO TEXT (Scribe) ───────────────────────────────────────────────────
type ScribeWord = { text: string; type: string; speaker_id?: string }

/** Transcribe audio and split it into A/B script lines using speaker diarization. */
export async function transcribeToScript(audio: Buffer, mimeType: string): Promise<Line[]> {
  const form = new FormData()
  form.append('model_id', STT_MODEL)
  form.append('file', new Blob([new Uint8Array(audio)], { type: mimeType }), 'audio')
  form.append('diarize', 'true')

  const res = await fetch(`${BASE}/speech-to-text`, {
    method: 'POST',
    headers: { 'xi-api-key': key() },
    body: form,
  })
  if (!res.ok) throw new Error(`ElevenLabs STT ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json() as { text: string; words?: ScribeWord[] }

  // First voice heard becomes A, the second B; any extra voices fold into B.
  const labels = new Map<string, 'A' | 'B'>()
  const label = (id = 'speaker_0') => {
    if (!labels.has(id)) labels.set(id, labels.size === 0 ? 'A' : 'B')
    return labels.get(id)!
  }

  const lines: Line[] = []
  let cur: { speaker: 'A' | 'B'; words: string[] } | null = null
  const flush = () => {
    const text = cur?.words.join('').replace(/\s+/g, ' ').trim()
    if (cur && text) lines.push({ speaker: cur.speaker, text })
    cur = null
  }

  for (const w of data.words ?? []) {
    if (w.type === 'audio_event') continue
    const speaker = label(w.speaker_id)
    if (!cur || cur.speaker !== speaker) { flush(); cur = { speaker, words: [] } }
    cur.words.push(w.text)
    // Keep lines short enough to edit: break after ~35 words at a sentence end.
    const wordCount = cur.words.filter(t => t.trim()).length
    if (wordCount >= 35 && /[.!?]$/.test(w.text)) flush()
  }
  flush()

  if (!lines.length && data.text) lines.push({ speaker: 'A', text: data.text.trim() })
  return lines
}
