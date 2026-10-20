import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useCurrency } from '@/components/billing/useCurrency'

const tz = (timeZone: string) =>
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({ timeZone } as Intl.ResolvedDateTimeFormatOptions)

afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })

describe('useCurrency', () => {
  it('defaults to INR in India and USD elsewhere', async () => {
    tz('Asia/Kolkata')
    const india = renderHook(() => useCurrency())
    await waitFor(() => expect(india.result.current[0]).toBe('INR'))
    vi.restoreAllMocks(); tz('Europe/Berlin')
    const abroad = renderHook(() => useCurrency())
    await waitFor(() => expect(abroad.result.current[0]).toBe('USD'))
  })
  it('remembers a manual choice', async () => {
    tz('Asia/Kolkata')
    const first = renderHook(() => useCurrency())
    act(() => first.result.current[1]('USD'))
    const second = renderHook(() => useCurrency())
    await waitFor(() => expect(second.result.current[0]).toBe('USD'))
  })
})
