export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAuthUrl } from '@/lib/instagram'
import { randomUUID } from 'crypto'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const state = randomUUID()
  await redis.setex(`ig_state:${state}`, 600, session.user.email)
  return NextResponse.redirect(getAuthUrl(state))
}

