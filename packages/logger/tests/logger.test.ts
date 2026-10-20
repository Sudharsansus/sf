import { describe, expect, it } from 'vitest'
import { createLogger, type Level } from '../src'

describe('createLogger', () => {
  it('writes JSON with bindings, respects level, redacts', () => {
    const lines: [string, Level][] = []
    const log = createLogger({ format: 'json', level: 'info', write: (l, lvl) => lines.push([l, lvl]) })
      .child({ requestId: 'r1' })
    log.debug('hidden')
    log.info('charged', { userId: 'u1', secret: 's' })
    expect(lines).toHaveLength(1)
    const [line, lvl] = lines[0]!
    expect(lvl).toBe('info')
    expect(JSON.parse(line)).toMatchObject({ level: 'info', msg: 'charged', requestId: 'r1', userId: 'u1', secret: '[redacted]' })
  })
})
