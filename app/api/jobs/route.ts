import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, episodes, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const episodeId = searchParams.get('episodeId')

  if (episodeId) {
    const [ep] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
    if (!ep || ep.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ep)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = (page - 1) * limit

  const eps = await db.select().from(episodes)
    .where(eq(episodes.userId, user.id))
    .orderBy(desc(episodes.createdAt))
    .limit(limit).offset(offset)

  return NextResponse.json({ data: eps, page, limit })
}
