export type Voice = { id: string; name: string; gender: 'F' | 'M'; accent: string }

/** ElevenLabs premade voices offered in the studio. */
export const VOICES: Voice[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'F', accent: 'American' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'F', accent: 'American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'F', accent: 'American' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'M', accent: 'American' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'F', accent: 'American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'M', accent: 'American' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'M', accent: 'American' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'M', accent: 'American' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'M', accent: 'American' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', gender: 'F', accent: 'American' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'M', accent: 'British' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'M', accent: 'British' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'F', accent: 'British' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'F', accent: 'British' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'M', accent: 'American' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'M', accent: 'American' },
]

export const DEFAULT_VOICES = {
  A: process.env.ELEVENLABS_VOICE_A || '21m00Tcm4TlvDq8ikWAM',
  B: process.env.ELEVENLABS_VOICE_B || 'AZnzlk1XvdvUeBnXmlld',
}
export const isKnownVoice = (id: string) => VOICES.some(v => v.id === id)
