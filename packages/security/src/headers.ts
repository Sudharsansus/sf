/** Content-Security-Policy and hardening headers shared by every web surface. */
export function securityHeaders(opts: { extraScriptSrc?: string[]; extraFrameSrc?: string[] } = {}) {
  const csp = [
    "default-src 'self'",
    ["script-src 'self' 'unsafe-eval' 'unsafe-inline'", ...(opts.extraScriptSrc ?? [])].join(' '),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob: data:",
    "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    ['frame-src', ...(opts.extraFrameSrc?.length ? opts.extraFrameSrc : ["'none'"])].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
  return [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), interest-cohort=()' },
    { key: 'Content-Security-Policy', value: csp },
  ]
}

export const RAZORPAY_CSP = {
  extraScriptSrc: ['https://checkout.razorpay.com'],
  extraFrameSrc: ['https://api.razorpay.com', 'https://checkout.razorpay.com'],
}
