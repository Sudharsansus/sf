import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { PreviewTry } from '@/components/landing/PreviewTry'

const c = { bg: '#000', surface: '#111', surface2: '#1a1a1a', border: '#222', border2: '#333', text: '#fff', muted: '#ccc', subtle: '#999', accent: '#fff', accentFg: '#000' }
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('PreviewTry', () => {
  it('is disabled until a topic is typed', () => {
    render(<PreviewTry c={c} dark topic="" />)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })
  it('shows the teaser in the chosen language', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'Dosa', lines: [{ speaker: 'A', text: 'ನಮಸ್ಕಾರ' }], remaining: 2 })))
    vi.stubGlobal('fetch', f)
    render(<PreviewTry c={c} dark topic="History of dosa" />)
    fireEvent.change(screen.getByLabelText('Preview language'), { target: { value: 'kn' } })
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('ನಮಸ್ಕಾರ')).toBeTruthy()
    expect(JSON.parse(f.mock.calls[0]![1].body)).toEqual({ topic: 'History of dosa', language: 'kn' })
  })
  it('shows the server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Free previews used up for today' }), { status: 429 })))
    render(<PreviewTry c={c} dark topic="Some topic" />)
    fireEvent.click(screen.getByRole('button'))
    expect((await screen.findByRole('alert')).textContent).toMatch(/used up/)
  })
})
