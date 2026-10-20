import { describe, expect, it } from 'vitest'
import { renderThumbnail } from '../src'

const PNG = [0x89, 0x50, 0x4e, 0x47]

describe('renderThumbnail', () => {
  it.each(['bold-left', 'centered', 'split'] as const)('renders a %s PNG', async layout => {
    const png = await renderThumbnail({ layout, headline: 'Why Sleep Is Your Superpower', kicker: 'Deep dive', background: '#0b0b0f', accent: '#f97316', text: '#ffffff' })
    expect([...png.slice(0, 4)]).toEqual(PNG)
    expect(png.length).toBeGreaterThan(5_000)
  }, 20_000)
})
