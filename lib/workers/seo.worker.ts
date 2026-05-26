// ── SEO WORKER ────────────────────────────────────────────────────────────────
import { runSEOAgent } from '@/lib/claude'
import { db, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { emitEvent } from '@/lib/events'

export const seoWorker = {
  id: 'seo-worker',

  async generate(episodeId: string, script: any, topic: string, title: string) {
    logger.info('SEO Worker: generate', { episodeId })
    await emitEvent('workflow.seo.started', { episodeId })
    try {
      const seoData = await runSEOAgent(script, topic, title)
      await db.update(episodes).set({ seoData, agentStep: 'seo_done' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.seo.completed', { episodeId })
      return seoData
    } catch (e: any) {
      await emitEvent('workflow.seo.failed', { episodeId, error: e.message })
      return {}
    }
  }
}
