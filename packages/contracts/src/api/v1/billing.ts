import * as z from 'zod'

export const CheckoutRequest = z.object({ productId: z.string(), currency: z.enum(['INR', 'USD']) })
export const CheckoutResponse = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('razorpay'), keyId: z.string(), orderId: z.string(), amount: z.number().int(),
    currency: z.literal('INR'), name: z.string(), description: z.string(),
    prefill: z.object({ email: z.string().optional(), name: z.string().optional() }),
  }),
  z.object({ provider: z.literal('dodo'), url: z.url() }),
])
