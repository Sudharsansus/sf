import { eq } from 'drizzle-orm'
import type { Database } from '../client'
import { workflowLocks } from '../schema'

export type LockState =
  | { state: 'acquired' }
  | { state: 'running' }
  | { state: 'complete'; result: unknown }

/** Claim a workflow step. Stale `running` locks (older than staleMs) are taken over. */
export async function acquireWorkflowLock(db: Database, opts: { key: string; episodeId: string; step: string; staleMs: number; now?: Date }): Promise<LockState> {
  const now = opts.now ?? new Date()
  const [lock] = await db.select().from(workflowLocks).where(eq(workflowLocks.idempotencyKey, opts.key)).limit(1)
  if (lock?.status === 'complete' && lock.result) return { state: 'complete', result: lock.result }
  if (lock?.status === 'running' && now.getTime() - new Date(lock.updatedAt).getTime() < opts.staleMs) return { state: 'running' }
  if (lock) {
    await db.update(workflowLocks).set({ status: 'running', result: null, updatedAt: now }).where(eq(workflowLocks.idempotencyKey, opts.key))
  } else {
    await db.insert(workflowLocks).values({ episodeId: opts.episodeId, idempotencyKey: opts.key, step: opts.step, status: 'running', updatedAt: now })
  }
  return { state: 'acquired' }
}

export async function completeWorkflowLock(db: Database, key: string, result: unknown) {
  await db.update(workflowLocks).set({ status: 'complete', result, updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, key))
}

export async function failWorkflowLock(db: Database, key: string) {
  await db.update(workflowLocks).set({ status: 'failed', updatedAt: new Date() }).where(eq(workflowLocks.idempotencyKey, key))
}
