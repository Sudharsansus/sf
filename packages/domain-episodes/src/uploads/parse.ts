import { AppError, ErrorCode } from '@isaii/core'

export type ParsedLine = { speaker: 'A' | 'B'; text: string }

const LABEL = /^\s*(?:\*\*)?\s*(A|B|Speaker\s*[AB12]|Host|Guest|Interviewer|Interviewee|[\p{L}][\p{L}\p{M} .'-]{0,24})\s*(?:\*\*)?\s*[:：–-]\s+/iu

/**
 * Split a script into A/B lines. Understands "A:", "Speaker B:", "Host:"/"Guest:" and named speakers
 * ("Priya: …", "ಕಾವ್ಯ: …") — the first name seen becomes A, the second B. Unlabelled text alternates.
 */
export function parseScriptLines(text: string, maxWordsPerLine = 40): ParsedLine[] {
  const names = new Map<string, 'A' | 'B'>()
  const speakerFor = (label: string): 'A' | 'B' => {
    const l = label.trim().toLowerCase()
    if (/^(a|speaker\s*[a1]|host|interviewer)$/.test(l)) return 'A'
    if (/^(b|speaker\s*[b2]|guest|interviewee)$/.test(l)) return 'B'
    if (!names.has(l)) names.set(l, names.size === 0 ? 'A' : 'B')
    return names.get(l)!
  }
  const lines: ParsedLine[] = []
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const m = line.match(LABEL)
    if (m && line.length > m[0].length) {
      lines.push({ speaker: speakerFor(m[1]!), text: line.slice(m[0].length).trim() })
      continue
    }
    const words = line.split(/\s+/)
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      lines.push({ speaker: lines.length % 2 === 0 ? 'A' : 'B', text: words.slice(i, i + maxWordsPerLine).join(' ') })
    }
  }
  return lines
}

/** Extract text from an uploaded script, keeping every Unicode script intact. */
export async function extractText(bytes: Uint8Array, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'txt' || ext === 'md') return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '')
  if (ext === 'docx') {
    const mammoth = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
    return value
  }
  if (ext === 'pdf') {
    const { extractText: pdf, getDocumentProxy } = await import('unpdf')
    const doc = await getDocumentProxy(bytes)
    const { text } = await pdf(doc, { mergePages: true })
    return Array.isArray(text) ? text.join('\n') : text
  }
  throw new AppError(ErrorCode.BAD_REQUEST, 'Upload a .txt, .md, .docx or .pdf file')
}
