import { randomUUID } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/errorHandler'
import * as repo from '../repositories/media'
import { deleteImage, getImage, putImage } from '../services/r2'
import { single } from '../utils/response'

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function detectImageType(bytes: Buffer): string | undefined {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  ) return 'image/jpeg'
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return 'image/png'
  if (
    bytes.length >= 6 &&
    ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))
  ) return 'image/gif'
  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) return 'image/webp'
  return undefined
}

function getOriginalName(value: string | undefined): string {
  if (!value) return 'image'

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    throw new AppError(400, 'Invalid image filename')
  }

  const basename = decoded.replaceAll('\\', '/').split('/').pop() ?? ''
  const safeName = basename
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>:"|?*]/g, '_')
    .trim()
    .slice(0, 255)
  return safeName || 'image'
}

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return next(new AppError(400, 'Choose an image to upload'))
    }

    const detectedType = detectImageType(req.body)
    if (!detectedType || !acceptedTypes.has(detectedType)) {
      return next(new AppError(415, 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.'))
    }
    if (req.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase() !== detectedType) {
      return next(new AppError(415, 'Image content does not match its declared file type'))
    }

    const key = `${randomUUID()}.${extensionByType[detectedType]}`
    const originalName = getOriginalName(req.get('X-Image-Filename'))
    await putImage(key, req.body, detectedType)
    const publicUrl = `/api/v1/media/${key}`

    let asset: Awaited<ReturnType<typeof repo.insertMediaAsset>>
    try {
      asset = await repo.insertMediaAsset({
        storage_key: key,
        public_url: publicUrl,
        original_name: originalName,
        content_type: detectedType,
        byte_size: req.body.length,
      })
    } catch (error) {
      try {
        await deleteImage(key)
      } catch (cleanupError) {
        const errorName = cleanupError instanceof Error ? cleanupError.name : 'UnknownError'
        console.error('Unable to clean up unregistered R2 upload:', errorName)
      }
      throw error
    }

    single(res, {
      id: asset.id,
      url: asset.public_url,
      name: asset.original_name,
      content_type: asset.content_type,
      byte_size: asset.byte_size,
      created_at: asset.created_at,
    }, 201)
  } catch (error) {
    next(error)
  }
}

function sendImage(res: Response, asset: repo.MediaAsset, bytes: Buffer) {
  res
    .status(200)
    .set({
      'Content-Type': asset.content_type,
      'Content-Length': String(bytes.length),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    .send(bytes)
}

export async function getPublicImage(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.params.key
    if (typeof key !== 'string' || !/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(key)) {
      return next(new AppError(404, 'Image not found'))
    }
    const asset = await repo.findMediaAssetByKey(key)
    if (!asset || !(await repo.isPublicMediaAsset(asset.id))) {
      return next(new AppError(404, 'Image not found'))
    }
    sendImage(res, asset, await getImage(asset.storage_key))
  } catch (error) {
    next(error)
  }
}

export async function getAdminImagePreview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id
    if (typeof id !== 'string' || !/^\d+$/.test(id)) {
      return next(new AppError(404, 'Image not found'))
    }
    const asset = await repo.findMediaAssetById(Number(id))
    if (!asset) return next(new AppError(404, 'Image not found'))
    sendImage(res, asset, await getImage(asset.storage_key))
  } catch (error) {
    next(error)
  }
}
