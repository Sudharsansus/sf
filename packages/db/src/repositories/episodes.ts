import { and, desc, eq } from 'drizzle-orm'
import type { Database } from '../client'
import { episodes } from '../schema'

export type Episode = typeof episodes.$inferSelect
export type NewEpisode = typeof episodes.$inferInsert

export async function createEpisode(db: Database, values: NewEpisode): Promise<Episode> {
  const [row] = await db.insert(episodes).values(values).returning()
  return row!
}

export async function getEpisode(db: Database, id: string): Promise<Episode | undefined> {
  const [row] = await db.select().from(episodes).where(eq(episodes.id, id)).limit(1)
  return row
}

/** Returns the episode only if `userId` owns it. */
export async function getOwnedEpisode(db: Database, id: string, userId: string): Promise<Episode | undefined> {
  const [row] = await db.select().from(episodes).where(and(eq(episodes.id, id), eq(episodes.userId, userId))).limit(1)
  return row
}

export async function getByIdempotencyKey(db: Database, key: string): Promise<Episode | undefined> {
  const [row] = await db.select().from(episodes).where(eq(episodes.idempotencyKey, key)).limit(1)
  return row
}

export async function updateEpisode(db: Database, id: string, values: Partial<NewEpisode>) {
  await db.update(episodes).set({ ...values, updatedAt: new Date() }).where(eq(episodes.id, id))
}

export async function listEpisodes(db: Database, userId: string, page = 1, limit = 20) {
  const rows = await db.select().from(episodes).where(eq(episodes.userId, userId))
    .orderBy(desc(episodes.createdAt)).limit(limit + 1).offset((page - 1) * limit)
  return { data: rows.slice(0, limit), page, limit, hasMore: rows.length > limit }
}
