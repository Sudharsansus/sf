import { AppError } from './errors'
import type { ErrorCode } from './errors'

export function assert(condition: unknown, code: ErrorCode, message: string): asserts condition {
  if (!condition) throw new AppError(code, message)
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`)
}
