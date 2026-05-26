// ── AUDIO WORKER ──────────────────────────────────────────────────────────────
// Handles: ElevenLabs rendering + R2 upload
// Isolated — fails here without affecting thumbnails or SEO

import { renderScript } from '@/lib/elevenlabs'
import { uploadBuffer } from '@/lib/storage'
import { db, episodes } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import { emitEvent } from '@/lib/events'
import { captureError } from '@/lib/observability'

export const audioWorker = {
  id: 'audio-worker',

  async render(episodeId: string, lines: any[]) {
    const start = Date.now()
    logger.info('Audio Worker: render', { episodeId, lines: lines.length })
    await db.update(episodes).set({ agentStep: 'audio_rendering', status: 'audio_rendering' }).where(eq(episodes.id, episodeId))
    await emitEvent('workflow.audio.started', { episodeId })

    try {
      const buf = await renderScript(lines)
      const url = await uploadBuffer(buf, `episodes/${episodeId}.mp3`, 'audio/mpeg')
      await db.update(episodes).set({ audioUrl: url, agentStep: 'audio_done' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.audio.completed', { episodeId, durationMs: Date.now() - start, url })
      return { url, durationMs: Date.now() - start }
    } catch (e: any) {
      await captureError(e, { episodeId, step: 'audio' })
      await db.update(episodes).set({ agentStep: 'audio_failed' }).where(eq(episodes.id, episodeId))
      await emitEvent('workflow.audio.failed', { episodeId, error: e.message })
      throw e
    }
  }
}
