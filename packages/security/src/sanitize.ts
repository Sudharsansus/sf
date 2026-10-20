/* eslint-disable no-control-regex -- this module exists to strip control characters */
/** Trim, cap length and strip tags/control characters while keeping every Unicode script intact. */
export function sanitizeText(input: unknown, maxLen = 200): string {
  return String(input ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen)
}

/** Safe filename for storage keys (keeps letters from any script). */
export function safeFilename(name: string, maxLen = 80): string {
  return name.normalize('NFC').replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').replace(/\s+/g, ' ').trim().slice(0, maxLen) || 'file'
}
