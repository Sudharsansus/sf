import { serve } from '@hono/node-server'
import { getGateway } from '@isaii/ai-gateway'
import { getDb, insertAIUsage } from '@isaii/db'
import { workerEnv } from '@isaii/env'
import { logger } from '@isaii/logger'
import { createWorker } from './app'

const env = workerEnv()

getGateway().addSink(r => insertAIUsage(getDb(), {
  task: r.task, provider: r.provider, model: r.model, tokens: r.usage.inputTokens + r.usage.outputTokens,
  latencyMs: r.latencyMs, costUsd: r.costUsd, success: r.success, episodeId: r.ctx?.episodeId, userId: r.ctx?.userId,
}))

serve({ fetch: createWorker().fetch, port: env.PORT }, ({ port }) => logger.info('worker-ai listening', { port }))
