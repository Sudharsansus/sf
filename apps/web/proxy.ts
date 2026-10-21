import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isCrossOriginBlocked } from '@isaii/security'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = req.nextUrl

  // ── CSRF: reject cross-origin state-mutating requests (exact origin match) ───
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || '', 'https://isaii.si', 'https://www.isaii.si']
  if (isCrossOriginBlocked({ method: req.method, pathname, origin: req.headers.get('origin'), allowedOrigins })) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const protectedPages = ['/studio', '/dashboard', '/episodes', '/analytics', '/upload', '/editor']
  const protectedApis  = [
    '/api/generate', '/api/agents', '/api/jobs',
    '/api/credits', '/api/analytics', '/api/ai-stats',
    '/api/youtube', '/api/instagram', '/api/admin', '/api/upload', '/api/episodes', '/api/billing'
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
    '/upload/:path*',
    '/editor/:path*',
    '/api/generate/:path*',
    '/api/agents/:path*',
    '/api/jobs/:path*',
    '/api/credits/:path*',
    '/api/analytics/:path*',
    '/api/ai-stats/:path*',
    '/api/youtube/:path*',
    '/api/instagram/:path*',
    '/api/admin/:path*',
    '/api/upload/:path*',
    '/api/episodes/:path*',
    '/api/preview/:path*',
    '/api/billing/:path*'
  ]
}