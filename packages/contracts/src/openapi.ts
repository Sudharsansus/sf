import * as z from 'zod'
import { ErrorBody } from './common'
import { CheckoutRequest, CheckoutResponse, Episode, GenerateRequest, GenerateResponse, ProduceRequest } from './api/v1'

type Route = { method: 'get' | 'post' | 'patch'; path: string; summary: string; body?: z.ZodType; response: z.ZodType }

export const ROUTES: Route[] = [
  { method: 'post', path: '/v1/generations', summary: 'Start research + 5 scripts for a topic', body: GenerateRequest, response: GenerateResponse },
  { method: 'get', path: '/v1/episodes/{id}', summary: 'Get an episode and its progress', response: Episode },
  { method: 'post', path: '/v1/episodes/{id}/produce', summary: 'Produce the chosen script (voice, thumbnails, SEO)', body: ProduceRequest, response: Episode },
  { method: 'post', path: '/v1/billing/checkout', summary: 'Start a checkout (Razorpay ₹ or Dodo $)', body: CheckoutRequest, response: CheckoutResponse },
]

const schema = (s: z.ZodType) => z.toJSONSchema(s, { target: 'openapi-3.0', unrepresentable: 'any' })

/** OpenAPI 3.0 document generated from the zod contracts. */
export function buildOpenAPI(version = '1.0.0') {
  const paths: Record<string, Record<string, unknown>> = {}
  for (const r of ROUTES) {
    paths[r.path] ??= {}
    paths[r.path]![r.method] = {
      summary: r.summary,
      ...(r.path.includes('{id}') ? { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] } : {}),
      ...(r.body ? { requestBody: { required: true, content: { 'application/json': { schema: schema(r.body) } } } } : {}),
      responses: {
        200: { description: 'OK', content: { 'application/json': { schema: schema(r.response) } } },
        default: { description: 'Error', content: { 'application/json': { schema: schema(ErrorBody) } } },
      },
    }
  }
  return {
    openapi: '3.0.3',
    info: { title: 'ISAII API', version },
    servers: [{ url: 'https://api.isaii.si' }],
    components: { securitySchemes: { apiKey: { type: 'http', scheme: 'bearer' } } },
    security: [{ apiKey: [] }],
    paths,
  }
}
