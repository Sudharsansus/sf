import { count, desc, eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import { aiRequestLog, auditLogs, episodes, users, waitlist } from '../schema'

export type AIUsageRow = { task: string; provider: string; model: string; tokens: number; latencyMs: number; costUsd: number; success: boolean; episodeId?: string | null; userId?: string | null }

export async function insertAIUsage(db: Database, r: AIUsageRow) {
  await db.insert(aiRequestLog).values({
    taskType: r.task, provider: r.provider, model: r.model, tokens: r.tokens, latencyMs: r.latencyMs,
    costUsd: r.costUsd.toFixed(8), fallbackUsed: false, success: r.success, episodeId: r.episodeId ?? null, userId: r.userId ?? null,
  })
}

export async function aiUsageByTask(db: Database) {
  const rows = await db.select({
    task: aiRequestLog.taskType,
    count: sql<number>`count(*)::int`,
    tokens: sql<number>`coalesce(sum(${aiRequestLog.tokens}), 0)::int`,
    costUsd: sql<number>`coalesce(sum(${aiRequestLog.costUsd}), 0)::float`,
    avgLatencyMs: sql<number>`coalesce(avg(${aiRequestLog.latencyMs}), 0)::int`,
    failures: sql<number>`sum(case when ${aiRequestLog.success} then 0 else 1 end)::int`,
  }).from(aiRequestLog).groupBy(aiRequestLog.taskType)
  return { total: rows.reduce((n, r) => n + r.count, 0), totalCostUsd: rows.reduce((n, r) => n + Number(r.costUsd), 0), byTask: rows }
}

export async function adminOverview(db: Database) {
  const [[u], [e], [c], recentAudit] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(episodes),
    db.select({ n: count() }).from(episodes).where(eq(episodes.status, 'complete')),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(20),
  ])
  return { users: u?.n ?? 0, episodes: e?.n ?? 0, completedEpisodes: c?.n ?? 0, recentAudit }
}

export const listUsersForAdmin = (db: Database, limit = 100) => db.select({
  id: users.id, email: users.email, name: users.name, credits: users.credits, plan: users.plan, role: users.role, createdAt: users.createdAt,
}).from(users).orderBy(desc(users.createdAt)).limit(limit)

export const listEpisodesForAdmin = (db: Database, limit = 100) => db.select({
  id: episodes.id, title: episodes.title, email: users.email, status: episodes.status, language: episodes.language, createdAt: episodes.createdAt,
}).from(episodes).innerJoin(users, eq(episodes.userId, users.id)).orderBy(desc(episodes.createdAt)).limit(limit)

export const listWaitlist = (db: Database, limit = 500) => db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(limit)

export async function joinWaitlist(db: Database, email: string, name?: string | null): Promise<boolean> {
  const rows = await db.insert(waitlist).values({ email: email.toLowerCase().trim(), name: name?.trim() || null }).onConflictDoNothing({ target: waitlist.email }).returning({ id: waitlist.id })
  return rows.length > 0
}
