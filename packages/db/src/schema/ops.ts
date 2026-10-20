import { pgTable, text, integer, uuid, jsonb, boolean, numeric, timestamp, index } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './_columns'

export const workflowLocks = pgTable('workflow_locks', {
  id: id(),
  episodeId: uuid('episode_id').notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  step: text('step').notNull(),
  status: text('status').notNull().default('running'),
  result: jsonb('result'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

/** AI cost + latency per request, across every function instance. */
export const aiRequestLog = pgTable('ai_request_log', {
  id: id(),
  episodeId: uuid('episode_id'),
  userId: uuid('user_id'),
  taskType: text('task_type').notNull(),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  tokens: integer('tokens').notNull().default(0),
  latencyMs: integer('latency_ms').notNull().default(0),
  costUsd: numeric('cost_usd', { precision: 10, scale: 8 }).notNull().default('0'),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
  success: boolean('success').notNull().default(true),
  createdAt: createdAt(),
}, t => [index('ai_request_log_created_idx').on(t.createdAt), index('ai_request_log_user_idx').on(t.userId)])

export const workflowRuns = pgTable('workflow_runs', {
  id: id(),
  episodeId: uuid('episode_id'),
  userId: uuid('user_id'),
  workflowType: text('workflow_type').notNull(),
  status: text('status').notNull().default('running'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMs: integer('duration_ms'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
})

export const retryEvents = pgTable('retry_events', {
  id: id(),
  episodeId: uuid('episode_id'),
  workflowRunId: uuid('workflow_run_id'),
  step: text('step').notNull(),
  attempt: integer('attempt').notNull(),
  provider: text('provider'),
  errorType: text('error_type'),
  errorMessage: text('error_message'),
  resolved: boolean('resolved').notNull().default(false),
  createdAt: createdAt(),
})

export const promptVersions = pgTable('prompt_versions', {
  id: id(),
  promptName: text('prompt_name').notNull(),
  version: integer('version').notNull().default(1),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: createdAt(),
})

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  resource: text('resource'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: createdAt(),
}, t => [index('audit_logs_user_idx').on(t.userId, t.createdAt)])

export const waitlist = pgTable('waitlist', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: createdAt(),
})
