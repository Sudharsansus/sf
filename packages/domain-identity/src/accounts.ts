import { findUserByEmail, upsertUserOnSignIn, type Database, type User } from '@isaii/db'
import { FREE_SIGNUP_CREDITS } from '@isaii/domain-billing'

/** Called on every sign-in: creates the account (with free credits) the first time. */
export async function onSignIn(db: Database, profile: { email?: string | null; name?: string | null; image?: string | null }): Promise<boolean> {
  if (!profile.email) return false
  await upsertUserOnSignIn(db, { email: profile.email, name: profile.name, image: profile.image }, FREE_SIGNUP_CREDITS)
  return true
}

export type SessionClaims = { id: string; credits: number; plan: string; role: string }

export async function sessionClaims(db: Database, email: string): Promise<SessionClaims | null> {
  const u = await findUserByEmail(db, email)
  return u ? { id: u.id, credits: u.credits, plan: u.plan, role: u.role } : null
}

/** Strip secrets before a user leaves the server. */
export function publicUser(u: User) {
  const { youtubeAccessToken: _a, youtubeRefreshToken: _b, instagramAccessToken: _c, ...safe } = u
  return safe
}
