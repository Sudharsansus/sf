import * as z from 'zod'
import { getDb } from '@isaii/db'
import { assignEpisode } from '@isaii/domain-shows'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }
const Body = z.object({ episodeId: z.string().uuid(), attach: z.boolean() })

/** Add an episode to this show (attach: true) or remove it (attach: false). */
export const POST = route(async (req: Request, ctx: Ctx) => {
  const user = await requireUser()
  const { episodeId, attach } = await readJson(req, v => Body.parse(v))
  await assignEpisode(getDb(), user.id, episodeId, attach ? (await ctx.params).id : null)
  return json({ ok: true })
})
