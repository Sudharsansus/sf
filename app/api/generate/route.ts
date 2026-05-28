export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, users, episodes, creditsLedger, workflowLocks } from '@/lib/db'
import { runResearchAgent, runScriptAgent, runEvaluateAgent } from '@/lib/claude'
import { generateLimit } from '@/lib/redis'
import { eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { sanitizeInput, auditLog } from '@/lib/security'
import { checkForAbuse } from '@/lib/abuse'
import { events as analyticsEvents } from '@/lib/observability'
import { logger } from '@/lib/logger'

export const maxDuration = 300

const Body = z.object({
  topic:    z.string().min(3).max(200),
  voiceA:   z.string().optional(),
  voiceB:   z.string().optional(),
  language: z.string().optional(),
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
    const idemKey = req.headers.get('Idempotency-Key') || randomUUID()

    // Check for existing episode with this idempotency key
    const [existingEp] = await db.select().from(episodes)
      .where(eq(episodes.idempotencyKey, idemKey)).limit(1)
    if (existingEp) {
      logger.info('Idempotent replay', { idemKey, episodeId: existingEp.id })
      return NextResponse.json({
        episodeId: existingEp.id,
        shareId: existingEp.shareId,
        status: existingEp.status,
        scripts: (existingEp.allScripts as any)?.scripts || [],
        evaluations: (existingEp.evaluations as any)?.scores || [],
        winner: (existingEp.evaluations as any)?.winner || '',
        research: existingEp.researchData,
        idempotentReplay: true
      })
    }

    // ── RATE LIMIT ───────────────────────────────────────────────────────────
    const { success } = await generateLimit.limit(session.user.email)
    if (!success) return NextResponse.json({ error: 'Too many requests. Wait a minute.' }, { status: 429 })

    // ── VALIDATE INPUT ───────────────────────────────────────────────────────
    const parsed = Body.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Topic must be 3-200 characters' }, { status: 400 })
    const topic    = sanitizeInput(parsed.data.topic)
    const voiceA   = parsed.data.voiceA
    const voiceB   = parsed.data.voiceB
    const language = parsed.data.language || 'en'

    // ── CREDIT CHECK + ATOMIC DEDUCTION ──────────────────────────────────────
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)

    // ── ABUSE DETECTION ─────────────────────────────────────────────────────
    const abuseCheck = await checkForAbuse(user?.id || session.user.email, topic)
    if (!abuseCheck.allowed) {
      return NextResponse.json({ error: abuseCheck.reason }, { status: 422 })
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.credits < 1) return NextResponse.json({ error: 'No credits remaining. Please upgrade.' }, { status: 402 })

    // Atomic deduction — row-level check prevents race condition
    const updateResult = await db.update(users)
      .set({ credits: sql`${users.credits} - 1`, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning({ credits: users.credits })

    // If credits went negative somehow (race), refund and reject
    if (updateResult[0]?.credits < 0) {
      await db.update(users).set({ credits: sql`${users.credits} + 1` }).where(eq(users.id, user.id))
      return NextResponse.json({ error: 'No credits remaining.' }, { status: 402 })
    }

    await db.insert(creditsLedger).values({ userId: user.id, amount: -1, reason: 'generate_v2' })
    await auditLog({ userId: user.id, action: 'credit.deduct', resource: `user:${user.id}`, metadata: { amount: -1, reason: 'generate', topic } })

    // ── CREATE EPISODE (with idempotency key) ────────────────────────────────
    const shareId = randomUUID().replace(/-/g, '').slice(0, 12)
    const [episode] = await db.insert(episodes).values({
      userId: user.id, topic, title: topic, shareId,
      status: 'processing', agentStep: 'research',
      idempotencyKey: idemKey,
    }).returning()

    // ── STEP 1: RESEARCH (Groq — fast + cheap) ───────────────────────────────
    let researchData: any = { summary: topic, key_facts: [], angles: [], hook: topic }
    try {
      researchData = await runResearchAgent(topic, language)
      await db.update(episodes).set({ researchData, agentStep: 'research_done' }).where(eq(episodes.id, episode.id))
    } catch (e: any) {
      logger.warn('Research failed, using stub', { error: e.message })
      // Non-fatal — continue with stub research
    }

    // ── STEP 2: GENERATE 5 SCRIPTS (Claude — quality matters) ────────────────
    let allScripts: any
    try {
      await db.update(episodes).set({ agentStep: 'scripts' }).where(eq(episodes.id, episode.id))
      allScripts = await runScriptAgent(topic, researchData, language)
      await db.update(episodes).set({ allScripts, agentStep: 'scripts_done' }).where(eq(episodes.id, episode.id))
    } catch (e: any) {
      logger.error('Script agent failed', { error: e.message })
      // FATAL — refund and fail
      await db.update(users).set({ credits: sql`${users.credits} + 1` }).where(eq(users.id, user.id))
      await db.insert(creditsLedger).values({ userId: user.id, amount: 1, reason: 'script_failure_refund' })
    await auditLog({ userId: user.id, action: 'credit.refund', resource: `user:${user.id}`, metadata: { amount: 1, reason: 'script_failure' } })
      await db.update(episodes).set({ status: 'failed', agentStep: 'failed' }).where(eq(episodes.id, episode.id))
      return NextResponse.json({ error: `Script generation failed: ${e.message}` }, { status: 500 })
    }

    // ── STEP 3: EVALUATE (GPT-4o-mini — cheap + structured) ─────────────────
    let evaluations: any = { winner: allScripts.scripts[0]?.angle, runner_up: allScripts.scripts[1]?.angle, scores: [] }
    try {
      await db.update(episodes).set({ agentStep: 'evaluate' }).where(eq(episodes.id, episode.id))
      evaluations = await runEvaluateAgent(allScripts)
      await db.update(episodes).set({ evaluations, agentStep: 'evaluate_done' }).where(eq(episodes.id, episode.id))
    } catch (e: any) {
      logger.warn('Evaluate failed, using default ranking', { error: e.message })
      // Non-fatal — continue with first script as winner
    }

    const winnerAngle = evaluations?.winner || allScripts.scripts[0]?.angle
    const winnerScript = allScripts.scripts.find((s: any) => s.angle === winnerAngle) || allScripts.scripts[0]

    await db.update(episodes).set({
      status: 'awaiting_selection',
      agentStep: 'awaiting_selection',
      title: winnerScript?.title || topic,
      updatedAt: new Date()
    }).where(eq(episodes.id, episode.id))

    logger.info('Generate complete — awaiting user selection', { episodeId: episode.id, winner: winnerAngle })

    return NextResponse.json({
      episodeId: episode.id,
      shareId: episode.shareId,
      status: 'awaiting_selection',
      research: researchData,
      scripts: allScripts.scripts,
      evaluations: evaluations?.scores || [],
      winner: winnerAngle,
      runnerUp: evaluations?.runner_up
    })

  } catch (e: any) {
    logger.error('Generate error', { error: e.message })
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}

