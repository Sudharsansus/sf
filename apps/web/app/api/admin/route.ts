import * as z from 'zod'
import { eq } from 'drizzle-orm'
import { AppError, ErrorCode } from '@isaii/core'
import { addCredits, adminOverview, aiUsageByTask, getDb, listEpisodesForAdmin, listUsersForAdmin, listWaitlist, recordLedger, users } from '@isaii/db'
import { audit, requireRole } from '@isaii/domain-identity'
import { clientIp } from '@isaii/security'
import { json, readJson, route } from '@/server/http'
import { requireUser } from '@/server/session'

export const dynamic = 'force-dynamic'

export const GET = route(async (req: Request) => {
  const admin = await requireUser()
  requireRole(admin, 'admin')
  const view = new URL(req.url).searchParams.get('view') ?? 'overview'
  const db = getDb()
  await audit(db, { userId: admin.id, action: 'admin.data_access', resource: `view:${view}`, ipAddress: clientIp(req.headers) })
  switch (view) {
    case 'overview': return json({ ...(await adminOverview(db)), ai: await aiUsageByTask(db) })
    case 'users': return json(await listUsersForAdmin(db))
    case 'episodes': return json(await listEpisodesForAdmin(db))
    case 'waitlist': return json(await listWaitlist(db))
    default: throw new AppError(ErrorCode.BAD_REQUEST, 'Unknown view')
  }
})

const Patch = z.discriminatedUnion('action', [
  z.object({ action: z.literal('set_role'), userId: z.uuid(), value: z.enum(['user', 'support', 'moderator', 'admin']) }),
  z.object({ action: z.literal('adjust_credits'), userId: z.uuid(), value: z.number().int().min(-100_000).max(100_000), reason: z.string().min(3).max(200) }),
])

/** Role changes and credit adjustments — validated, ledgered and audited. */
export const PATCH = route(async (req: Request) => {
  const admin = await requireUser()
  requireRole(admin, 'admin')
  const body = await readJson(req, v => Patch.parse(v))
  const db = getDb()
  if (body.action === 'set_role') {
    if (body.userId === admin.id && body.value !== 'admin') throw new AppError(ErrorCode.BAD_REQUEST, 'You cannot remove your own admin role')
    await db.update(users).set({ role: body.value, updatedAt: new Date() }).where(eq(users.id, body.userId))
  } else {
    if ((await addCredits(db, body.userId, body.value)) === null) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    await recordLedger(db, { userId: body.userId, amount: body.value, reason: `admin:${admin.id}:${body.reason}` })
  }
  await audit(db, { userId: admin.id, action: `admin.${body.action}`, resource: `user:${body.userId}`, metadata: body, ipAddress: clientIp(req.headers) })
  return json({ ok: true })
})
