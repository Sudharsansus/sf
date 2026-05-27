export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

const VOICE_A = process.env.ELEVENLABS_VOICE_A || '21m00Tcm4TlvDq8ikWAM'
const VOICE_B = process.env.ELEVENLABS_VOICE_B || 'AZnzlk1XvdvUeBnXmlld'

export async function POST(req: NextRequest) {
  try {
    const { voice } = await req.json()
    const voiceId = voice === 'A' ? VOICE_A : VOICE_B

    const previewText = voice === 'A'
      ? "Hi, I'm your first speaker. I'll be asking the questions and guiding our conversation today."
      : "And I'm your second speaker. I'll be providing the insights and expertise throughout the episode."

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
