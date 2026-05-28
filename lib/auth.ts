import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db, users } from './db'
import { eq } from 'drizzle-orm'

export const authOptions = {
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }: any) {
      if (!user.email) return false
      const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1)
      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          credits: 3,
          plan: 'free'
        })
        // New user — will be redirected to onboarding via callbackUrl
      }
      return true
    },
    async session({ session }: any) {
      if (session.user?.email) {
        const [u] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
        if (u) {
          session.user.id = u.id
          session.user.credits = u.credits
          session.user.plan = u.plan
        }
      }
      return session
    }
  },
  pages: { signIn: '/login', newUser: '/onboarding' }
}

const handler = NextAuth(authOptions)
export { handler as auth }
export default handler