import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getRedis } from '@isaii/cache'
import { getDb } from '@isaii/db'

export const dynamic = 'force-dynamic'

async function check(fn: () => Promise<unknown>) {
  const start = Date.now()
  try { await fn(); return { ok: true, latencyMs: Date.now() - start } } catch { return { ok: false, latencyMs: Date.now() - start } }
}

/** Liveness + dependency checks. No secrets or usage data in the response. */
export async function GET() {
  const [db, redis] = await Promise.all([check(() => getDb().execute(sql`select 1`)), check(() => getRedis().ping())])
  const ai = { ok: !!(process.env.ANTHROPIC_API_KEY && process.env.ELEVENLABS_API_KEY) }
  const queue = { ok: !!(process.env.INNGEST_EVENT_KEY || process.env.NODE_ENV !== 'production') }
  const checks = { db, redis, ai, queue }
  const ok = Object.values(checks).every(c => c.ok)
  return NextResponse.json({ status: ok ? 'ok' : 'degraded', ts: Date.now(), checks }, { status: ok ? 200 : 503 })
}
