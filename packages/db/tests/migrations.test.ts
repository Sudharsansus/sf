import { describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { createTestDb } from '../src/testing'

describe('migrations', () => {
  it('apply cleanly from an empty database', async () => {
    const { db, close } = await createTestDb()
    const rows = await db.execute(sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`)
    const tables = (rows as unknown as { rows: { table_name: string }[] }).rows.map(r => r.table_name)
    for (const t of ['users', 'episodes', 'credits_ledger', 'payments', 'shows', 'api_keys', 'projects', 'waitlist', 'workflow_locks', 'ai_request_log', 'audit_logs']) {
      expect(tables).toContain(t)
    }
    await close()
  }, 30_000)
})
