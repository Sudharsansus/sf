import { describe, expect, it } from 'vitest'
import { detectScript, isInScript } from '../src'

describe('detectScript', () => {
  it.each([
    ['ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸ್ವಾಗತ', 'Knda'],
    ['నిజంగా చార్మినార్ కథ', 'Telu'],
    ['പരിപാടിയിലേക്ക് സ്വാഗതം', 'Mlym'],
    ['আজ আমরা গল্প শুনব', 'Beng'],
    ['आज हम कहानी सुनेंगे', 'Deva'],
    ['இன்று கதையைக் கேட்போம்', 'Taml'],
    ['پروگرام میں خوش آمدید', 'Arab'],
    ['Welcome to the show', 'Latn'],
  ])('%s → %s', (text, script) => {
    expect(detectScript(text).script).toBe(script)
  })
  it('flags text written in the wrong script', () => {
    expect(isInScript('Welcome to the show', 'Knda')).toBe(false)
    expect(isInScript('ಇಂದು ಮೈಸೂರು podcast', 'Knda', 0.4)).toBe(true)
  })
  it('handles empty text', () => {
    expect(detectScript('123 !!')).toEqual({ script: 'unknown', share: 0 })
  })
})
