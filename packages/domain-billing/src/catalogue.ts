import { formatMoney, type Currency } from '@isaii/core'

export type Product = {
  id: string
  kind: 'plan' | 'pack'
  name: string
  credits: number
  inr: number
  usd: number
  plan?: string
  blurb: string
}

/** Prices are 30-day passes for plans and one-off for packs. Credits never expire. */
export const PRODUCTS: Product[] = [
  { id: 'lite', kind: 'plan', plan: 'lite', name: 'Lite', credits: 15, inr: 399, usd: 6, blurb: 'Try it for real' },
  { id: 'starter', kind: 'plan', plan: 'starter', name: 'Starter', credits: 60, inr: 1299, usd: 19, blurb: 'Best for creators' },
  { id: 'pro', kind: 'plan', plan: 'pro', name: 'Pro', credits: 200, inr: 2999, usd: 39, blurb: 'Most popular' },
  { id: 'studio', kind: 'plan', plan: 'studio', name: 'Studio', credits: 600, inr: 5999, usd: 79, blurb: 'For studios' },
  { id: 'agency', kind: 'plan', plan: 'agency', name: 'Agency', credits: 2000, inr: 14999, usd: 199, blurb: 'For agencies' },
  { id: 'pack_30', kind: 'pack', name: '30 minutes', credits: 30, inr: 899, usd: 12, blurb: 'Top-up' },
  { id: 'pack_60', kind: 'pack', name: '1 hour', credits: 60, inr: 1599, usd: 22, blurb: 'Top-up' },
  { id: 'pack_120', kind: 'pack', name: '2 hours', credits: 120, inr: 2999, usd: 40, blurb: 'Top-up' },
  { id: 'pack_300', kind: 'pack', name: '5 hours', credits: 300, inr: 6499, usd: 89, blurb: 'Top-up' },
]

export const getProduct = (id: string) => PRODUCTS.find(p => p.id === id)
export const PLAN_PRODUCTS = PRODUCTS.filter(p => p.kind === 'plan')
export const PACK_PRODUCTS = PRODUCTS.filter(p => p.kind === 'pack')

export const priceMinor = (p: Product, currency: Currency) => (currency === 'INR' ? p.inr : p.usd) * 100
export const formatPrice = (p: Product, currency: Currency) => formatMoney({ amount: priceMinor(p, currency), currency })
export const perMinute = (p: Product, currency: Currency) => (currency === 'INR' ? p.inr : p.usd) / p.credits
