import * as z from 'zod'

const url = z.url()
const secret = z.string().min(1)
const optional = z.string().optional()

export const coreSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: url.default('http://localhost:3000'),
})

export const dataSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgres'),
  REDIS_URL: url,
  REDIS_TOKEN: secret,
})

export const aiSchema = z.object({
  ANTHROPIC_API_KEY: secret,
  CLAUDE_MODEL: optional,
  ELEVENLABS_API_KEY: secret,
  ELEVENLABS_VOICE_A: optional,
  ELEVENLABS_VOICE_B: optional,
  ELEVENLABS_STT_MODEL: optional,
})

export const storageSchema = z.object({
  R2_ACCOUNT_ID: secret,
  R2_ACCESS_KEY_ID: secret,
  R2_SECRET_ACCESS_KEY: secret,
  R2_BUCKET: secret,
  R2_PUBLIC_URL: url,
})

export const authSchema = z.object({
  NEXTAUTH_URL: url.optional(),
  NEXTAUTH_SECRET: secret,
  GOOGLE_CLIENT_ID: secret,
  GOOGLE_CLIENT_SECRET: secret,
  TOKEN_ENCRYPTION_KEY: z.string().length(64, 'must be 32 bytes hex (openssl rand -hex 32)').optional(),
})

export const billingSchema = z.object({
  RAZORPAY_KEY_ID: optional,
  RAZORPAY_KEY_SECRET: optional,
  RAZORPAY_WEBHOOK_SECRET: optional,
  DODO_PAYMENTS_ENV: z.enum(['test', 'live']).default('test'),
  DODO_PAYMENTS_API_KEY: optional,
  DODO_PAYMENTS_WEBHOOK_SECRET: optional,
})

export const queueSchema = z.object({
  INNGEST_EVENT_KEY: optional,
  INNGEST_SIGNING_KEY: optional,
})

export const publishingSchema = z.object({
  YOUTUBE_CLIENT_ID: optional,
  YOUTUBE_CLIENT_SECRET: optional,
  INSTAGRAM_APP_ID: optional,
  INSTAGRAM_APP_SECRET: optional,
})

export const webSchema = coreSchema
  .extend(dataSchema.shape).extend(aiSchema.shape).extend(storageSchema.shape)
  .extend(authSchema.shape).extend(billingSchema.shape).extend(queueSchema.shape).extend(publishingSchema.shape)

export const workerSchema = coreSchema
  .extend(dataSchema.shape).extend(aiSchema.shape).extend(storageSchema.shape).extend(queueSchema.shape)
  .extend({ PORT: z.coerce.number().int().default(8080) })

export const apiSchema = coreSchema
  .extend(dataSchema.shape).extend(billingSchema.shape).extend(queueSchema.shape)
  .extend({ PORT: z.coerce.number().int().default(8787) })
