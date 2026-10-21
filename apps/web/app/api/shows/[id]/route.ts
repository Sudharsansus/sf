import { getDb } from '@isaii/db'
import { deleteShow, getShow, ShowInput, updateShow } from '@isaii/domain-shows'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

export const GET = route(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser()
  return json(await getShow(getDb(), user.id, (await ctx.params).id))
})

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const user = await requireUser()
  const body = await readJson(req, v => ShowInput.partial().parse(v))
  return json(await updateShow(getDb(), user.id, (await ctx.params).id, body))
})

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser()
  await deleteShow(getDb(), user.id, (await ctx.params).id)
  return new Response(null, { status: 204 })
})
