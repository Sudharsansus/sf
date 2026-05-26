import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [user] = await db.select({ credits: users.credits, plan: users.plan }).from(users).where(eq(users.email, session.user.email)).limit(1)
  return NextResponse.json(user || { credits: 0, plan: 'free' })
}
