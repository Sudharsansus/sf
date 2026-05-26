export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, episodes, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const episodeId = searchParams.get('episodeId')
  if (!episodeId) return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 })

  const [ep] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
  if (!ep || ep.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (d: object) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`))
      }

      const poll = async () => {
        if (closed) return
        const [cur] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
        if (!cur) { send({ status: 'failed' }); controller.close(); return }
        send({ status: cur.status, audioUrl: cur.audioUrl, title: cur.title })
        if (cur.status === 'complete' || cur.status === 'failed') {
          closed = true; controller.close()
        } else {
          setTimeout(poll, 3000)
        }
      }

      send({ status: ep.status, audioUrl: ep.audioUrl, title: ep.title })
      if (ep.status !== 'complete' && ep.status !== 'failed') {
        setTimeout(poll, 3000)
      } else {
        closed = true; controller.close()
      }
    },
    cancel() { closed = true }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

