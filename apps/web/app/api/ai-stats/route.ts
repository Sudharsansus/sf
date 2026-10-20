import { aiUsageByTask, getDb } from '@isaii/db'
import { requireRole } from '@isaii/domain-identity'
import { json, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  requireRole(await requireUser(), 'support')
  return json(await aiUsageByTask(getDb()))
})
