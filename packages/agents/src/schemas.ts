import * as z from 'zod'

export const ScriptLine = z.object({ speaker: z.enum(['A', 'B']), text: z.string() })
export const Speaker = z.object({ id: z.enum(['A', 'B']), name: z.string(), personality: z.string() })

export const Research = z.object({
  summary: z.string(),
  key_facts: z.array(z.string()),
  angles: z.array(z.object({ name: z.string(), description: z.string() })),
  controversy: z.string(),
  trending: z.string(),
  target_audience: z.string(),
  hook: z.string(),
})

export const Script = z.object({
  angle: z.string(),
  title: z.string(),
  hook: z.string(),
  duration_estimate_seconds: z.number(),
  speakers: z.array(Speaker),
  lines: z.array(ScriptLine),
})
export const Scripts = z.object({ scripts: z.array(Script) })

const METRICS = ['engagement', 'clarity', 'uniqueness', 'seo_potential', 'viral_potential', 'pacing', 'reusability', 'monetization', 'authority', 'feasibility'] as const
export const Evaluation = z.object({
  scores: z.array(z.object({
    angle: z.string(),
    title: z.string(),
    metrics: z.object(Object.fromEntries(METRICS.map(k => [k, z.number()])) as Record<(typeof METRICS)[number], z.ZodNumber>),
    total: z.number(),
    verdict: z.string(),
    best_for: z.string(),
  })),
  winner: z.string(),
  runner_up: z.string(),
})

export const Refined = z.object({
  duration_label: z.string(),
  duration_estimate_seconds: z.number(),
  title: z.string(),
  speakers: z.array(Speaker),
  lines: z.array(ScriptLine),
})

export const SEO = z.object({
  youtube: z.object({
    title: z.string(), title_b: z.string(), description: z.string(), tags: z.array(z.string()),
    chapters: z.array(z.object({ time: z.string(), label: z.string() })), pinned_comment: z.string(),
  }),
  instagram: z.object({ caption: z.string(), hashtags: z.array(z.string()) }),
  twitter_thread: z.array(z.string()),
  linkedin: z.string(),
  blog_post: z.string(),
  newsletter: z.string(),
  clip_timestamps: z.array(z.object({ start_line: z.number(), end_line: z.number(), hook: z.string(), duration_seconds: z.number() })),
})

export const ThumbnailDesigns = z.object({
  variants: z.array(z.object({
    layout: z.enum(['bold-left', 'centered', 'split']),
    headline: z.string(),
    kicker: z.string(),
    background: z.string(),
    accent: z.string(),
    text: z.string(),
  })),
})

export type ScriptLine = z.infer<typeof ScriptLine>
export type Research = z.infer<typeof Research>
export type Script = z.infer<typeof Script>
export type Scripts = z.infer<typeof Scripts>
export type Evaluation = z.infer<typeof Evaluation>
export type Refined = z.infer<typeof Refined>
export type SEO = z.infer<typeof SEO>
export type ThumbnailDesign = z.infer<typeof ThumbnailDesigns>['variants'][number]
