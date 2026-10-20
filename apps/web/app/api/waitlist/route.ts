import * as z from 'zod'
import { getDb, joinWaitlist } from '@isaii/db'
import { clientIp } from '@isaii/security'
import { limit } from '@/server/deps'
import { json, readJson, route } from '@/server/http'

export const dynamic = 'force-dynamic'

const Body = z.object({ email: z.email(), name: z.string().max(100).optional() })

export const POST = route(async (req: Request) => {
  if (!(await limit('waitlist', 5, '1 h').limit(clientIp(req.headers))).success) return json({ error: 'Too many requests' }, 429)
  const body = await readJson(req, v => Body.parse(v))
  const added = await joinWaitlist(getDb(), body.email, body.name)
  return added ? json({ success: true }) : json({ error: 'Email already on waitlist' }, 409)
})
