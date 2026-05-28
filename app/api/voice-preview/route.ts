export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

const voicePreviewLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'sf:voice:user'
})

const VOICE_A = process.env.ELEVENLABS_VOICE_A || '21m00Tcm4TlvDq8ikWAM'
const VOICE_B = process.env.ELEVENLABS_VOICE_B || 'AZnzlk1XvdvUeBnXmlld'

const ALLOWED_VOICE_IDS = [
  '21m00Tcm4TlvDq8ikWAM', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL',
  'ErXwobaYiN019PkySvjV', 'MF3mGyEYCl7XYWbV9V6O', 'TxGEqnHWrfWFTfGW9XjX',
  'VR6AewLTigWG4xSOukaG', 'pNInz6obpgDQGcFmaJgB', 'yoZ06aMxZJJ28mfd3POQ',
  'jBpfuIE2acCO8z3wKNLl', 'onwK4e9ZLuTAKqWW03F9', 'N2lVS1w4EtoT3dr4eOWO',
  'XB0fDUnXU5powFXDhCwa', 'Xb7hH8MSUJpSbSDYk0k2', 'iP95p4xoKVk53GoZ742B',
  'nPczCjzI2devNBz1zQrb'
]

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { success } = await voicePreviewLimit.limit(session.user.email)
    if (!success)
      return NextResponse.json({ error: 'Too many previews. Try again later.' }, { status: 429 })

    const { voice, voiceId: directVoiceId } = await req.json()

    const resolvedId = directVoiceId && ALLOWED_VOICE_IDS.includes(directVoiceId)
      ? directVoiceId
      : voice === 'B' ? VOICE_B : VOICE_A

    if (!ALLOWED_VOICE_IDS.includes(resolvedId))
      return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 })

    const previewText = voice === 'B'
      ? "And I'm your second speaker. I'll be providing the insights throughout the episode."
      : "Hi, I'm your speaker. I'll be guiding our conversation and bringing this topic to life today."

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: previewText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const audioBuffer = await res.arrayBuffer()
    const base64 = Buffer.from(audioBuffer).toString('base64')
    return NextResponse.json({ audio: base64, mimeType: 'audio/mpeg' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
