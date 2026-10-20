import { Hono } from 'hono'
import { serve as inngestServe } from 'inngest/hono'
import { inngest } from '@isaii/queue'
import { mediaFunctions } from '@isaii/domain-episodes/media-functions'

/** Inngest host for ffmpeg media rendering (episode video, Shorts). */
export function createWorker(opts: { functions?: typeof mediaFunctions } = {}) {
  const app = new Hono()
  app.get('/health', c => c.json({ status: 'ok', worker: 'worker-media', functions: (opts.functions ?? mediaFunctions).length }))
  app.on(['GET', 'POST', 'PUT'], '/api/inngest', inngestServe({ client: inngest, functions: opts.functions ?? mediaFunctions }))
  return app
}
