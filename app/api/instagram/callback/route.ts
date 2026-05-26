import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/instagram'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  if (!code || !state) return NextResponse.redirect('/dashboard?error=oauth_failed')

  const email = await redis.get<string>(`ig_state:${state}`)
  if (!email) return NextResponse.redirect('/dashboard?error=state_invalid')

  try {
    const { accessToken, userId } = await exchangeCode(code)
    await db.update(users).set({
      instagramAccessToken: accessToken,
      instagramUserId: userId,
      updatedAt: new Date()
    }).where(eq(users.email, email))
    await redis.del(`ig_state:${state}`)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?instagram=connected`)
  } catch (e: any) {
    return NextResponse.redirect(`/dashboard?error=${encodeURIComponent(e.message)}`)
  }
}
