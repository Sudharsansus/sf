import * as z from 'zod'

export const Id = z.string().min(1).max(64)
export const LanguageCode = z.string().regex(/^[a-z]{2}(-[a-z]{2})?$/)
export const DurationLabel = z.enum(['1min', '2min', '5min', '10min', '15min', '20min', '30min', '45min', '60min'])
export const Speaker = z.enum(['A', 'B'])
export const ScriptLine = z.object({ speaker: Speaker, text: z.string().min(1) })

export const ErrorBody = z.object({ error: z.string(), code: z.string().optional(), details: z.record(z.string(), z.unknown()).optional() })
export const Paginated = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), page: z.number().int(), limit: z.number().int(), hasMore: z.boolean() })
