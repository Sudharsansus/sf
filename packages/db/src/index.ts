import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import {
  pgTable, text, integer, timestamp, uuid, jsonb, boolean, numeric
} from 'drizzle-orm/pg-core'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

export const users = pgTable('users', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  email:                text('email').notNull().unique(),
  name:                 text('name'),
  image:                text('image'),
  credits:              integer('credits').notNull().default(10),
  plan:                 text('plan').notNull().default('free'),
  youtubeAccessToken:   text('youtube_access_token'),
  youtubeRefreshToken:  text('youtube_refresh_token'),
  youtubeChannelId:     text('youtube_channel_id'),
  instagramAccessToken: text('instagram_access_token'),
  instagramUserId:      text('instagram_user_id'),
  role:                 text('role').notNull().default('user'),
  createdAt:            timestamp('created_at').notNull().defaultNow(),
  updatedAt:            timestamp('updated_at').notNull().defaultNow()
})

export const episodes = pgTable('episodes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull(),
  projectId:        uuid('project_id'),
  topic:            text('topic').notNull(),
  title:            text('title').notNull().default(''),
  researchData:     jsonb('research_data'),
  allScripts:       jsonb('all_scripts'),
  evaluations:      jsonb('evaluations'),
  selectedScript:   jsonb('selected_script'),
  script:           jsonb('script'),
  audioUrl:         text('audio_url'),
  thumbnailUrls:    jsonb('thumbnail_urls'),
  seoData:          jsonb('seo_data'),
  duration:         integer('duration').default(0),
  status:           text('status').notNull().default('queued'),
  agentStep:        text('agent_step').default(''),
  shareId:          text('share_id').notNull().unique(),
  isPublic:         boolean('is_public').notNull().default(true),
  youtubeVideoId:   text('youtube_video_id'),
  youtubeUrl:       text('youtube_url'),
  instagramPostId:  text('instagram_post_id'),
  elevenLabsJobId:  text('elevenlabs_job_id'),
  idempotencyKey:   text('idempotency_key').unique(),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow()
})

export const creditsLedger = pgTable('credits_ledger', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull(),
  amount:    integer('amount').notNull(),
  reason:    text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const analytics = pgTable('analytics', {
  id:                       uuid('id').primaryKey().defaultRandom(),
  episodeId:                uuid('episode_id').notNull(),
  userId:                   uuid('user_id').notNull(),
  youtubeViews:             integer('youtube_views').default(0),
  youtubeLikes:             integer('youtube_likes').default(0),
  youtubeComments:          integer('youtube_comments').default(0),
  youtubeWatchTimeMinutes:  integer('youtube_watch_time_minutes').default(0),
  instagramReach:           integer('instagram_reach').default(0),
  instagramLikes:           integer('instagram_likes').default(0),
  instagramShares:          integer('instagram_shares').default(0),
  fetchedAt:                timestamp('fetched_at').notNull().defaultNow()
})

export const workflowLocks = pgTable('workflow_locks', {
  id:               uuid('id').primaryKey().defaultRandom(),
  episodeId:        uuid('episode_id').notNull(),
  idempotencyKey:   text('idempotency_key').notNull().unique(),
  step:             text('step').notNull(),
  status:           text('status').notNull().default('running'),
  result:           jsonb('result'),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow()
})

// Persists AI cost + latency across all Vercel function instances
export const aiRequestLog = pgTable('ai_request_log', {
  id:           uuid('id').primaryKey().defaultRandom(),
  episodeId:    uuid('episode_id'),
  userId:       uuid('user_id'),
  taskType:     text('task_type').notNull(),
  provider:     text('provider').notNull(),
  model:        text('model').notNull(),
  tokens:       integer('tokens').notNull().default(0),
  latencyMs:    integer('latency_ms').notNull().default(0),
  costUsd:      numeric('cost_usd', { precision: 10, scale: 8 }).notNull().default('0'),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  success:      boolean('success').notNull().default(true),
  createdAt:    timestamp('created_at').notNull().defaultNow()
})

export const workflowRuns = pgTable('workflow_runs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  episodeId:    uuid('episode_id'),
  userId:       uuid('user_id'),
  workflowType: text('workflow_type').notNull(),
  status:       text('status').notNull().default('running'),
  startedAt:    timestamp('started_at').notNull().defaultNow(),
  completedAt:  timestamp('completed_at'),
  durationMs:   integer('duration_ms'),
  errorMessage: text('error_message'),
  metadata:     jsonb('metadata')
})

export const retryEvents = pgTable('retry_events', {
  id:            uuid('id').primaryKey().defaultRandom(),
  episodeId:     uuid('episode_id'),
  workflowRunId: uuid('workflow_run_id'),
  step:          text('step').notNull(),
  attempt:       integer('attempt').notNull(),
  provider:      text('provider'),
  errorType:     text('error_type'),
  errorMessage:  text('error_message'),
  resolved:      boolean('resolved').notNull().default(false),
  createdAt:     timestamp('created_at').notNull().defaultNow()
})

export const promptVersions = pgTable('prompt_versions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  promptName: text('prompt_name').notNull(),
  version:    integer('version').notNull().default(1),
  content:    text('content').notNull(),
  isActive:   boolean('is_active').notNull().default(false),
  createdAt:  timestamp('created_at').notNull().defaultNow()
})

export const auditLogs = pgTable('audit_logs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id'),
  action:    text('action').notNull(),
  resource:  text('resource'),
  metadata:  jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const projects = pgTable('projects', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull(),
  name:        text('name').notNull(),
  description: text('description'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow()
})

export const waitlist = pgTable('waitlist', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     text('email').notNull().unique(),
  name:      text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})
