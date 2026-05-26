// Sanitized logger — strips all secrets from logs
const REDACT_PATTERNS = [
  /sk-ant-[a-zA-Z0-9\-_]+/g,
  /sk_[a-zA-Z0-9]+/g,
  /r8_[a-zA-Z0-9]+/g,
  /wbl_sk_[a-zA-Z0-9]+/g,
  /Bearer [a-zA-Z0-9\-_\.]+/g,
  /Authorization: [^\s]+/gi,
  /"password":"[^"]+"/g,
  /"token":"[^"]+"/g,
  /"secret":"[^"]+"/g,
  /"apiKey":"[^"]+"/g,
]

function redact(input: string): string {
  let out = input
  REDACT_PATTERNS.forEach(p => { out = out.replace(p, '[REDACTED]') })
  return out
}

function fmt(level: string, msg: string, meta?: any): void {
  const safe = redact(typeof meta === 'object' ? JSON.stringify(meta) : String(meta ?? ''))
  const line = `[${new Date().toISOString()}] ${level} ${redact(msg)} ${safe}`.trim()
  if (level === 'ERROR') console.error(line)
  else console.log(line)
}

export const logger = {
  info:  (msg: string, meta?: any) => fmt('INFO ', msg, meta),
  warn:  (msg: string, meta?: any) => fmt('WARN ', msg, meta),
  error: (msg: string, meta?: any) => fmt('ERROR', msg, meta),
  debug: (msg: string, meta?: any) => { if (process.env.NODE_ENV !== 'production') fmt('DEBUG', msg, meta) }
}
