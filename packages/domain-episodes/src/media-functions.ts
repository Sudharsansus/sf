import { getDb } from '@isaii/db'
import { inngest, type EventData } from '@isaii/queue'
import { getStore } from '@isaii/storage'
import { renderEpisodeVideo, renderShort } from './media'

/** Registered by apps/worker-media (needs ffmpeg). */
export const renderMedia = inngest.createFunction(
  { id: 'media-render', retries: 2, concurrency: { limit: 2 }, triggers: [{ event: 'media/render.requested' }] },
  async ({ event, step }) => {
    const d = event.data as EventData<'media/render.requested'>
    const deps = { db: getDb(), store: getStore() }
    const video = await step.run('episode-video', () => renderEpisodeVideo(deps, d.episodeId))
    const short = d.kind === 'shorts' || d.kind === 'episode-video' ? await step.run('short', () => renderShort(deps, d.episodeId)) : null
    return { video, short }
  },
)

export const mediaFunctions = [renderMedia]
