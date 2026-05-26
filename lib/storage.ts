import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from './logger'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})
const BUCKET = process.env.R2_BUCKET!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

export async function uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: buffer,
    ContentType: contentType, CacheControl: 'public, max-age=31536000'
  }))
  return `${PUBLIC_URL}/${key}`
}

export async function uploadFromUrl(sourceUrl: string, key: string, contentType = 'audio/mpeg'): Promise<string> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return uploadBuffer(buffer, key, contentType)
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
}
