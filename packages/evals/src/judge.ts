import * as z from 'zod'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { getPrompt } from '@isaii/prompts'
import type { AIGateway } from '@isaii/ai-gateway'

export const Judgement = z.object({
  scores: z.array(z.object({ criterion: z.string(), score: z.number(), reason: z.string() })),
  overall: z.number(),
  issues: z.array(z.string()),
})
export type Judgement = z.infer<typeof Judgement>

export const loadRubric = (name: string) => readFile(fileURLToPath(new URL(`../rubrics/${name}.md`, import.meta.url)), 'utf8')

/** Claude-as-judge with an explicit rubric. Scores 1–10 per criterion. */
export async function judge(gateway: AIGateway, rubricName: string, candidate: unknown, context: string): Promise<Judgement> {
  const rubric = await loadRubric(rubricName)
  return gateway.generateJSON('judge', {
    system: getPrompt('judge').text,
    user: `RUBRIC:\n${rubric}\n\nCONTEXT:\n${context}\n\nCANDIDATE:\n${JSON.stringify(candidate, null, 2)}`,
    schema: Judgement,
  })
}
