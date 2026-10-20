import { describe, expect, it } from 'vitest'
import { safeFilename, sanitizeText } from '../src'

describe('sanitize', () => {
  it('keeps Indian scripts and strips tags/control chars', () => {
    expect(sanitizeText('<b>ಕನ್ನಡ</b>\u0007 topic ')).toBe('ಕನ್ನಡ topic')
    expect(sanitizeText('x'.repeat(500), 10)).toHaveLength(10)
  })
  it('makes safe filenames', () => {
    expect(safeFilename('../../etc/passwd')).toBe('.._.._etc_passwd')
    expect(safeFilename('தமிழ் script.docx')).toBe('தமிழ் script.docx')
    expect(safeFilename('   ')).toBe('file')
  })
})
