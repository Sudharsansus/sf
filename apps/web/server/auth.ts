import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getDb } from '@isaii/db'
import { onSignIn, sessionClaims } from '@isaii/domain-identity'

export const authOptions: NextAuthOptions = {
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
  },
  providers: [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? '', clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '' })],
  callbacks: {
    signIn: ({ user }) => onSignIn(getDb(), user),
    // Claims are cached in the JWT and refreshed every 5 minutes instead of a DB query on every request.
    async jwt({ token }) {
      const stale = !token.claimsAt || Date.now() - Number(token.claimsAt) > 5 * 60_000
      if (token.email && stale) {
        const claims = await sessionClaims(getDb(), token.email)
        if (claims) Object.assign(token, claims, { claimsAt: Date.now() })
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) Object.assign(session.user, { id: token.id, credits: token.credits, plan: token.plan, role: token.role })
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', newUser: '/onboarding' },
}
