export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, users, episodes, creditsLedger, workflowLocks } from '@isaii/db'
import { inngest } from '@/lib/inngest/client'
import { planGenerateLimit } from '@/lib/redis'
import { canAffordDuration, checkGlobalBudget, checkUserHourlyCost, trackUserCost, getCostForDuration, getPlan, trackGlobalCost } from '@/lib/budget'
import { eq, sql, and } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { sanitizeInput, auditLog } from '@/lib/security'
import { checkForAbuse } from '@/lib/abuse'
import { events as analyticsEvents } from '@/lib/observability'
import { logger } from '@/lib/logger'

export const maxDuration = 30

const Body = z.object({
  topic:    z.string().min(3).max(200),
  voiceA:   z.string().optional(),
  voiceB:   z.string().optional(),
  language: z.string().optional(),
  duration: z.string().optional().default('5min'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in to generate episodes' }, { status: 401 })
    }

    const body = await req.json()

    // ── IDEMPOTENCY ──────────────────────────────────────────────────────────
    // Client sends Idempotency-Key header. Same key = same response, no double-spend.
    // Key is namespaced to the user so one user cannot replay another's key.
    const clientKey = req.headers.get('Idempotency-Key')
    const idemKey = clientKey
      ? `${session.user.email}:${clientKey.slice(0, 64)}`
      : randomUUID()

    // Check for existing episode with this idempotency key
    const [existingEp] = await db.select().from(episodes)
      .where(eq(episodes.idempotencyKey, idemKey)).limit(1)
    if (existingEp) {
      logger.info('Idempotent replay', { idemKey, episodeId: existingEp.id })
      return NextResponse.json({
        episodeId: existingEp.id,
        shareId: existingEp.shareId,
        status: existingEp.status,
        idempotentReplay: true
      })
    }

    // ── VALIDATE INPUT ───────────────────────────────────────────────────────
    const parsed = Body.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Topic must be 3-200 characters' }, { status: 400 })
    const topic    = sanitizeInput(parsed.data.topic)
    const voiceA   = parsed.data.voiceA
    const voiceB   = parsed.data.voiceB
    const language = parsed.data.language || 'en'
    const duration = parsed.data.duration || '5min'

    // ── CREDIT CHECK + ATOMIC DEDUCTION ──────────────────────────────────────
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)

    // ── ABUSE DETECTION ─────────────────────────────────────────────────────
    const abuseCheck = await checkForAbuse(user?.id || session.user.email, topic)
    if (!abuseCheck.allowed) {
      return NextResponse.json({ error: abuseCheck.reason }, { status: 422 })
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const affordCheck = canAffordDuration(user.credits, duration, user.plan)
    if (!affordCheck.allowed) {
      return NextResponse.json({
        error: affordCheck.reason,
        creditsRequired: affordCheck.required,
        creditsAvailable: user.credits,
        upgrade: user.credits < affordCheck.required
      }, { status: 402 })
    }
    const creditsNeeded = affordCheck.required

    // ── GUARD 1: Global daily budget ─────────────────────────────────────────
    const globalOk = await checkGlobalBudget()
    if (!globalOk) {
      logger.error('Global budget exceeded')
      return NextResponse.json({
        error: 'Service temporarily unavailable. Try again tomorrow.'
      }, { status: 503 })
    }

    // ── GUARD 2: Per-user hourly cost ────────────────────────────────────────
    const hourlyCheck = await checkUserHourlyCost(user.id, user.plan)
    if (!hourlyCheck.allowed) {
      return NextResponse.json({ error: hourlyCheck.reason }, { status: 429 })
    }

    // ── GUARD 3: Plan-aware rate limit ───────────────────────────────────────
    const planLimits = getPlan(user.plan)
    const limiter = planGenerateLimit(user.plan, planLimits.generatesPerHour)
    const { success: rlOk } = await limiter.limit(session.user.email)
    if (!rlOk) return NextResponse.json({
      error: user.plan === 'free'
        ? `Free accounts can generate ${planLimits.generatesPerHour} episodes per hour. Upgrade for more.`
        : `Your plan allows ${planLimits.generatesPerHour} episodes per hour. Please wait a moment.`
    }, { status: 429 })

    // Atomic deduction — WHERE >= creditsNeeded is race-condition-safe.
    const updateResult = await db.update(users)
      .set({ credits: sql`${users.credits} - ${creditsNeeded}`, updatedAt: new Date() })
      .where(and(eq(users.id, user.id), sql`${users.credits} >= ${creditsNeeded}`))
      .returning({ credits: users.credits })

    if (!updateResult.length) {
      return NextResponse.json({
        error: `Not enough credits. Need ${creditsNeeded}, have ${user.credits}.`,
        upgrade: true
      }, { status: 402 })
    }

    await db.insert(creditsLedger).values({ userId: user.id, amount: -creditsNeeded, reason: `generate_${duration}` })
    await auditLog({ userId: user.id, action: 'credit.deduct', resource: `user:${user.id}`, metadata: { amount: -creditsNeeded, reason: 'generate', topic } })

    const episodeCost = getCostForDuration(duration)
    await trackUserCost(user.id, episodeCost)
    await trackGlobalCost(episodeCost)

    // ── CREATE EPISODE (with idempotency key) ────────────────────────────────
    const shareId = randomUUID().replace(/-/g, '')
    const [episode] = await db.insert(episodes).values({
      userId: user.id, topic, title: topic, shareId,
      status: 'processing', agentStep: 'research',
      idempotencyKey: idemKey,
    }).returning()

    // ── QUEUE THE PIPELINE ───────────────────────────────────────────────────
    // Research → scripts → scoring runs in Inngest. If it fails for good,
    // the function's onFailure handler refunds these credits.
    try {
      await inngest.send({
        name: 'episode/generate.requested',
        data: { episodeId: episode.id, userId: user.id, topic, language, duration, credits: creditsNeeded },
      })
    } catch (e: any) {
      logger.error('Could not queue generation, refunding', { error: e.message })
      await db.update(users).set({ credits: sql`${users.credits} + ${creditsNeeded}` }).where(eq(users.id, user.id))
      await db.insert(creditsLedger).values({ userId: user.id, amount: creditsNeeded, reason: `queue_failure_refund_${duration}` })
      await db.update(episodes).set({ status: 'failed', agentStep: 'failed' }).where(eq(episodes.id, episode.id))
      return NextResponse.json({ error: 'Could not start generation. Your credits were refunded.' }, { status: 503 })
    }

    return NextResponse.json({ episodeId: episode.id, shareId: episode.shareId, status: 'processing' }, { status: 202 })

  } catch (e: any) {
    logger.error('Generate error', { error: e.message })
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}

