// Transitional shim — callers move to @isaii/storage directly in phase 5.
import { getStore } from '@isaii/storage'

export async function uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
  return getStore().put(key, buffer, { contentType })
}
