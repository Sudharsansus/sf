// Single registry of every Redis key prefix. Prefix `sus:` is kept for continuity with
// keys already in production (rate limits, budgets, payment idempotency).
const P = 'sus'

export const keys = {
  payment: (provider: string, ref: string) => `${P}:pay:${provider}:${ref}`,
  globalCost: (day: string) => `${P}:cost:global:${day}`,
  userHourCost: (userId: string, hour: number) => `${P}:cost:hour:${userId}:${hour}`,
  lock: (name: string) => `${P}:lock:${name}`,
  idempotency: (scope: string, key: string) => `${P}:idem:${scope}:${key}`,
  voicePreview: (voiceId: string, lang: string) => `${P}:voice:${voiceId}:${lang}`,
  oauthState: (provider: string, state: string) => `${P}:oauth:${provider}:${state}`,
  previewIp: (ip: string, day: string) => `${P}:preview:${ip}:${day}`,
} as const

export const ratelimitPrefix = (name: string) => `${P}:rl:${name}`
