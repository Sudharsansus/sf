import { describe, expect, it } from 'vitest'
import { progressOf } from '../src'

describe('progressOf', () => {
  it('tracks the generate phase', () => {
    expect(progressOf({ status: 'scripting', agentStep: 'scripts' })).toMatchObject({ done: ['research'], active: 'script' })
    expect(progressOf({ status: 'awaiting_selection', agentStep: 'awaiting_selection' })).toMatchObject({ done: ['research', 'script'], active: null })
  })
  it('tracks the produce phase from stored outputs', () => {
    const p = progressOf({ status: 'producing', agentStep: 'refined', audioUrl: 'https://a.mp3', thumbnailUrls: [] })
    expect(p.done).toEqual(['research', 'script', 'refine', 'voice'])
    expect(p.active).toBe('visuals')
  })
  it('reports finished and failed', () => {
    expect(progressOf({ status: 'complete', audioUrl: 'x', thumbnailUrls: ['t'], seoData: { a: 1 } })).toMatchObject({ finished: true, active: null })
    expect(progressOf({ status: 'failed' }).failed).toBe(true)
  })
})
