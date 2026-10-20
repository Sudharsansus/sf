import { serve } from '@hono/node-server'
import { workerEnv } from '@isaii/env'
import { logger } from '@isaii/logger'
import { createWorker } from './app'

const env = workerEnv()

serve({ fetch: createWorker().fetch, port: env.PORT }, ({ port }) => logger.info('worker-media listening', { port }))
