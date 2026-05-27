export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db, episodes, users, workflowLocks } from '@/lib/db'
import { getSession } from '@/lib/session'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { refineLimit } from '@/lib/redis'
import { aiWorker } from '@/lib/workers/ai.worker'
import { audioWorker } from '@/lib/workers/audio.worker'
import { thumbWorker } from '@/lib/workers/thumb.worker'
import { seoWorker } from '@/lib/workers/seo.worker'
import { emitEvent } from '@/lib/events'
import { captureError, events as analyticsEvents } from '@/lib/observability'

export const maxDuration = 300

const STALE_LOCK_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { success: rlOk } = await refineLimit.limit(session.user.email)
    if (!rlOk) return NextResponse.json({ error: 'Too many production requests. Wait before retrying.' }, { status: 429 })

    const { episodeId, selectedAngle, durationLabel, selectedSpeaker } = await req.json()
    if (!episodeId || !selectedAngle) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    const [episode] = await db.select().from(episodes).where(eq(episodes.id, episodeId)).limit(1)
    if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    if (!user || episode.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // ── IDEMPOTENCY + STALE LOCK ──────────────────────────────────────────────
    const lockKey = `refine:${episodeId}:${selectedAngle}:${durationLabel || '30min'}`
    const [lock] = await db.select().from(workflowLocks).where(eq(workflowLocks.idempotencyKey, lockKey)).limit(1)

    if (lock?.status === 'complete' && lock.result) {
      return NextResponse.json(lock.result as any)
    }

    if (lock?.status === 'running') {
      const age = Date.now() - new Date(lock.updatedAt).getTime()
      if (age < STALE_LOCK_MS) return NextResponse.json({ error: 'Production already in progress.' }, { status: 409 })
      await db.update(workflowLocks).set({ status: 'stale', updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, lockKey))
    }

    // ── RESUME: skip completed steps ─────────────────────────────────────────
    const step = episode.agentStep || ''
    const hasAudio  = !!(episode.audioUrl && step.includes('audio_done'))
    const hasThumbs = !!(Array.isArray(episode.thumbnailUrls) && (episode.thumbnailUrls as any[]).length > 0 && step.includes('thumbnails_done'))

    // ── ACQUIRE LOCK ──────────────────────────────────────────────────────────
    try {
      await db.insert(workflowLocks).values({ episodeId, idempotencyKey: lockKey, step: 'refine', status: 'running' })
    } catch {
      await db.update(workflowLocks).set({ status: 'running', result: null, updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, lockKey))
    }

    const allScripts = episode.allScripts as any
    const selectedScript = allScripts?.scripts?.find((s: any) => s.angle === selectedAngle)
    if (!selectedScript) {
      await db.update(workflowLocks).set({ status: 'failed' }).where(eq(workflowLocks.idempotencyKey, lockKey))
      return NextResponse.json({ error: 'Script angle not found' }, { status: 404 })
    }

    await emitEvent('workflow.started', { episodeId, data: { step: 'refine' } })

    // ── STEP 1: REFINE (AI Worker) ────────────────────────────────────────────
    let chosen: any = selectedScript
    try {
      const refinedData = await aiWorker.refine(episodeId, selectedScript, episode.topic, selectedSpeaker)
      chosen = refinedData.refined?.find((r: any) => r.duration_label === (durationLabel || '30min'))
        || refinedData.refined?.[0]
        || selectedScript
    } catch (e: any) {
      logger.warn('Refine agent failed, using original', { error: e.message })
    }

    await db.update(episodes).set({
      selectedScript: chosen, script: chosen,
      title: chosen.title || selectedScript.title, agentStep: 'refined'
    }).where(eq(episodes.id, episodeId))

    // ── STEPS 2+3+4: PARALLEL via isolated workers ────────────────────────────
    await db.update(episodes).set({ agentStep: 'producing', status: 'producing' }).where(eq(episodes.id, episodeId))

    const [audioResult, thumbResult, seoResult] = await Promise.allSettled([
      hasAudio
        ? Promise.resolve({ url: episode.audioUrl! })
        : audioWorker.render(episodeId, chosen.lines || selectedScript.lines).then(r => ({ url: r.url })),

      hasThumbs
        ? Promise.resolve({ urls: episode.thumbnailUrls as string[] })
        : thumbWorker.generate(episodeId, chosen.title || episode.topic, episode.topic),

      seoWorker.generate(episodeId, chosen, episode.topic, chosen.title || episode.topic)
    ])

    const audioUrl      = audioResult.status === 'fulfilled' ? audioResult.value.url       : (episode.audioUrl || '')
    const thumbnailUrls = thumbResult.status === 'fulfilled' ? thumbResult.value.urls       : ((episode.thumbnailUrls as string[]) || [])
    const seoData       = seoResult.status   === 'fulfilled' ? seoResult.value             : {}

    if (audioResult.status === 'rejected') await captureError((audioResult as any).reason, { episodeId, step: 'audio' })
    if (thumbResult.status === 'rejected') await captureError((thumbResult as any).reason, { episodeId, step: 'thumbnails' })

    // Partial failure — some workers failed but we still have usable output
    const status = (audioResult.status === 'rejected' || thumbResult.status === 'rejected')
      ? 'partial_failure' : 'complete'

    await db.update(episodes).set({
      status, agentStep: 'complete',
      audioUrl: audioUrl || undefined,
      thumbnailUrls: thumbnailUrls.length ? thumbnailUrls : undefined,
      seoData: Object.keys(seoData).length ? seoData : undefined,
      duration: chosen.duration_estimate_seconds || 90,
      updatedAt: new Date()
    }).where(eq(episodes.id, episodeId))

    const response = {
      episodeId, shareId: episode.shareId,
      title: chosen.title || episode.topic,
      status, audioUrl, thumbnailUrls, seoData, script: chosen
    }

    await db.update(workflowLocks).set({ status: 'complete', result: response as any, updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, lockKey))
    await emitEvent('workflow.completed', { episodeId })
    await analyticsEvents.workflowComplete(user.id, episodeId, 0)

    return NextResponse.json(response)

  } catch (e: any) {
    await captureError(e, { step: 'refine' })
    logger.error('Refine error', { error: e.message })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

