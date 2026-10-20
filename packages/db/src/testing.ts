// In-memory Postgres (PGlite) with every migration applied — for unit/integration tests.
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { fileURLToPath } from 'node:url'
import * as schema from './schema'
import type { Database } from './client'

export async function createTestDb(): Promise<{ db: Database; close: () => Promise<void> }> {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) })
  return { db: db as unknown as Database, close: () => client.close() }
}
