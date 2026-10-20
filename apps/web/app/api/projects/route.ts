import * as z from 'zod'
import { count, eq } from 'drizzle-orm'
import { episodes, getDb, projects } from '@isaii/db'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  const db = getDb()
  const rows = await db.select({ project: projects, episodeCount: count(episodes.id) })
    .from(projects).leftJoin(episodes, eq(episodes.projectId, projects.id))
    .where(eq(projects.userId, user.id)).groupBy(projects.id)
  return json(rows.map(r => ({ ...r.project, episodeCount: r.episodeCount })))
})

const Body = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).optional() })

export const POST = route(async (req: Request) => {
  const user = await requireUser()
  const body = await readJson(req, v => Body.parse(v))
  const [row] = await getDb().insert(projects).values({ userId: user.id, name: body.name, description: body.description || null }).returning()
  return json(row, 201)
})
