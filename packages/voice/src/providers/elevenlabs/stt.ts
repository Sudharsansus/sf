import type { STTProvider, Word } from '../../types'

const BASE = 'https://api.elevenlabs.io/v1'

export class ElevenLabsSTT implements STTProvider {
  readonly name = 'elevenlabs-scribe'
  constructor(private apiKey = process.env.ELEVENLABS_API_KEY ?? '', private model = process.env.ELEVENLABS_STT_MODEL || 'scribe_v2', private fetchImpl: typeof fetch = fetch) {}

  async transcribe(req: { audio: Uint8Array; mimeType: string; language?: string }) {
    const form = new FormData()
    form.append('model_id', this.model)
    form.append('file', new Blob([new Uint8Array(req.audio)], { type: req.mimeType }), 'audio')
    form.append('diarize', 'true')
    if (req.language && !req.language.includes('-')) form.append('language_code', req.language)
    const res = await this.fetchImpl(`${BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': this.apiKey }, body: form })
    if (!res.ok) throw new Error(`ElevenLabs STT ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json() as { text: string; words?: { text: string; type: Word['type']; speaker_id?: string; start?: number; end?: number }[] }
    return { text: data.text, words: (data.words ?? []).map(w => ({ text: w.text, type: w.type, speakerId: w.speaker_id, start: w.start, end: w.end })) }
  }
}
