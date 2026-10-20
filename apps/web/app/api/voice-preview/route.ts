import * as z from 'zod'
import { AppError, ErrorCode } from '@isaii/core'
import { keys, kv } from '@isaii/cache'
import { DEFAULT_VOICES, ElevenLabsTTS, isKnownVoice } from '@isaii/voice'
import { limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

const Body = z.object({ voice: z.enum(['A', 'B']).optional(), voiceId: z.string().optional(), language: z.string().default('en') })
const TEXT = {
  A: "Hi, I'm your speaker. I'll be guiding our conversation and bringing this topic to life today.",
  B: "And I'm your second speaker. I'll be providing the insights throughout the episode.",
}

/** Short sample of a voice. Cached per voice so repeat previews cost nothing. */
export const POST = route(async (req: Request) => {
  const user = await requireUser()
  if (!(await limit('voice-preview', 20, '1 h').limit(user.id)).success) throw new AppError(ErrorCode.RATE_LIMITED, 'Too many previews. Try again later.')
  const body = await readJson(req, v => Body.parse(v))
  const voiceId = body.voiceId && isKnownVoice(body.voiceId) ? body.voiceId : body.voice === 'B' ? DEFAULT_VOICES.B : DEFAULT_VOICES.A
  if (!isKnownVoice(voiceId)) throw new AppError(ErrorCode.BAD_REQUEST, 'Unknown voice')
  const key = keys.voicePreview(voiceId, 'en')
  const cached = await kv().get<string>(key)
  if (cached) return json({ audio: cached, mimeType: 'audio/mpeg', cached: true })
  const audio = await new ElevenLabsTTS().synthesize({ text: TEXT[body.voice ?? 'A'], voiceId, language: 'en' })
  const base64 = Buffer.from(audio).toString('base64')
  await kv().set(key, base64, { ex: 60 * 60 * 24 * 30 })
  return json({ audio: base64, mimeType: 'audio/mpeg' })
})
