import { Hono } from 'hono'
import { serve as inngestServe } from 'inngest/hono'
import { inngest } from '@isaii/queue'
import { episodeFunctions } from '@isaii/domain-episodes/functions'

/** Inngest host for the AI pipeline (no serverless time limits). */
export function createWorker(opts: { functions?: typeof episodeFunctions } = {}) {
  const app = new Hono()
  app.get('/health', c => c.json({ status: 'ok', worker: 'worker-ai', functions: (opts.functions ?? episodeFunctions).length }))
  app.on(['GET', 'POST', 'PUT'], '/api/inngest', inngestServe({ client: inngest, functions: opts.functions ?? episodeFunctions }))
  return app
}
