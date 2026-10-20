export type PutOptions = { contentType: string; cacheControl?: string }

/** Where generated audio, thumbnails and video are stored. */
export interface BlobStore {
  put(key: string, body: Uint8Array, opts: PutOptions): Promise<string>
  get(key: string): Promise<Uint8Array | null>
  delete(key: string): Promise<void>
  publicUrl(key: string): string
  signedUrl(key: string, expiresInSeconds?: number): Promise<string>
}
