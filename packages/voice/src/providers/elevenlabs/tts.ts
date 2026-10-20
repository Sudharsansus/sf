import type { TTSProvider } from '../../types'
import { supportsContext, ttsModelFor } from './models'

const BASE = 'https://api.elevenlabs.io/v1'

export class ElevenLabsTTS implements TTSProvider {
  readonly name = 'elevenlabs'
  constructor(private apiKey = process.env.ELEVENLABS_API_KEY ?? '', private fetchImpl: typeof fetch = fetch) {}

  modelFor(language: string) { return ttsModelFor(language) }

  async synthesize(req: { text: string; voiceId: string; language: string; previous?: string; next?: string }) {
    const model = this.modelFor(req.language)
    const res = await this.fetchImpl(`${BASE}/text-to-speech/${req.voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': this.apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text: req.text,
        model_id: model,
        ...(supportsContext(model) ? { previous_text: req.previous, next_text: req.next } : {}),
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
      }),
    })
    if (!res.ok) throw new Error(`ElevenLabs TTS ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return new Uint8Array(await res.arrayBuffer())
  }
}
