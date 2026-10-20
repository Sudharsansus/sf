import { serve } from '@hono/node-server'
import { getRedis, kv } from '@isaii/cache'
import { apiEnv } from '@isaii/env'
import { getDb } from '@isaii/db'
import { logger } from '@isaii/logger'
import { createLimiterFactory } from '@isaii/security'
import { createApp } from './app'

const env = apiEnv()
const limiter = createLimiterFactory(getRedis())('api:key', 120, '1 m')

const app = createApp({
  db: getDb(),
  kv: kv(),
  allow: async key => (await limiter.limit(key)).success,
  secrets: { razorpayWebhook: env.RAZORPAY_WEBHOOK_SECRET, dodoWebhook: env.DODO_PAYMENTS_WEBHOOK_SECRET },
})

serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => logger.info('api listening', { port }))
