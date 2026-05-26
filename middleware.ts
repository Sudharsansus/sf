import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = req.nextUrl

  const protectedPages = ['/studio', '/dashboard', '/episodes', '/analytics']
  const protectedApis  = [
    '/api/generate', '/api/agents', '/api/jobs',
    '/api/credits', '/api/analytics', '/api/ai-stats',
    '/api/youtube', '/api/instagram', '/api/admin'
  ]

  const isProtectedPage = protectedPages.some(p => pathname.startsWith(p))
  const isProtectedApi  = protectedApis.some(p => pathname.startsWith(p))

  if (isProtectedPage || isProtectedApi) {
    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/studio/:path*',
    '/dashboard/:path*',
    '/episodes/:path*',
    '/analytics/:path*',
    '/api/generate/:path*',
    '/api/agents/:path*',
    '/api/jobs/:path*',
    '/api/credits/:path*',
    '/api/analytics/:path*',
    '/api/ai-stats/:path*',
    '/api/youtube/:path*',
    '/api/instagram/:path*',
    '/api/admin/:path*'
  ]
}