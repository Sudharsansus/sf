-- SceneForge v2 — Run entire file in Neon SQL Editor
-- Safe to re-run: every statement uses IF NOT EXISTS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL UNIQUE,
  name                  TEXT,
  image                 TEXT,
  credits               INTEGER NOT NULL DEFAULT 10,
  plan                  TEXT NOT NULL DEFAULT 'free',
  youtube_access_token  TEXT,
  youtube_refresh_token TEXT,
  youtube_channel_id    TEXT,
  instagram_access_token TEXT,
  instagram_user_id     TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EPISODES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS episodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic             TEXT NOT NULL,
  title             TEXT NOT NULL DEFAULT '',
  research_data     JSONB,
  all_scripts       JSONB,
  evaluations       JSONB,
  selected_script   JSONB,
  script            JSONB,
  audio_url         TEXT,
  thumbnail_urls    JSONB,
  seo_data          JSONB,
  duration          INTEGER DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'queued',
  agent_step        TEXT DEFAULT '',
  share_id          TEXT NOT NULL UNIQUE,
  is_public         BOOLEAN NOT NULL DEFAULT true,
  youtube_video_id  TEXT,
  youtube_url       TEXT,
  instagram_post_id TEXT,
  elevenlabs_job_id TEXT,
  idempotency_key   TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CREDITS LEDGER ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credits_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ANALYTICS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id                   UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id                      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  youtube_views                INTEGER DEFAULT 0,
  youtube_likes                INTEGER DEFAULT 0,
  youtube_comments             INTEGER DEFAULT 0,
  youtube_watch_time_minutes   INTEGER DEFAULT 0,
  instagram_reach              INTEGER DEFAULT 0,
  instagram_likes              INTEGER DEFAULT 0,
  instagram_shares             INTEGER DEFAULT 0,
  fetched_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WORKFLOW LOCKS ─────────────────────────────────────────────────────────────
-- Prevents double-spend on retries. Stores full result for idempotent replay.
CREATE TABLE IF NOT EXISTS workflow_locks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id        UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  idempotency_key   TEXT NOT NULL UNIQUE,
  step              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'running',  -- running | complete | failed | stale
  result            JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AI REQUEST LOG ────────────────────────────────────────────────────────────
-- Persists cost/latency across all Vercel function instances
CREATE TABLE IF NOT EXISTS ai_request_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID REFERENCES episodes(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  task_type     TEXT NOT NULL,
  provider      TEXT NOT NULL,
  model         TEXT NOT NULL,
  tokens        INTEGER NOT NULL DEFAULT 0,
  latency_ms    INTEGER NOT NULL DEFAULT 0,
  cost_usd      NUMERIC(10,8) NOT NULL DEFAULT 0,
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  success       BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_episodes_user_id      ON episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_share_id     ON episodes(share_id);
CREATE INDEX IF NOT EXISTS idx_episodes_status       ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_episodes_idempotency  ON episodes(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id        ON credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_episode     ON analytics(episode_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user        ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_key          ON workflow_locks(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_workflow_episode      ON workflow_locks(episode_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status_time  ON workflow_locks(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_log_user           ON ai_request_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_task           ON ai_request_log(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_log_created        ON ai_request_log(created_at DESC);

-- ── WORKFLOW RUNS ─────────────────────────────────────────────────────────────
-- Tracks full lifecycle of each workflow execution for observability
CREATE TABLE IF NOT EXISTS workflow_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  workflow_type TEXT NOT NULL,  -- generate | refine | distribute
  status        TEXT NOT NULL DEFAULT 'running',  -- running | complete | failed | timeout
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  duration_ms   INTEGER,
  error_message TEXT,
  metadata      JSONB
);

-- ── RETRY EVENTS ──────────────────────────────────────────────────────────────
-- Every retry logged for debugging and pattern analysis
CREATE TABLE IF NOT EXISTS retry_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE,
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE CASCADE,
  step          TEXT NOT NULL,
  attempt       INTEGER NOT NULL,
  provider      TEXT,
  error_type    TEXT,
  error_message TEXT,
  resolved      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PROMPT VERSIONS ───────────────────────────────────────────────────────────
-- Version-controlled prompts for A/B testing and rollback
CREATE TABLE IF NOT EXISTS prompt_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,  -- research | scripts | evaluate | refine | seo
  version     INTEGER NOT NULL DEFAULT 1,
  content     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_name, version)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_workflow_runs_episode  ON workflow_runs(episode_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user     ON workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status   ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_retry_events_episode   ON retry_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_retry_events_step      ON retry_events(step);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_name   ON prompt_versions(prompt_name, is_active);

-- ── AUDIT LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,   -- credit.deduct | credit.refund | episode.delete | admin.action
  resource    TEXT,            -- episode:{id} | user:{id}
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_logs(created_at DESC);

-- ── USER ROLES (RBAC) ─────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
-- Roles: user | admin | moderator | support

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── WORKER HEALTH ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS worker_health (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'healthy',
  last_ping   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jobs_run    INTEGER DEFAULT 0,
  jobs_failed INTEGER DEFAULT 0,
  metadata    JSONB
);
CREATE INDEX IF NOT EXISTS idx_worker_health_id ON worker_health(worker_id);

-- ── PROVIDER METRICS ──────────────────────────────────────────────────────────
CREATE VIEW IF NOT EXISTS provider_metrics AS
SELECT
  provider,
  COUNT(*)                                              AS total_calls,
  AVG(latency_ms)::INT                                 AS avg_latency_ms,
  SUM(tokens)                                          AS total_tokens,
  SUM(cost_usd::NUMERIC)                               AS total_cost_usd,
  SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END)       AS fallback_count,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END)         AS failure_count,
  ROUND(AVG(CASE WHEN NOT success THEN 1 ELSE 0 END) * 100, 2) AS failure_rate_pct
FROM ai_request_log
GROUP BY provider;

-- ── QUEUE METRICS ─────────────────────────────────────────────────────────────
CREATE VIEW IF NOT EXISTS queue_metrics AS
SELECT
  workflow_type AS job_type,
  COUNT(*)                                              AS total,
  SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN status = 'failed'   THEN 1 ELSE 0 END) AS failed,
  AVG(duration_ms)::INT                                 AS avg_duration_ms
FROM workflow_runs
GROUP BY workflow_type;
