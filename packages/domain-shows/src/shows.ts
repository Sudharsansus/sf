import { and, desc, eq } from 'drizzle-orm'
import * as z from 'zod'
import { AppError, ErrorCode } from '@isaii/core'
import { shows, type Database } from '@isaii/db'
import { isSupported } from '@isaii/i18n'

export const Host = z.object({ id: z.enum(['A', 'B']), name: z.string().min(1).max(40), voiceId: z.string().min(1), personality: z.string().max(200).default('') })
export const ShowInput = z.object({
  name: z.string().min(2).max(80),
  language: z.string().refine(isSupported, 'Unsupported language').default('en'),
  hosts: z.array(Host).min(1).max(2),
  style: z.object({ tone: z.string().max(200).optional(), intro: z.string().max(400).optional(), outro: z.string().max(400).optional(), musicBed: z.string().optional() }).default({}),
})
export type ShowInput = z.infer<typeof ShowInput>

// Keep combining marks (\p{M}) — Indic vowel signs are marks, dropping them breaks words.
const slugify = (s: string) => s.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 48) || 'show'

export async function createShow(db: Database, userId: string, input: ShowInput) {
  const data = ShowInput.parse(input)
  const [row] = await db.insert(shows).values({ userId, name: data.name, language: data.language, hosts: data.hosts, style: data.style, rssSlug: `${slugify(data.name)}-${Date.now().toString(36)}` }).returning()
  return row!
}

export const listShows = (db: Database, userId: string) => db.select().from(shows).where(eq(shows.userId, userId)).orderBy(desc(shows.createdAt))

export async function getShow(db: Database, userId: string, id: string) {
  const [row] = await db.select().from(shows).where(and(eq(shows.id, id), eq(shows.userId, userId))).limit(1)
  if (!row) throw new AppError(ErrorCode.NOT_FOUND, 'Show not found')
  return row
}

export async function updateShow(db: Database, userId: string, id: string, input: Partial<ShowInput>) {
  await getShow(db, userId, id)
  const data = ShowInput.partial().parse(input)
  await db.update(shows).set({ ...data, updatedAt: new Date() }).where(eq(shows.id, id))
  return getShow(db, userId, id)
}

export async function deleteShow(db: Database, userId: string, id: string) {
  await getShow(db, userId, id)
  await db.delete(shows).where(eq(shows.id, id))
}
