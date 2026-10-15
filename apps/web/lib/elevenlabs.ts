import { logger } from './logger'

const API_KEY = process.env.ELEVENLABS_API_KEY!
const BASE = 'https://api.elevenlabs.io/v1'

const VOICE_A = process.env.ELEVENLABS_VOICE_A || '21m00Tcm4TlvDq8ikWAM' // Rachel
const VOICE_B = process.env.ELEVENLABS_VOICE_B || 'AZnzlk1XvdvUeBnXmlld' // Domi

export async function textToSpeech(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`${BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true }
    })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs error ${res.status}: ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function renderScript(lines: { speaker: string; text: string }[]): Promise<Buffer> {
  logger.info('ElevenLabs rendering', { lines: lines.length })
  const buffers: Buffer[] = []
  const silence = Buffer.alloc(22050) // ~0.5s silence at 44.1kHz

  for (const line of lines) {
    const voiceId = line.speaker === 'A' ? VOICE_A : VOICE_B
    const audio = await textToSpeech(line.text, voiceId)
    buffers.push(audio)
    buffers.push(silence)
    // small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200))
  }

  return Buffer.concat(buffers)
}
