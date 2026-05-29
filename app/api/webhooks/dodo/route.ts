import { NextRequest, NextResponse } from 'next/server'
import { db, users, creditsLedger } from '@/lib/db'
import { verifyHMAC } from '@/lib/security'
import { eq, sql } from 'drizzle-orm'
import { logger } from '@/lib/logger'

const CREDITS: Record<string, number> = {
  starter: 60,
  pro:     200,
  studio:  600,
  agency:  2000,
  // top-up packs (minutes)
  pack_30:  30,
  pack_60:  60,
  pack_120: 120,
  pack_300: 300,
}
const PLANS: Record<string, string> = { starter: 'starter', pro: 'pro', studio: 'studio', agency: 'agency' }

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const sig = req.headers.get('x-dodo-signature') || ''
    if (!verifyHMAC(raw, sig, process.env.DODO_PAYMENTS_WEBHOOK_SECRET!)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    const { type, data } = JSON.parse(raw)
    if (type === 'payment.completed' || type === 'subscription.created') {
      const email = data?.customer?.email
      const planId = data?.planId || 'starter'
      const credits = CREDITS[planId] || 50
      if (email) {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if (user) {
          await db.update(users).set({ credits: sql`credits + ${credits}`, plan: PLANS[planId] || 'free', updatedAt: new Date() }).where(eq(users.id, user.id))
          await db.insert(creditsLedger).values({ userId: user.id, amount: credits, reason: `payment_${planId}` })
          logger.info('Credits granted', { email, credits, plan: planId })
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    logger.error('Dodo webhook error', { error: e.message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
