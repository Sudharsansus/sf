import type { BlobStore, PutOptions } from './types'

/** In-memory store for tests and offline development. */
export class MemoryStore implements BlobStore {
  readonly objects = new Map<string, { body: Uint8Array; contentType: string }>()
  constructor(private readonly base = 'memory://blobs') {}
  async put(key: string, body: Uint8Array, opts: PutOptions) {
    this.objects.set(key, { body, contentType: opts.contentType })
    return this.publicUrl(key)
  }
  async get(key: string) { return this.objects.get(key)?.body ?? null }
  async delete(key: string) { this.objects.delete(key) }
  publicUrl(key: string) { return `${this.base}/${key}` }
  async signedUrl(key: string) { return `${this.publicUrl(key)}?signed=1` }
}
