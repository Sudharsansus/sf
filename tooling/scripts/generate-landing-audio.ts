// Generates the landing-page audio clips with ElevenLabs, once.
// Usage (repo root):  npx tsx --env-file=.env tooling/scripts/generate-landing-audio.ts [--force]
// Writes public/landing/audio/convo-{i}.mp3 and greet-{code}.mp3. Commit the results.

import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { CONVO, CONVO_VOICES, GREETINGS, TTS_MODEL_V2, ttsModelFor } from '../../packages/ui/src/landing/audioScript'

const KEY = process.env.ELEVENLABS_API_KEY
if (!KEY) { console.error('Set ELEVENLABS_API_KEY (e.g. in the repo root .env)'); process.exit(1) }

const OUT = join(process.cwd(), 'apps/web/public/landing/audio')
const force = process.argv.includes('--force')
mkdirSync(OUT, { recursive: true })

async function tts(text: string, voice: string, model: string, context?: { previous?: string; next?: string }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text, model_id: model,
      // v3 doesn't take neighbouring-text context
      ...(model === TTS_MODEL_V2 ? { previous_text: context?.previous, next_text: context?.next } : {}),
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return Buffer.from(await res.arrayBuffer())
}

async function save(name: string, make: () => Promise<Buffer>) {
  const file = join(OUT, name)
  if (existsSync(file) && !force) return console.log('skip', name)
  writeFileSync(file, await make())
  console.log('wrote', name)
}

async function main() {
  for (const [i, line] of CONVO.entries()) {
    await save(`convo-${i}.mp3`, () => tts(line.text, CONVO_VOICES[line.speaker], TTS_MODEL_V2, {
      previous: CONVO[i - 1]?.text, next: CONVO[i + 1]?.text,
    }))
  }
  for (const g of GREETINGS) await save(`greet-${g.code}.mp3`, () => tts(g.text, g.voice, ttsModelFor(g.code)))
}
main().catch(e => { console.error(e.message); process.exit(1) })
