import { AppError, ErrorCode } from '@isaii/core'

export type Role = 'user' | 'support' | 'moderator' | 'admin'
const ORDER: Role[] = ['user', 'support', 'moderator', 'admin']

export function hasRole(user: { role?: string | null } | null | undefined, required: Role): boolean {
  const idx = ORDER.indexOf((user?.role ?? 'user') as Role)
  return idx >= 0 && idx >= ORDER.indexOf(required)
}

export function requireRole(user: { role?: string | null } | null | undefined, required: Role) {
  if (!user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Sign in required')
  if (!hasRole(user, required)) throw new AppError(ErrorCode.FORBIDDEN, 'Not allowed')
}
