export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, episodes, users, workflowLocks } from '@sus/db'
import { getSession } from '@/lib/session'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { refineLimit } from '@/lib/redis'
import { inngest } from '@/lib/inngest/client'
import { captureError } from '@/lib/observability'
import { checkGlobalBudget, checkUserHourlyCost, trackUserCost } from '@/lib/budget'

export const maxDuration = 30

// Production runs in the background; a lock older than this is treated as dead.
const STALE_LOCK_MS = 30 * 60 * 1000

const Body = z.object({
  episodeId: z.string().uuid(),
  selectedAngle: z.string().min(1),
  durationLabel: z.string().optional().default('5min'),
  selectedSpeaker: z.enum(['a', 'b', 'both']).optional().default('both'),
  voiceA: z.string().optional(),
  voiceB: z.string().optional(),
  useExistingScript: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { success: rlOk } = await refineLimit.limit(session.user.email)
    if (!rlOk) return NextResponse.json({ error: 'Too many production requests. Wait before retrying.' }, { status: 429 })

    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    const { episodeId, selectedAngle, durationLabel, selectedSpeaker, voiceA, voiceB, useExistingScript } = parsed.data

    const [episode] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
    if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (!user || episode.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const scripts = (episode.allScripts as { scripts?: { angle: string }[] } | null)?.scripts
    if (!useExistingScript && !scripts?.some(s => s.angle === selectedAngle)) return NextResponse.json({ error: 'Script angle not found' }, { status: 404 })

    if (!(await checkGlobalBudget())) return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
    const hourlyCheck = await checkUserHourlyCost(user.id, user.plan)
    if (!hourlyCheck.allowed) return NextResponse.json({ error: hourlyCheck.reason }, { status: 429 })

    // ── IDEMPOTENCY + STALE LOCK ──────────────────────────────────────────────
    const lockKey = `refine:${episodeId}:${selectedAngle}:${durationLabel}`
    const [lock] = await db.select().from(workflowLocks).where(eq(workflowLocks.idempotencyKey, lockKey)).limit(1)

    if (lock?.status === 'complete' && lock.result) return NextResponse.json(lock.result)
    if (lock?.status === 'running' && Date.now() - new Date(lock.updatedAt).getTime() < STALE_LOCK_MS) {
      return NextResponse.json({ episodeId, shareId: episode.shareId, status: 'producing' }, { status: 202 })
    }

    if (lock) {
      await db.update(workflowLocks).set({ status: 'running', result: null, updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, lockKey))
    } else {
      await db.insert(workflowLocks).values({ episodeId, idempotencyKey: lockKey, step: 'refine', status: 'running' })
    }

    await db.update(episodes).set({ status: 'producing', agentStep: 'queued', updatedAt: new Date() }).where(eq(episodes.id, episodeId))
    await inngest.send({
      name: 'episode/produce.requested',
      data: { episodeId, userId: user.id, selectedAngle, durationLabel, selectedSpeaker, lockKey, voiceA, voiceB, useExistingScript },
    })
    await trackUserCost(user.id, 0.20)

    return NextResponse.json({ episodeId, shareId: episode.shareId, status: 'producing' }, { status: 202 })
  } catch (e: any) {
    await captureError(e, { step: 'refine' })
    logger.error('Refine error', { error: e.message })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
