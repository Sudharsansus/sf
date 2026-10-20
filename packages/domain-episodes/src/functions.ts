import { failWorkflowLock, getDb, updateEpisode } from '@isaii/db'
import { refundCredits } from '@isaii/domain-billing'
import { audit } from '@isaii/domain-identity'
import { isEnabled } from '@isaii/flags'
import { inngest, type EventData } from '@isaii/queue'
import { getStore } from '@isaii/storage'
import { ElevenLabsTTS } from '@isaii/voice'
import { logger } from '@isaii/logger'
import type { Scripts } from '@isaii/agents'
import { evaluateStep, readyStep, researchStep, scriptsStep } from './pipeline/generate-steps'
import {
  audioMergeStep, audioPartCount, audioPartStep, finalizeStep, refineStep, seoStep, thumbnailsStep, type ChosenScript,
} from './pipeline/produce-steps'

type FailureArgs<T> = { event: { data: { event: { data: T } } }; error: Error }

/** research → 5 scripts → scores. A permanent failure refunds the credits. */
export const generateEpisode = inngest.createFunction(
  {
    id: 'episode-generate',
    retries: 2,
    triggers: [{ event: 'episode/generate.requested' }],
    onFailure: async ({ event, error }: FailureArgs<EventData<'episode/generate.requested'>>) => {
      const d = event.data.event.data
      const db = getDb()
      logger.error('generation failed — refunding', { episodeId: d.episodeId, error: error.message })
      await refundCredits(db, d.userId, d.credits, `generate_failure_${d.duration}`)
      await audit(db, { userId: d.userId, action: 'credit.refund', resource: `episode:${d.episodeId}`, metadata: { amount: d.credits, reason: 'generate_failure' } })
      await updateEpisode(db, d.episodeId, { status: 'failed', agentStep: 'failed' })
    },
  },
  async ({ event, step }) => {
    const d = event.data as EventData<'episode/generate.requested'>
    const deps = { db: getDb(), agent: { ctx: { episodeId: d.episodeId, userId: d.userId } } }
    const research = await step.run('research', () => researchStep(deps, d))
    const scripts = (await step.run('scripts', () => scriptsStep(deps, { ...d, research }))) as Scripts
    const evaluation = await step.run('evaluate', () => evaluateStep(deps, { episodeId: d.episodeId, scripts }))
    await step.run('ready-for-selection', () => readyStep(deps, { episodeId: d.episodeId, topic: d.topic, scripts, winner: evaluation.winner }))
    return { episodeId: d.episodeId, winner: evaluation.winner }
  },
)

/** refine → (voice parts → merge) ‖ thumbnails ‖ SEO → finalize. Every step retries on its own. */
export const produceEpisode = inngest.createFunction(
  {
    id: 'episode-produce',
    retries: 3,
    concurrency: { key: 'event.data.episodeId', limit: 1 },
    triggers: [{ event: 'episode/produce.requested' }],
    onFailure: async ({ event, error }: FailureArgs<EventData<'episode/produce.requested'>>) => {
      const d = event.data.event.data
      const db = getDb()
      logger.error('production failed', { episodeId: d.episodeId, error: error.message })
      await updateEpisode(db, d.episodeId, { status: 'failed', agentStep: 'failed' })
      await failWorkflowLock(db, d.lockKey)
    },
  },
  async ({ event, step }) => {
    const d = event.data as EventData<'episode/produce.requested'>
    const deps = { db: getDb(), store: getStore(), tts: new ElevenLabsTTS(), agent: { ctx: { episodeId: d.episodeId, userId: d.userId } } }
    const script = (await step.run('refine', () => refineStep(deps, d))) as ChosenScript

    const audio = (async () => {
      const keys: string[] = []
      for (let part = 0; part < audioPartCount(script.lines.length); part++) {
        keys.push(await step.run(`audio-part-${part}`, () => audioPartStep(deps, { episodeId: d.episodeId, script, part, voices: { A: d.voiceA, B: d.voiceB } })))
      }
      return step.run('audio-merge', () => audioMergeStep(deps, { episodeId: d.episodeId, partKeys: keys }))
    })()
    const thumbs = step.run('thumbnails', () => thumbnailsStep(deps, { episodeId: d.episodeId, script }))
    const seo = step.run('seo', () => seoStep(deps, { episodeId: d.episodeId, script }))

    const [a, t, s] = await Promise.allSettled([audio, thumbs, seo])
    if (a.status === 'rejected') throw a.reason
    const final = await step.run('finalize', () => finalizeStep(deps, {
      episodeId: d.episodeId, lockKey: d.lockKey, seconds: script.seconds, audioUrl: a.value,
      thumbnailUrls: t.status === 'fulfilled' ? t.value : [], seo: s.status === 'fulfilled' ? s.value : {},
      partial: t.status === 'rejected' || s.status === 'rejected',
    }))
    // Video + Shorts render in worker-media once it is deployed (FLAG_VIDEO_RENDERING=true).
    if (isEnabled('videoRendering') && t.status === 'fulfilled' && t.value.length) {
      await step.sendEvent('render-media', { name: 'media/render.requested', data: { episodeId: d.episodeId, kind: 'episode-video', options: {} } })
    }
    return final
  },
)

export const episodeFunctions = [generateEpisode, produceEpisode]
