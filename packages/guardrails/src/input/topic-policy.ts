export type PolicyResult = { allowed: boolean; reason?: string }

const BULK = [/generate \d{2,} (articles?|posts?|scripts?|episodes?)/i, /\bbulk (create|generate|produce)\b/i]
const DISALLOWED: [RegExp, string][] = [
  [/\b(child|minor)s?\b.*\b(sexual|nude|explicit)\b|\b(sexual|nude|explicit)\b.*\b(child|minor)s?\b/i, 'sexual content involving minors'],
  [/\bhow to (make|build) (a )?(bomb|explosive|nerve agent)\b/i, 'weapons instructions'],
]

/** Topic-level policy: block disallowed subjects and bulk spam before any spend. */
export function checkTopicPolicy(topic: string): PolicyResult {
  for (const [re, reason] of DISALLOWED) if (re.test(topic)) return { allowed: false, reason: `This topic isn't allowed (${reason}).` }
  for (const re of BULK) if (re.test(topic)) return { allowed: false, reason: 'Bulk generation is not supported — create one episode at a time.' }
  return { allowed: true }
}
