import { describe, expect, it } from 'vitest'
import { buildCues, toSRT, toVTT } from '../src'

describe('captions', () => {
  it('splits long lines into readable cues within the line duration', () => {
    const cues = buildCues([{ text: 'one two three four five six seven eight nine ten eleven twelve', start: 0, end: 6 }], { maxChars: 20 })
    expect(cues.length).toBeGreaterThan(1)
    expect(cues.every(c => c.text.length <= 20)).toBe(true)
    expect(cues.at(-1)!.end).toBeCloseTo(6)
  })
  it('estimates timings and keeps cues in order (Indian scripts too)', () => {
    const cues = buildCues([{ text: 'ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸ್ವಾಗತ' }, { text: 'आज हम कहानी सुनेंगे' }])
    expect(cues[1]!.start).toBeGreaterThan(cues[0]!.end)
  })
  it('formats SRT and WebVTT timestamps', () => {
    const cues = [{ start: 61.5, end: 3725.004, text: 'hi' }]
    expect(toSRT(cues)).toBe('1\n00:01:01,500 --> 01:02:05,004\nhi\n')
    expect(toVTT(cues)).toContain('00:01:01.500 --> 01:02:05.004')
  })
})
