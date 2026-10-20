import { r2FromEnv } from './r2'
import type { BlobStore } from './types'

export type { BlobStore, PutOptions } from './types'
export { R2Store, r2FromEnv } from './r2'
export type { R2Config } from './r2'
export { MemoryStore } from './memory'
export { storageKeys } from './keys'

let store: BlobStore | null = null
/** Process-wide store (R2 from env), overridable for tests. */
export const getStore = (): BlobStore => (store ??= r2FromEnv())
export const setStore = (s: BlobStore | null) => { store = s }
