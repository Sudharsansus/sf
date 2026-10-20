import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQ, LanguagePlaces, PipelineDemo, ScriptShowdown, TrustGrid, UploadFlow, UseCaseTabs, VoiceStudio, GREETINGS, type Theme } from '../src'

const c: Theme = { bg: '#000', surface: '#111', surface2: '#1a1a1a', border: '#222', border2: '#333', text: '#fff', muted: '#ccc', subtle: '#999', accent: '#fff', accentFg: '#000' }

describe('landing sections render', () => {
  it.each([
    ['PipelineDemo', PipelineDemo, /finished episode/i],
    ['UseCaseTabs', UseCaseTabs, /Built for whatever you make/i],
    ['ScriptShowdown', ScriptShowdown, /scored/i],
    ['VoiceStudio', VoiceStudio, /real conversation/i],
    ['UploadFlow', UploadFlow, /recording or a script/i],
    ['TrustGrid', TrustGrid, /confidence/i],
    ['FAQ', FAQ, /Frequently asked/i],
  ] as const)('%s', (_n, C, heading) => {
    render(<C c={c} dark />)
    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy()
  })
})

describe('LanguagePlaces', () => {
  it('starts on the India tab and switches to Global', () => {
    render(<LanguagePlaces c={c} dark />)
    expect(screen.getByRole('tab', { name: /India/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /ಕನ್ನಡ/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: /Global/ }))
    expect(screen.getByRole('button', { name: /Español/ })).toBeTruthy()
  })
  it('has a landmark photo + credit for every greeting', async () => {
    const places = (await import('../src/landing/places.json')).default as Record<string, { src: string; license: string }>
    for (const g of GREETINGS) {
      expect(places[g.code], g.code).toBeDefined()
      expect(places[g.code]!.license.length).toBeGreaterThan(0)
    }
  })
})

describe('FAQ', () => {
  it('opens one answer at a time', () => {
    render(<FAQ c={c} dark />)
    const q = screen.getByRole('button', { name: /How do credits work/ })
    fireEvent.click(q)
    expect(q.getAttribute('aria-expanded')).toBe('true')
  })
})
