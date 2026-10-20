import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  return json({ credits: user.credits, plan: user.plan })
})
