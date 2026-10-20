export type Line = { speaker: string; text: string }

export interface TTSProvider {
  readonly name: string
  modelFor(language: string): string
  synthesize(req: { text: string; voiceId: string; language: string; previous?: string; next?: string }): Promise<Uint8Array>
}

export type Word = { text: string; type: 'word' | 'spacing' | 'audio_event'; speakerId?: string; start?: number; end?: number }

export interface STTProvider {
  readonly name: string
  transcribe(req: { audio: Uint8Array; mimeType: string; language?: string }): Promise<{ text: string; words: Word[] }>
}
