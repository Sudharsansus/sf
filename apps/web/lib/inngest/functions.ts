// ── EPISODE PIPELINE ──────────────────────────────────────────────────────────
// Two durable functions. Each step.run is retried on its own and memoized, so a
// retry never repeats work that already succeeded (or charges for it twice).

import { db, episodes, users, creditsLedger, workflowLocks } from '@sus/db'
import { eq, sql } from 'drizzle-orm'
import { inngest, type GenerateRequested, type ProduceRequested } from './client'
import {
  runResearchAgent, runScriptAgent, runEvaluateAgent, runRefineAgent, runSEOAgent,
  type AllScripts, type SingleScript,
} from '@/lib/claude'
import { renderLines, VOICE_A, VOICE_B, type Line } from '@/lib/elevenlabs'
import { designThumbnails, renderThumbnail } from '@/lib/thumbnails'
import { uploadBuffer } from '@/lib/storage'
import { auditLog } from '@/lib/security'
import { logger } from '@/lib/logger'

const LINES_PER_AUDIO_STEP = 12

const setEpisode = (id: string, values: Partial<typeof episodes.$inferInsert>) =>
  db.update(episodes).set({ ...values, updatedAt: new Date() }).where(eq(episodes.id, id))

// ── GENERATE: research → 5 scripts → scores ───────────────────────────────────
export const generateEpisode = inngest.createFunction(
  {
    id: 'episode-generate',
    retries: 2,
    triggers: [{ event: 'episode/generate.requested' }],
    onFailure: async ({ event, error }) => {
      const d = (event.data as { event: { data: GenerateRequested } }).event.data
      logger.error('Generate failed, refunding', { episodeId: d.episodeId, error: error.message })
      await db.update(users).set({ credits: sql`${users.credits} + ${d.credits}` }).where(eq(users.id, d.userId))
      await db.insert(creditsLedger).values({ userId: d.userId, amount: d.credits, reason: `generate_failure_refund_${d.duration}` })
      await auditLog({ userId: d.userId, action: 'credit.refund', resource: `user:${d.userId}`, metadata: { amount: d.credits, reason: 'generate_failure' } })
      await setEpisode(d.episodeId, { status: 'failed', agentStep: 'failed' })
    },
  },
  async ({ event, step }) => {
    const d = event.data as GenerateRequested
    const ctx = { episodeId: d.episodeId, userId: d.userId }

    const research = await step.run('research', async () => {
      await setEpisode(d.episodeId, { status: 'researching', agentStep: 'research' })
      try {
        const data = await runResearchAgent(d.topic, d.language, ctx)
        await setEpisode(d.episodeId, { researchData: data, agentStep: 'research_done' })
        return data
      } catch (e: any) {
        // Research is helpful but not essential — scripts can still be written from the topic.
        logger.warn('Research failed, continuing without it', { episodeId: d.episodeId, error: e.message })
        return { summary: d.topic, key_facts: [], angles: [], hook: d.topic }
      }
    })

    const allScripts = await step.run('scripts', async () => {
      await setEpisode(d.episodeId, { status: 'scripting', agentStep: 'scripts' })
      const data = await runScriptAgent(d.topic, research, d.language, ctx)
      if (!data.scripts.length) throw new Error('No scripts returned')
      // Language rides along with the scripts so production voices it correctly.
      await setEpisode(d.episodeId, { allScripts: { ...data, language: d.language }, agentStep: 'scripts_done' })
      return data
    })

    const evaluations = await step.run('evaluate', async () => {
      await setEpisode(d.episodeId, { status: 'evaluating', agentStep: 'evaluate' })
      try {
        const data = await runEvaluateAgent(allScripts as AllScripts, ctx)
        await setEpisode(d.episodeId, { evaluations: data, agentStep: 'evaluate_done' })
        return data
      } catch (e: any) {
        logger.warn('Scoring failed, using script order', { episodeId: d.episodeId, error: e.message })
        return { scores: [], winner: allScripts.scripts[0].angle, runner_up: allScripts.scripts[1]?.angle ?? '' }
      }
    })

    await step.run('ready-for-selection', async () => {
      const winner = allScripts.scripts.find(s => s.angle === evaluations.winner) ?? allScripts.scripts[0]
      await setEpisode(d.episodeId, { status: 'awaiting_selection', agentStep: 'awaiting_selection', title: winner.title || d.topic })
    })

    return { episodeId: d.episodeId, winner: evaluations.winner }
  }
)

