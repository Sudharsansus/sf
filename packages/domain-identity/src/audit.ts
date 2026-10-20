import { auditLogs, type Database } from '@isaii/db'
import { logger } from '@isaii/logger'

export type AuditEvent = { userId?: string | null; action: string; resource?: string; metadata?: Record<string, unknown>; ipAddress?: string }

/** Append to the audit log. Never throws — auditing must not break the main flow. */
export async function audit(db: Database, e: AuditEvent): Promise<void> {
  try {
    await db.insert(auditLogs).values({ userId: e.userId ?? null, action: e.action, resource: e.resource ?? null, metadata: e.metadata ?? null, ipAddress: e.ipAddress ?? null })
  } catch (err) {
    logger.warn('audit write failed', { action: e.action, error: (err as Error).message })
  }
}
