import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import { EnvError, loadEnv, dataSchema, billingSchema } from '../src'

describe('loadEnv', () => {
  it('returns parsed values with defaults', () => {
    const env = loadEnv(billingSchema, {})
    expect(env.DODO_PAYMENTS_ENV).toBe('test')
  })
  it('reports every missing or invalid variable at once', () => {
    try {
      loadEnv(dataSchema, { DATABASE_URL: 'mysql://x', REDIS_URL: 'not-a-url' })
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(EnvError)
      const issues = (e as EnvError).issues.join(' ')
      expect(issues).toContain('DATABASE_URL')
      expect(issues).toContain('REDIS_URL')
      expect(issues).toContain('REDIS_TOKEN')
    }
  })
  it('coerces numbers', () => {
    expect(loadEnv(z.object({ PORT: z.coerce.number() }), { PORT: '8080' }).PORT).toBe(8080)
  })
})
