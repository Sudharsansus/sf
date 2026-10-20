import * as z from 'zod'

export class EnvError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid environment:\n  - ${issues.join('\n  - ')}`)
    this.name = 'EnvError'
  }
}

/** Parse env vars against a schema; collects every problem in one error. */
export function loadEnv<S extends z.ZodType>(schema: S, source: Record<string, string | undefined> = process.env): z.infer<S> {
  const res = schema.safeParse(source)
  if (!res.success) {
    throw new EnvError(res.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`))
  }
  return res.data
}

/** Memoised loader so each process validates once. */
export function lazyEnv<S extends z.ZodType>(schema: S): () => z.infer<S> {
  let cached: z.infer<S> | undefined
  return () => (cached ??= loadEnv(schema))
}
