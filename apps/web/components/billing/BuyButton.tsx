'use client'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { Currency } from '@/lib/billing'

declare global { interface Window { Razorpay?: any } }

let razorpayScript: Promise<void> | null = null
function loadRazorpay() {
  razorpayScript ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => { razorpayScript = null; reject(new Error('Could not load Razorpay')) }
    document.body.appendChild(s)
  })
  return razorpayScript
}

/** Starts a purchase: ₹ → Razorpay Checkout in place, $ → Dodo hosted checkout. */
export function BuyButton({ productId, currency, children, style, onPaid }: {
  productId: string; currency: Currency; children: ReactNode; style?: CSSProperties; onPaid?: () => void
}) {
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function buy() {
    if (!session) { window.location.href = '/login'; return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, currency }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      if (data.provider === 'dodo') { window.location.href = data.url; return }

      await loadRazorpay()
      const rzp = new window.Razorpay!({
        key: data.keyId, order_id: data.orderId, amount: data.amount, currency: data.currency,
        name: data.name, description: data.description, prefill: data.prefill,
        theme: { color: '#f97316' },
        // Credits arrive via the order.paid webhook a moment later.
        handler: () => { onPaid?.(); window.location.href = '/dashboard?paid=1' },
        modal: { ondismiss: () => setBusy(false) },
      })
      rzp.on('payment.failed', (r: any) => { setError(r?.error?.description || 'Payment failed'); setBusy(false) })
      rzp.open()
    } catch (e: any) {
      setError(e.message || 'Checkout failed')
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={buy} disabled={busy} style={{ cursor: busy ? 'wait' : 'pointer', opacity: busy ? .7 : 1, ...style }}>
        {busy ? 'Opening checkout…' : children}
      </button>
      {error && <p role="alert" style={{ fontSize: 11, color: '#ef4444', marginTop: 6, textAlign: 'center' }}>{error}</p>}
    </>
  )
}
