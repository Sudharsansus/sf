import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAIStats } from '@/lib/ai'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stats = await getAIStats()
  return NextResponse.json(stats)
}
