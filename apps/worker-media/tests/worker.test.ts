import { describe, expect, it } from 'vitest'
import { createWorker } from '../src/app'

describe('worker-media', () => {
  it('reports health and registered functions', async () => {
    const res = await createWorker().request('/health')
    expect(res.status).toBe(200)
    const body = await res.json() as { worker: string; functions: number }
    expect(body.worker).toBe('worker-media')
    expect(body.functions).toBeGreaterThan(0)
  })
  it('exposes the Inngest endpoint', async () => {
    const res = await createWorker().request('/api/inngest')
    expect(res.status).toBeLessThan(500)
  })
})
