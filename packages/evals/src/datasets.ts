import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { LANGUAGES, CODE_MIXED } from '@isaii/i18n'

export type TopicCase = { id: string; topic: string; region: 'india' | 'global' }
export type AdversarialCase = { id: string; topic: string; expect: 'blocked' | 'allowed' }

async function jsonl<T>(name: string): Promise<T[]> {
  const raw = await readFile(fileURLToPath(new URL(`../datasets/${name}`, import.meta.url)), 'utf8')
  return raw.split('\n').filter(Boolean).map(l => JSON.parse(l) as T)
}

export const loadTopics = () => jsonl<TopicCase>('topics.jsonl')
export const loadAdversarial = () => jsonl<AdversarialCase>('adversarial.jsonl')

/** Indian languages first — the product's focus — then code-mixed, then global. */
export const EVAL_LANGUAGES = [
  ...LANGUAGES.filter(l => l.region === 'india'),
  ...CODE_MIXED,
  ...LANGUAGES.filter(l => l.region === 'global'),
].map(l => l.code)
