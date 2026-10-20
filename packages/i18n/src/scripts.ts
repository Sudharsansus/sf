import type { Script } from './languages'

/** Unicode ranges used to detect which script a string is written in. */
export const SCRIPT_RANGES: Record<Exclude<Script, 'Latn' | 'Jpan' | 'Hans'>, [number, number]> & { Latn: [number, number] } = {
  Latn: [0x0041, 0x024f],
  Deva: [0x0900, 0x097f],
  Beng: [0x0980, 0x09ff],
  Guru: [0x0a00, 0x0a7f],
  Gujr: [0x0a80, 0x0aff],
  Orya: [0x0b00, 0x0b7f],
  Taml: [0x0b80, 0x0bff],
  Telu: [0x0c00, 0x0c7f],
  Knda: [0x0c80, 0x0cff],
  Mlym: [0x0d00, 0x0d7f],
  Arab: [0x0600, 0x06ff],
  Hang: [0xac00, 0xd7af],
}

