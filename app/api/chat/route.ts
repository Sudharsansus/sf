export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { streamGenerate } from '@/lib/ai'
import { CHAT_PROMPT } from '@/lib/prompts'
import { chatLimit, apiLimit } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Auth users get per-user limit; anonymous get per-IP limit
    const session = await auth()
    const limitKey = session?.user?.email
      ? session.user.email
      : (req.headers.get('x-forwarded-for') || 'anon')

    const limiter = session?.user?.email ? chatLimit : apiLimit
    const { success } = await limiter.limit(limitKey)
    if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const safe = messages.slice(-20).map((m: any) => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 2000)
    }))

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          await streamGenerate(CHAT_PROMPT, safe, (text) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e: any) {
          logger.error('Chat stream error', { error: e.message })
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '\n\nSorry, something went wrong.' })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive'
      }
    })
  } catch (e: any) {
    logger.error('Chat error', { error: e.message })
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
