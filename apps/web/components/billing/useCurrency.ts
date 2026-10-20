'use client'
import { useEffect, useState } from 'react'
import type { Currency } from '@/lib/billing'

/** ₹ for visitors in India (by timezone), $ elsewhere. Remembers a manual choice. */
export function useCurrency(): [Currency, (c: Currency) => void] {
  const [currency, setCurrency] = useState<Currency>('INR')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isaii:currency')
      if (saved === 'INR' || saved === 'USD') { setCurrency(saved); return }
    } catch {}
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    setCurrency(tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta' ? 'INR' : 'USD')
  }, [])
  const choose = (c: Currency) => {
    setCurrency(c)
    try { localStorage.setItem('isaii:currency', c) } catch {}
  }
  return [currency, choose]
}
