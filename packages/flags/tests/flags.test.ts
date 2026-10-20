import { describe, expect, it } from 'vitest'
import { can, entitlements, isEnabled } from '../src'

describe('flags', () => {
  it('uses defaults and env overrides', () => {
    expect(isEnabled('videoRendering', {})).toBe(false)
    expect(isEnabled('videoRendering', { FLAG_VIDEO_RENDERING: 'true' })).toBe(true)
    expect(isEnabled('homepagePreview', { FLAG_HOMEPAGE_PREVIEW: '0' })).toBe(false)
  })
})
describe('entitlements', () => {
  it('grows with the plan and defaults to free', () => {
    expect(can('free', 'seo')).toBe(false)
    expect(can('pro', 'shorts')).toBe(true)
    expect(can('agency', 'team_access')).toBe(true)
    expect(entitlements('unknown-plan')).toEqual(entitlements('free'))
    expect(entitlements('studio').length).toBeGreaterThan(entitlements('starter').length)
  })
})
