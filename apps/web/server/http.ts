import { NextResponse } from 'next/server'
import { AppError, ErrorCode, toHttpError } from '@isaii/core'
import { logger } from '@isaii/logger'

/** Wrap a route handler: AppErrors become safe JSON responses, anything else a 500. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args)
    } catch (e) {
      const { status, body } = toHttpError(e)
      if (status >= 500) logger.error('route failed', { error: (e as Error).message, stack: (e as Error).stack?.split('\n').slice(0, 4).join(' | ') })
      return NextResponse.json(body, { status })
    }
  }
}

export const json = (data: unknown, init?: number | ResponseInit) => NextResponse.json(data, typeof init === 'number' ? { status: init } : init)

export async function readJson<T>(req: Request, parse: (v: unknown) => T): Promise<T> {
  let body: unknown
  try { body = await req.json() } catch { throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid JSON body') }
  try { return parse(body) } catch (e) { throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid request', { details: { issues: (e as { issues?: unknown }).issues } }) }
}

export const appUrl = (req: Request) => process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
