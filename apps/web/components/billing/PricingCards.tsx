'use client'
import type { Currency } from '@isaii/core'
import { PLAN_PRODUCTS, PACK_PRODUCTS, formatPrice } from '@isaii/domain-billing/catalogue'
import { BuyButton } from './BuyButton'
import { useCurrency } from './useCurrency'

type Theme = { bg: string; surface: string; border: string; border2: string; text: string; muted: string; subtle: string; accent: string; accentFg: string }
const ORANGE = '#f97316'

export function CurrencyToggle({ c, dark, currency, setCurrency }: { c: Theme; dark: boolean; currency: Currency; setCurrency: (c: Currency) => void }) {
  return (
    <div role="radiogroup" aria-label="Currency" style={{ display: 'inline-flex', background: dark ? 'rgba(255,255,255,0.06)' : c.surface, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : c.border}`, borderRadius: 10, padding: 4, gap: 2 }}>
      {([['INR', '₹ INR · UPI'], ['USD', '$ USD']] as const).map(([cur, label]) => (
        <button key={cur} role="radio" aria-checked={currency === cur} onClick={() => setCurrency(cur)}
          style={{ fontSize: 13, fontWeight: 500, padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all .2s',
            background: currency === cur ? c.accent : 'transparent', color: currency === cur ? c.accentFg : (dark ? '#aaa' : c.muted) }}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function PricingCards({ c, dark, showPacks = true }: { c: Theme; dark: boolean; showPacks?: boolean }) {
  const [currency, setCurrency] = useCurrency()
  const perMin = (price: number, credits: number) =>
    currency === 'INR' ? `₹${(price / credits).toFixed(price / credits < 10 ? 1 : 0)}/min` : `$${(price / credits).toFixed(2)}/min`

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <CurrencyToggle c={c} dark={dark} currency={currency} setCurrency={setCurrency} />
        <p style={{ fontSize: 11, color: c.subtle, marginTop: 10 }}>
          {currency === 'INR' ? 'Pay with UPI, cards or netbanking via Razorpay. Prices include GST where applicable.' : 'Secure card checkout via Dodo Payments.'}
        </p>
      </div>

      <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 20 }}>
        <PlanCard c={c} dark={dark} name="Free" desc="No card needed" price={currency === 'INR' ? '₹0' : '$0'} sub="10 min free · forever">
          <a href="/login" style={btn(c, false)}>Get started free</a>
        </PlanCard>
        {PLAN_PRODUCTS.map(p => {
          const popular = p.id === 'pro'
          return (
            <PlanCard key={p.id} c={c} dark={dark} name={p.name} desc={p.blurb} popular={popular}
              price={formatPrice(p, currency)} sub={`${p.credits} min · ${perMin(currency === 'INR' ? p.inr : p.usd, p.credits)}`}>
              <BuyButton productId={p.id} currency={currency} style={btn(c, popular)}>Get {p.name}</BuyButton>
            </PlanCard>
          )
        })}
      </div>
      <p style={{ fontSize: 11, color: c.subtle, textAlign: 'center', marginBottom: showPacks ? 28 : 0 }}>
        Plans are 30-day passes: minutes are added to your balance and never expire. Cancel anytime — there’s nothing to cancel.
      </p>

      {showPacks && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: c.subtle, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>Need more minutes? Top up</p>
          <div className="l-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, maxWidth: 860, margin: '0 auto 32px' }}>
            {PACK_PRODUCTS.map(p => (
              <div key={p.id} style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{formatPrice(p, currency)}</span>
                </div>
                <BuyButton productId={p.id} currency={currency} style={{ ...btn(c, false), padding: '7px', fontSize: 12 }}>Buy</BuyButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function btn(c: Theme, primary: boolean) {
  return {
    display: 'block', width: '100%', textAlign: 'center' as const, fontSize: 13, fontWeight: 500, padding: '10px', borderRadius: 8,
    border: `1px solid ${primary ? ORANGE : c.border}`, background: primary ? ORANGE : 'transparent', color: primary ? '#fff' : c.text,
    boxSizing: 'border-box' as const, fontFamily: 'inherit',
  }
}

function PlanCard({ c, dark, name, desc, price, sub, popular, children }: {
  c: Theme; dark: boolean; name: string; desc: string; price: string; sub: string; popular?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ border: `1px solid ${popular ? ORANGE : c.border}`, borderRadius: 14, padding: '24px 18px', position: 'relative', display: 'flex', flexDirection: 'column',
      background: popular ? (dark ? 'rgba(249,115,22,0.05)' : 'rgba(249,115,22,0.03)') : 'transparent' }}>
      {popular
        ? <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, letterSpacing: .8, color: ORANGE, background: dark ? '#0a0a0a' : '#fff', border: '1px solid rgba(249,115,22,0.5)', padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
        : <div style={{ fontSize: 10, fontWeight: 600, color: dark ? '#aaa' : c.subtle, marginBottom: 10, letterSpacing: .3 }}>{desc}</div>}
      {popular && <div style={{ marginBottom: 10 }} />}
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1, marginBottom: 6 }}>{price}</div>
      <div style={{ fontSize: 11, color: dark ? '#888' : c.subtle, marginBottom: 20, flex: 1 }}>{sub}</div>
      {children}
    </div>
  )
}
