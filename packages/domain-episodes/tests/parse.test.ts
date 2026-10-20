import { describe, expect, it } from 'vitest'
import { extractText, parseScriptLines } from '../src'

describe('parseScriptLines', () => {
  it('reads A/B, Host/Guest and Speaker labels', () => {
    expect(parseScriptLines('A: Hello\nB: Hi there\nHost: Welcome\nGuest: Thanks\nSpeaker 2: ok')).toEqual([
      { speaker: 'A', text: 'Hello' }, { speaker: 'B', text: 'Hi there' }, { speaker: 'A', text: 'Welcome' }, { speaker: 'B', text: 'Thanks' }, { speaker: 'B', text: 'ok' },
    ])
  })
  it('maps named speakers in any script, keeping Unicode text', () => {
    const lines = parseScriptLines('ಕಾವ್ಯ: ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸ್ವಾಗತ\nरवि: नमस्ते दोस्तों\nಕಾವ್ಯ: ಮುಂದುವರಿಸೋಣ')
    expect(lines.map(l => l.speaker)).toEqual(['A', 'B', 'A'])
    expect(lines[1]!.text).toBe('नमस्ते दोस्तों')
  })
  it('alternates unlabelled paragraphs and splits long ones', () => {
    const long = Array.from({ length: 50 }, (_, i) => `w${i}`).join(' ')
    const lines = parseScriptLines(`First paragraph here\n\n${long}`)
    expect(lines.map(l => l.speaker)).toEqual(['A', 'B', 'A'])
  })
})

describe('extractText', () => {
  it('decodes UTF-8 text files and strips a BOM', async () => {
    const bytes = new TextEncoder().encode('\uFEFFதமிழ் script')
    expect(await extractText(bytes, 'script.txt')).toBe('தமிழ் script')
  })
  it('rejects unsupported types', async () => {
    await expect(extractText(new Uint8Array([1]), 'x.exe')).rejects.toThrow('.docx')
  })
})
