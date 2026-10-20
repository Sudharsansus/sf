import { eq, sql, and, gte } from 'drizzle-orm'
import type { Database } from '../client'
import { users } from '../schema'

export type User = typeof users.$inferSelect

export async function findUserByEmail(db: Database, email: string): Promise<User | undefined> {
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return u
}

export async function findUserById(db: Database, id: string): Promise<User | undefined> {
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return u
}

/** Atomically deduct credits. Returns the new balance, or null if the user can't afford it. */
export async function deductCredits(db: Database, userId: string, amount: number): Promise<number | null> {
  const rows = await db.update(users)
    .set({ credits: sql`${users.credits} - ${amount}`, updatedAt: new Date() })
    .where(and(eq(users.id, userId), gte(users.credits, amount)))
    .returning({ credits: users.credits })
  return rows[0]?.credits ?? null
}

/** Add credits (refunds, purchases) and optionally switch plan. Returns the new balance or null if no user. */
export async function addCredits(db: Database, userId: string, amount: number, plan?: string): Promise<number | null> {
  const rows = await db.update(users)
    .set({ credits: sql`${users.credits} + ${amount}`, ...(plan ? { plan } : {}), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ credits: users.credits })
  return rows[0]?.credits ?? null
}

export async function upsertUserOnSignIn(db: Database, u: { email: string; name?: string | null; image?: string | null }, freeCredits: number): Promise<User> {
  const [row] = await db.insert(users)
    .values({ email: u.email, name: u.name ?? null, image: u.image ?? null, credits: freeCredits })
    .onConflictDoUpdate({ target: users.email, set: { name: u.name ?? null, image: u.image ?? null, updatedAt: new Date() } })
    .returning()
  return row!
}
