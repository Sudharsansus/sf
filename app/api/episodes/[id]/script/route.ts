export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db, users, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [user] = await db.select().from(users)
      .where(eq(users.email, session.user.email)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [episode] = await db.select().from(episodes)
      .where(eq(episodes.id, params.id)).limit(1)
    if (!episode || episode.userId !== user.id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { lines, title } = await req.json()
    if (!Array.isArray(lines) || lines.length === 0)
      return NextResponse.json({ error: 'Invalid script lines' }, { status: 400 })

    // Validate lines
    const validLines = lines.filter(l =>
      l && typeof l.speaker === 'string' &&
      ['A', 'B'].includes(l.speaker) &&
      typeof l.text === 'string' &&
      l.text.trim().length > 0
    ).map(l => ({ speaker: l.speaker, text: l.text.trim().slice(0, 500) }))

    if (validLines.length === 0)
      return NextResponse.json({ error: 'No valid lines' }, { status: 400 })

    await db.update(episodes).set({
      script: { lines: validLines },
      title: title || episode.title,
      status: 'awaiting_selection',
      agentStep: 'script_edited',
      updatedAt: new Date()
    }).where(eq(episodes.id, params.id))

    return NextResponse.json({ ok: true, lines: validLines.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
