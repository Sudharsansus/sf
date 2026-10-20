import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { BlobStore, PutOptions } from './types'

export type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicUrl: string }

export class R2Store implements BlobStore {
  private readonly bucket: string
  private readonly base: string
  private readonly client: S3Client

  constructor(cfg: R2Config, client?: S3Client) {
    this.bucket = cfg.bucket
    this.base = cfg.publicUrl.replace(/\/$/, '')
    this.client = client ?? new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    })
  }

  async put(key: string, body: Uint8Array, opts: PutOptions) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket, Key: key, Body: body, ContentType: opts.contentType,
      CacheControl: opts.cacheControl ?? 'public, max-age=31536000, immutable',
    }))
    return this.publicUrl(key)
  }

  async get(key: string) {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
      return res.Body ? new Uint8Array(await res.Body.transformToByteArray()) : null
    } catch (e) {
      if ((e as { name?: string }).name === 'NoSuchKey') return null
      throw e
    }
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  publicUrl(key: string) {
    return `${this.base}/${key}`
  }

  signedUrl(key: string, expiresInSeconds = 3600) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: expiresInSeconds })
  }
}

export function r2FromEnv(env: Record<string, string | undefined> = process.env): R2Store {
  const need = (k: string) => {
    const v = env[k]
    if (!v) throw new Error(`${k} is not set`)
    return v
  }
  return new R2Store({
    accountId: need('R2_ACCOUNT_ID'), accessKeyId: need('R2_ACCESS_KEY_ID'), secretAccessKey: need('R2_SECRET_ACCESS_KEY'),
    bucket: need('R2_BUCKET'), publicUrl: need('R2_PUBLIC_URL'),
  })
}
