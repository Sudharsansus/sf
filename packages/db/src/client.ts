import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export type Schema = typeof schema
/** Any Drizzle Postgres database with our schema (Neon in prod, PGlite in tests). */
export type Database = PgDatabase<PgQueryResultHKT, Schema>

export function createDb(url: string): Database {
  return drizzle(neon(url), { schema }) as unknown as Database
}

let instance: Database | null = null

/** Process-wide database, created on first use so importing never needs DATABASE_URL. */
export function getDb(): Database {
  if (!instance) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    instance = createDb(url)
  }
  return instance
}

/** Swap the process-wide database (tests). */
export function setDb(db: Database | null) {
  instance = db
}

/** Lazy proxy so existing `db.select()…` call sites keep working. */
export const db: Database = new Proxy({} as Database, {
  get: (_t, prop) => Reflect.get(getDb() as object, prop),
})
