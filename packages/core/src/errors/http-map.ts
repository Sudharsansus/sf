import { ErrorCode } from './codes'
import { isAppError } from './app-error'

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409,
  PAYMENT_REQUIRED: 402, RATE_LIMITED: 429, UNPROCESSABLE: 422, UPSTREAM: 502, UNAVAILABLE: 503, INTERNAL: 500,
}

export const httpStatus = (code: ErrorCode) => STATUS[code]

/** Convert any thrown value into a safe { status, body } for an HTTP response. */
export function toHttpError(e: unknown): { status: number; body: { error: string; code: ErrorCode; details?: Record<string, unknown> } } {
  if (isAppError(e) && e.expose) {
    return { status: STATUS[e.code], body: { error: e.message, code: e.code, details: e.details } }
  }
  return { status: 500, body: { error: 'Something went wrong. Please try again.', code: ErrorCode.INTERNAL } }
}
