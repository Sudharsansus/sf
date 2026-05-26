import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, users, episodes, aiRequestLog, auditLogs } from '@/lib/db'
import { isAdmin } from '@/lib/security'
import { getAIStats } from '@/lib/ai'
import { eq, desc, sql, gte } from 'drizzle-orm'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const view = searchParams.get('view') || 'overview'

  if (view === 'overview') {
    const [
      totalUsers,
      totalEpisodes,
      completedEpisodes,
      recentAudit,
      aiStats
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(episodes),
      db.select({ count: sql<number>`count(*)::int` }).from(episodes).where(eq(episodes.status, 'complete')),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(20),
      getAIStats()
    ])

    return NextResponse.json({
      users:            totalUsers[0]?.count || 0,
      episodes:         totalEpisodes[0]?.count || 0,
      completedEpisodes: completedEpisodes[0]?.count || 0,
      recentAudit,
      ai:               aiStats
    })
  }

  if (view === 'users') {
    const allUsers = await db.select({
      id: users.id, email: users.email, name: users.name,
      credits: users.credits, plan: users.plan, role: users.role,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt)).limit(100)
    return NextResponse.json({ users: allUsers })
  }

  return NextResponse.json({ error: 'Unknown view' }, { status: 400 })
}

// Grant/revoke admin, adjust credits
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [admin] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
  if (!admin || !isAdmin(admin)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, action, value } = await req.json()

  if (action === 'set_role') {
    await db.update(users).set({ role: value }).where(eq(users.id, userId))
    logger.info('Admin: set_role', { adminId: admin.id, userId, role: value })
  }

  if (action === 'set_credits') {
    await db.update(users).set({ credits: parseInt(value) }).where(eq(users.id, userId))
    logger.info('Admin: set_credits', { adminId: admin.id, userId, credits: value })
  }

  return NextResponse.json({ ok: true })
}
