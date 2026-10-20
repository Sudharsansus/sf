import { AppError, ErrorCode } from '@isaii/core'

/** Throw NOT_FOUND (not FORBIDDEN) so resources owned by others are not enumerable. */
export function assertOwner<T extends { userId: string | null }>(resource: T | undefined | null, userId: string): T {
  if (!resource || resource.userId !== userId) throw new AppError(ErrorCode.NOT_FOUND, 'Not found')
  return resource
}
