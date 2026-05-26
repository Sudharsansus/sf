// ── THUMBNAIL WORKER ──────────────────────────────────────────────────────────
import { generateThumbnails } from '@/lib/replicate'
import { uploadFromUrl } from '@/lib/storage'
import { db, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { emitEvent } from '@/lib/events'
import { captureError } from '@/lib/observability'

export const thumbWorker = {
  id: 'thumb-worker',

  async generate(episodeId: string, title: string, topic: string) {
    logger.info('Thumb Worker: generate', { episodeId })
    await emitEvent('workflow.thumbnails.started', { episodeId })
    try {
      const rawUrls = await generateThumbnails(title, topic)
      const urls = await Promise.all(
        rawUrls.map((u, i) => uploadFromUrl(u, `thumbnails/${episodeId}_${i}.webp`, 'image/webp').catch(() => u))
      )
      await db.update(episodes).set({ thumbnailUrls: urls, agentStep: 'thumbnails_done' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.thumbnails.completed', { episodeId, count: urls.length })
      return { urls }
    } catch (e: any) {
      await captureError(e, { episodeId, step: 'thumbnails' })
      await db.update(episodes).set({ agentStep: 'thumbnails_failed' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.thumbnails.failed', { episodeId, error: e.message })
      throw e
    }
  }
}
