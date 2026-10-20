import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryKV } from '@isaii/cache'
import { findUserById, upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { signHmacHex, signStandardWebhook } from '@isaii/security'
import { chargeCredits, createDodoCheckout, createRazorpayOrder, getProduct, grantPurchase, parseDodoWebhook, parseRazorpayWebhook, withCharge } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 30_000)
afterAll(() => close())

describe('credits', () => {
  it('charges, refuses overdraft and refunds when work fails', async () => {
    const u = await upsertUserOnSignIn(db, { email: 'c@x.in' }, 10)
    expect(await chargeCredits(db, u.id, 4, 'generate_5min')).toBe(6)
    await expect(chargeCredits(db, u.id, 7, 'generate_10min')).rejects.toThrow(/Not enough credits/)
    await expect(withCharge(db, u.id, 5, 'upload', async () => { throw new Error('storage down') })).rejects.toThrow('storage down')
    expect((await findUserById(db, u.id))!.credits).toBe(6)
  })
})

describe('grantPurchase', () => {
  it('grants once per payment ref, switches plan only for plans', async () => {
    const kv = new MemoryKV()
    const u = await upsertUserOnSignIn(db, { email: 'buyer@x.in' }, 0)
    const g = { provider: 'razorpay' as const, paymentRef: 'order_A', userId: u.id, productId: 'pro', amountMinor: 299900, currency: 'INR' }
    expect(await grantPurchase({ db, kv }, g)).toBe('granted')
    expect(await grantPurchase({ db, kv }, g)).toBe('duplicate')
    expect(await grantPurchase({ db, kv: new MemoryKV() }, g)).toBe('duplicate')
    expect(await grantPurchase({ db, kv }, { ...g, paymentRef: 'order_B', productId: 'pack_30' })).toBe('granted')
    const after = (await findUserById(db, u.id))!
    expect(after.credits).toBe(230)
    expect(after.plan).toBe('pro')
  })
  it('refuses unknown products and users', async () => {
    const kv = new MemoryKV()
    expect(await grantPurchase({ db, kv }, { provider: 'dodo', paymentRef: 'p1', userId: '00000000-0000-0000-0000-000000000000', productId: 'pro' })).toBe('unknown_user')
    expect(await grantPurchase({ db, kv }, { provider: 'dodo', paymentRef: 'p2', userId: 'x', productId: 'nope' })).toBe('unknown_product')
  })
})

describe('Razorpay', () => {
  it('creates an INR order in paise with notes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'order_1', amount: 299900 }), { status: 200 }))
    const r = await createRazorpayOrder({ keyId: 'k', keySecret: 's' }, getProduct('pro')!, { userId: 'u', productId: 'pro' }, fetchImpl as never)
    expect(r).toEqual({ orderId: 'order_1', amount: 299900 })
    expect(JSON.parse(fetchImpl.mock.calls[0]![1].body)).toMatchObject({ amount: 299900, currency: 'INR', notes: { userId: 'u' } })
  })
  it('parses only signed order.paid events', () => {
    const raw = JSON.stringify({ event: 'order.paid', payload: { order: { entity: { id: 'order_9', amount_paid: 39900, currency: 'INR', notes: { userId: 'u1', productId: 'lite' } } } } })
    expect(parseRazorpayWebhook(raw, 'bad', 'sec')).toEqual({ ok: false, reason: 'invalid_signature' })
    const ok = parseRazorpayWebhook(raw, signHmacHex(raw, 'sec'), 'sec')
    expect(ok.ok && ok.grant).toMatchObject({ paymentRef: 'order_9', userId: 'u1', productId: 'lite' })
    const other = JSON.stringify({ event: 'payment.failed' })
    const r = parseRazorpayWebhook(other, signHmacHex(other, 'sec'), 'sec')
    expect(r.ok && r.grant).toBeNull()
  })
})

describe('Dodo', () => {
  it('creates a checkout for the mapped product and fails clearly when unmapped', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ checkout_url: 'https://test.checkout.dodopayments.com/s/1' }), { status: 200 }))
    const cfg = { apiKey: 'k', env: 'test' as const, productIds: { pro: 'pdt_pro' } }
    expect(await createDodoCheckout(cfg, 'pro', { email: 'a@b.c' }, 'https://isaii.si/dashboard', { userId: 'u', productId: 'pro' }, fetchImpl as never)).toEqual({ url: 'https://test.checkout.dodopayments.com/s/1' })
    await expect(createDodoCheckout(cfg, 'agency', { email: 'a@b.c' }, 'r', { userId: 'u', productId: 'agency' }, fetchImpl as never)).rejects.toThrow('No Dodo product')
  })
  it('parses signed payment.succeeded events with metadata', () => {
    const secret = 'whsec_' + Buffer.from('k').toString('base64')
    const raw = JSON.stringify({ type: 'payment.succeeded', data: { payment_id: 'pay_1', total_amount: 3900, currency: 'USD', metadata: { userId: 'u', productId: 'pro' } } })
    const ts = '1800000000'
    const sig = signStandardWebhook(raw, 'msg_1', ts, secret)
    const r = parseDodoWebhook(raw, { id: 'msg_1', timestamp: ts, signature: sig }, secret, () => 1_800_000_000_000)
    expect(r.ok && r.grant).toMatchObject({ paymentRef: 'pay_1', productId: 'pro', amountMinor: 3900 })
    expect(parseDodoWebhook(raw, { id: 'msg_1', timestamp: ts, signature: sig }, secret, () => 1_900_000_000_000)).toEqual({ ok: false, reason: 'invalid_signature' })
  })
})
