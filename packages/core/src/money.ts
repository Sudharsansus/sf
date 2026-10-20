export type Currency = 'INR' | 'USD'

/** Amounts are stored in minor units (paise / cents) to avoid float drift. */
export type Money = { amount: number; currency: Currency }

export const fromMajor = (major: number, currency: Currency): Money => ({ amount: Math.round(major * 100), currency })
export const toMajor = (m: Money) => m.amount / 100

export function formatMoney(m: Money): string {
  const major = toMajor(m)
  return m.currency === 'INR'
    ? `₹${major.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    : `$${major.toLocaleString('en-US', { minimumFractionDigits: major % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}
