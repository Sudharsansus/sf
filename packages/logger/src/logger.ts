import { redact } from './redact'

export type Level = 'debug' | 'info' | 'warn' | 'error'
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export type Logger = {
  debug(msg: string, ctx?: Record<string, unknown>): void
  info(msg: string, ctx?: Record<string, unknown>): void
  warn(msg: string, ctx?: Record<string, unknown>): void
  error(msg: string, ctx?: Record<string, unknown>): void
  child(bindings: Record<string, unknown>): Logger
}

export type LoggerOptions = {
  level?: Level
  bindings?: Record<string, unknown>
  /** json in production; pretty single lines in development */
  format?: 'json' | 'pretty'
  write?: (line: string, level: Level) => void
}

export function createLogger(opts: LoggerOptions = {}): Logger {
  const level = opts.level ?? ((process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'))
  const format = opts.format ?? (process.env.NODE_ENV === 'production' ? 'json' : 'pretty')
  const bindings = opts.bindings ?? {}
  const write = opts.write ?? ((line, lvl) => (lvl === 'error' ? console.error(line) : lvl === 'warn' ? console.warn(line) : process.stdout.write(line + '\n')))

  const log = (lvl: Level, msg: string, ctx?: Record<string, unknown>) => {
    if (ORDER[lvl] < ORDER[level]) return
    const data = redact({ ...bindings, ...ctx }) as Record<string, unknown>
    const time = new Date().toISOString()
    write(format === 'json'
      ? JSON.stringify({ time, level: lvl, msg, ...data })
      : `[${time}] ${lvl.toUpperCase().padEnd(5)} ${msg}${Object.keys(data).length ? ' ' + JSON.stringify(data) : ''}`, lvl)
  }

  return {
    debug: (m, c) => log('debug', m, c),
    info: (m, c) => log('info', m, c),
    warn: (m, c) => log('warn', m, c),
    error: (m, c) => log('error', m, c),
    child: b => createLogger({ ...opts, level, format, bindings: { ...bindings, ...b } }),
  }
}

export const logger = createLogger()
