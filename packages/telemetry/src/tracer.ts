import { trace, SpanStatusCode, type Span, type Attributes } from '@opentelemetry/api'

const tracer = trace.getTracer('isaii')

/** Run `fn` inside a span; records exceptions and sets error status. No-op without an OTel SDK. */
export async function withSpan<T>(name: string, attrs: Attributes, fn: (span: Span) => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, { attributes: attrs }, async span => {
    try {
      return await fn(span)
    } catch (e) {
      span.recordException(e as Error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error).message })
      throw e
    } finally {
      span.end()
    }
  })
}
