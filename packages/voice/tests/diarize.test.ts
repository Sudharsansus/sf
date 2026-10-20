import { describe, expect, it } from 'vitest'
import { wordsToLines, type Word } from '../src'

const w = (text: string, speakerId: string, type: Word['type'] = 'word'): Word => ({ text, type, speakerId })

describe('wordsToLines', () => {
  it('maps the first voice to A, the second to B and folds extras into B', () => {
    const lines = wordsToLines([w('Hi', 's1'), w(' ', 's1', 'spacing'), w('there.', 's1'), w('Hello', 's2'), w('Yo', 's3'), w('[laughs]', 's1', 'audio_event')])
    expect(lines).toEqual([{ speaker: 'A', text: 'Hi there.' }, { speaker: 'B', text: 'HelloYo' }])
  })
  it('splits long turns at sentence ends, including Devanagari danda', () => {
    const words: Word[] = []
    for (let i = 0; i < 4; i++) { words.push(w('शब्द', 's1'), w(' ', 's1', 'spacing')) }
    words.push(w('खत्म।', 's1'), w(' ', 's1', 'spacing'), w('अगला', 's1'))
    const lines = wordsToLines(words, '', 5)
    expect(lines).toHaveLength(2)
    expect(lines[0]!.text.endsWith('।')).toBe(true)
  })
  it('falls back to the plain transcript', () => {
    expect(wordsToLines([], 'just text')).toEqual([{ speaker: 'A', text: 'just text' }])
  })
})