// ── PRODUCE: refine → voices + thumbnails + SEO in parallel ───────────────────
export const produceEpisode = inngest.createFunction(
  {
    id: 'episode-produce',
    retries: 3,
    concurrency: { key: 'event.data.episodeId', limit: 1 },
    triggers: [{ event: 'episode/produce.requested' }],
    onFailure: async ({ event, error }) => {
      const d = (event.data as { event: { data: ProduceRequested } }).event.data
      logger.error('Produce failed', { episodeId: d.episodeId, error: error.message })
      await setEpisode(d.episodeId, { status: 'failed', agentStep: 'failed' })
      await db.update(workflowLocks).set({ status: 'failed', updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, d.lockKey))
    },
  },
  async ({ event, step }) => {
    const d = event.data as ProduceRequested
    const ctx = { episodeId: d.episodeId, userId: d.userId }

    const script = await step.run('refine', async () => {
      const [ep] = await db.select().from(episodes).where(eq(episodes.id, d.episodeId)).limit(1)
      if (!ep) throw new Error('Episode not found')
      const all = ep.allScripts as AllScripts | null
      const saved = ep.script as { lines?: Line[] } | null
      const selected = d.useExistingScript && saved?.lines?.length
        ? { ...(all?.scripts[0] ?? {}), title: ep.title || ep.topic, lines: saved.lines } as SingleScript
        : all?.scripts.find(s => s.angle === d.selectedAngle) as SingleScript | undefined
      if (!selected) throw new Error('Selected script not found')

      await setEpisode(d.episodeId, { status: 'producing', agentStep: 'refine' })
      let chosen: SingleScript & { duration_label?: string } = selected
      if (!d.useExistingScript) {
        try {
          const refined = await runRefineAgent(selected, ep.topic, d.durationLabel, d.selectedSpeaker, ctx)
          chosen = { ...selected, ...refined }
        } catch (e: any) {
          logger.warn('Refine failed, using selected script', { episodeId: d.episodeId, error: e.message })
        }
      }
      await setEpisode(d.episodeId, { selectedScript: chosen, script: chosen, title: chosen.title, agentStep: 'refined' })
      const language = (ep.allScripts as { language?: string } | null)?.language || 'en'
      return { language, title: chosen.title || ep.topic, topic: ep.topic, lines: chosen.lines.map(l => ({ speaker: l.speaker, text: l.text })), seconds: chosen.duration_estimate_seconds }
    })

    // Voices: one step per chunk keeps every step well under serverless time limits.
    const audio = (async () => {
      const parts: string[] = []
      for (let offset = 0; offset < script.lines.length; offset += LINES_PER_AUDIO_STEP) {
        const n = offset / LINES_PER_AUDIO_STEP
        parts.push(await step.run(`audio-part-${n}`, async () => {
          const buf = await renderLines(script.lines as Line[], offset, LINES_PER_AUDIO_STEP, {
            A: d.voiceA || VOICE_A, B: d.voiceB || VOICE_B,
          }, script.language)
          return uploadBuffer(buf, `episodes/${d.episodeId}/part-${n}.mp3`, 'audio/mpeg')
        }))
      }
      return step.run('audio-merge', async () => {
        const bufs = await Promise.all(parts.map(async url => {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`Could not read audio part ${url}`)
          return Buffer.from(await res.arrayBuffer())
        }))
        const url = await uploadBuffer(Buffer.concat(bufs), `episodes/${d.episodeId}.mp3`, 'audio/mpeg')
        await setEpisode(d.episodeId, { audioUrl: url })
        return url
      })
    })()

    const thumbnails = step.run('thumbnails', async () => {
      const designs = await designThumbnails(script.title, script.topic, ctx)
      const urls = await Promise.all(designs.map(async (v, i) =>
        uploadBuffer(await renderThumbnail(v), `thumbnails/${d.episodeId}_${i}.png`, 'image/png')
      ))
      await setEpisode(d.episodeId, { thumbnailUrls: urls })
      return urls
    })

    const seo = step.run('seo', async () => {
      const data = await runSEOAgent({ lines: script.lines as Line[] }, script.topic, script.title, ctx)
      await setEpisode(d.episodeId, { seoData: data })
      return data
    })

    const [audioRes, thumbRes, seoRes] = await Promise.allSettled([audio, thumbnails, seo])
    if (audioRes.status === 'rejected') throw audioRes.reason // no audio = no episode

    return step.run('finalize', async () => {
      const status = thumbRes.status === 'rejected' || seoRes.status === 'rejected' ? 'partial_failure' : 'complete'
      const [ep] = await db.select().from(episodes).where(eq(episodes.id, d.episodeId)).limit(1)
      await setEpisode(d.episodeId, { status, agentStep: 'complete', duration: script.seconds || 90 })
      const result = {
        episodeId: d.episodeId, shareId: ep?.shareId, title: script.title, status,
        audioUrl: audioRes.value, thumbnailUrls: thumbRes.status === 'fulfilled' ? thumbRes.value : [],
        seoData: seoRes.status === 'fulfilled' ? seoRes.value : {}, script: ep?.script,
      }
      await db.update(workflowLocks).set({ status: 'complete', result, updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, d.lockKey))
      return { episodeId: d.episodeId, status }
    })
  }
)

export const functions = [generateEpisode, produceEpisode]
