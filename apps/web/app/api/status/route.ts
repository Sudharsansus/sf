import { NextResponse } from 'next/server'
import { getDb, getOwnedEpisode } from '@isaii/db'
import { progressOf } from '@isaii/domain-episodes'
import { getSession } from '@/server/session'
import { findUserByEmail } from '@isaii/db'

export const dynamic = 'force-dynamic'

/** Server-sent progress events (alternative to polling /api/jobs). */
export async function GET(req: Request) {
  const session = await getSession()
  const user = session?.user?.email ? await findUserByEmail(getDb(), session.user.email) : undefined
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const episodeId = new URL(req.url).searchParams.get('episodeId')
  if (!episodeId || !(await getOwnedEpisode(getDb(), episodeId, user.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const encoder = new TextEncoder()
  let closed = false
  const stream = new ReadableStream({
    async start(controller) {
      const tick = async () => {
        if (closed) return
        const ep = await getOwnedEpisode(getDb(), episodeId, user.id)
        if (!ep) { controller.close(); return }
        const progress = progressOf(ep)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: ep.status, audioUrl: ep.audioUrl, title: ep.title, progress })}\n\n`))
        if (progress.finished || progress.failed) { closed = true; controller.close() } else setTimeout(tick, 3000)
      }
      await tick()
    },
    cancel() { closed = true },
  })
  return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } })
}
