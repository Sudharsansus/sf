import { NextResponse } from 'next/server'
import { db, users } from '@/lib/db'
import { redis } from '@/lib/redis'
import { getAIStats } from '@/lib/ai'
import { sql } from 'drizzle-orm'

export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {}

  // DB ping
  try {
    const start = Date.now()
    await db.select({ one: sql<number>`1` }).from(users).limit(1)
    checks.db = { ok: true, latencyMs: Date.now() - start }
  } catch {
    checks.db = { ok: false, error: 'DB unreachable' }
  }

  // Redis ping
  try {
    const start = Date.now()
    await redis.ping()
    checks.redis = { ok: true, latencyMs: Date.now() - start }
  } catch {
    checks.redis = { ok: false, error: 'Redis unreachable' }
  }

  // AI provider availability
  const hasAI = !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY)
  checks.ai = {
    ok: hasAI,
    error: hasAI ? undefined : 'No AI provider configured'
  }

  const allOk = Object.values(checks).every(c => c.ok)

  // AI stats from DB (async — don't block health if it fails)
  const aiStats = await getAIStats().catch(() => null)

  return NextResponse.json({
    status:  allOk ? 'ok' : 'degraded',
    version: '2.0.0',
    ts:      Date.now(),
    checks,
    ai:      aiStats
  }, { status: allOk ? 200 : 503 })
}
