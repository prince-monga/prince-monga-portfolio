import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { AppError } from '../middleware/errorHandler'

let client: S3Client | undefined

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new AppError(503, 'Image storage is not configured')
  }
  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new AppError(503, 'Image storage account ID is invalid')
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
  }
}

function getClient() {
  const config = getR2Config()
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }
  return { client, config }
}

export async function putImage(key: string, body: Buffer, contentType: string): Promise<void> {
  const { client: s3, config } = getClient()
  await s3.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentDisposition: 'inline',
    CacheControl: 'private, no-store',
  }))
}

export async function getImage(key: string): Promise<Buffer> {
  const { client: s3, config } = getClient()
  const result = await s3.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }))
  if (!result.Body) throw new AppError(502, 'Image storage returned an empty response')
  return Buffer.from(await result.Body.transformToByteArray())
}

export async function deleteImage(key: string): Promise<void> {
  const { client: s3, config } = getClient()
  await s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }))
}
