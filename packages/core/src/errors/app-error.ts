import type { ErrorCode } from './codes'

/** An error that is safe to show to the user and maps to an HTTP status. */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details?: Record<string, unknown>
  readonly expose: boolean

  constructor(code: ErrorCode, message: string, opts: { details?: Record<string, unknown>; cause?: unknown; expose?: boolean } = {}) {
    super(message, { cause: opts.cause })
    this.name = 'AppError'
    this.code = code
    this.details = opts.details
    this.expose = opts.expose ?? true
  }
}

export const isAppError = (e: unknown): e is AppError => e instanceof AppError
