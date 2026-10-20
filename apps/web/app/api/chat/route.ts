import { NextResponse } from 'next/server'
import * as z from 'zod'
import { chat } from '@isaii/agents'
import { logger } from '@isaii/logger'
import { clientIp } from '@isaii/security'
import { limit } from '@/server/deps'
import { getSession } from '@/server/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const Body = z.object({ messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1) })

export async function POST(req: Request) {
  const session = await getSession()
  const who = session?.user?.email ?? `ip:${clientIp(req.headers)}`
  const { success } = await limit(session ? 'chat:user' : 'chat:anon', session ? 60 : 15, '1 m').limit(who)
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
  const messages = parsed.data.messages.map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content }))

  const encoder = new TextEncoder()
  const send = (c: ReadableStreamDefaultController, data: string) => c.enqueue(encoder.encode(`data: ${data}\n\n`))
  const readable = new ReadableStream({
    async start(controller) {
      try {
        await chat(messages, text => send(controller, JSON.stringify({ text })), { ctx: { userId: session?.user?.id ?? null } })
      } catch (e) {
        logger.error('chat stream failed', { error: (e as Error).message })
        send(controller, JSON.stringify({ text: '\n\nSorry, something went wrong.' }))
      }
      send(controller, '[DONE]')
      controller.close()
    },
  })
  return new NextResponse(readable, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } })
}
