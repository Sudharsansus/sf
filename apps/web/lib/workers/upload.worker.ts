// ── UPLOAD WORKER ─────────────────────────────────────────────────────────────
import { uploadBuffer, uploadFromUrl } from '@/lib/storage'
import { logger } from '@/lib/logger'
import { emitEvent } from '@/lib/events'

export const uploadWorker = {
  id: 'upload-worker',

  async uploadAudio(episodeId: string, buffer: Buffer) {
    logger.info('Upload Worker: audio', { episodeId })
    await emitEvent('workflow.upload.started', { episodeId, type: 'audio' })
    const url = await uploadBuffer(buffer, `episodes/${episodeId}.mp3`, 'audio/mpeg')
    await emitEvent('workflow.upload.completed', { episodeId, type: 'audio', url })
    return url
  },

  async uploadImage(episodeId: string, sourceUrl: string, index: number) {
    const url = await uploadFromUrl(sourceUrl, `thumbnails/${episodeId}_${index}.webp`, 'image/webp').catch(() => sourceUrl)
    return url
  }
}
