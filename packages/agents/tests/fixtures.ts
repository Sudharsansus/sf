import type { Script } from '../src'

export const script = (angle: string, lines = 4): Script => ({
  angle, title: `${angle} title`, hook: 'hook', duration_estimate_seconds: 60,
  speakers: [{ id: 'A', name: 'Asha', personality: 'curious' }, { id: 'B', name: 'Ravi', personality: 'expert' }],
  lines: Array.from({ length: lines }, (_, i) => ({ speaker: i % 2 ? 'B' as const : 'A' as const, text: `line ${i}` })),
})

export const research = { summary: 's', key_facts: ['f'], angles: [{ name: 'a', description: 'd' }], controversy: 'c', trending: 't', target_audience: 'ta', hook: 'h' }
