import { useEffect, useId, useRef, useState } from 'react'
import { Image as ImageIcon, Loader2, MoveDown, MoveUp, Trash2, Upload } from 'lucide-react'
import { media, type ManagedImage, type UploadedImage } from '../api'

export type { ManagedImage } from '../api'

interface PendingUpload {
  id: string
  file: File
  previewUrl: string
  progress: number
  error?: string
}

interface ImageManagerProps {
  label: string
  images: ManagedImage[]
  onChange: (images: ManagedImage[]) => void
  onUploadingChange?: (uploading: boolean) => void
  multiple?: boolean
  maxImages?: number
}

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp,image/gif'

function toManagedImage(image: UploadedImage): ManagedImage {
  return { asset_id: image.id, url: image.url, alt_text: '', caption: '' }
}

export default function ImageManager({
  label,
  images,
  onChange,
  onUploadingChange,
  multiple = false,
  maxImages = 12,
}: ImageManagerProps) {
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const pendingRef = useRef<PendingUpload[]>([])
  const inputId = useId()

  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [onUploadingChange, uploading])

  useEffect(() => {
    const currentIds = new Set(pending.map(item => item.id))
    pendingRef.current.forEach(item => {
      if (!currentIds.has(item.id)) URL.revokeObjectURL(item.previewUrl)
    })
    pendingRef.current = pending
  }, [pending])

  useEffect(() => () => {
    pendingRef.current.forEach(item => URL.revokeObjectURL(item.previewUrl))
  }, [])

  async function uploadFiles(items: PendingUpload[], selectionError = '') {
    setUploading(true)
    setError(selectionError)
    const uploaded: ManagedImage[] = []
    const failed: PendingUpload[] = []

    for (const item of items) {
      try {
        const image = await media.upload(item.file, progress => {
          setPending(current => current.map(candidate =>
            candidate.id === item.id ? { ...candidate, progress } : candidate
          ))
        })
        uploaded.push(toManagedImage(image))
      } catch (uploadError) {
        failed.push({
          ...item,
          error: uploadError instanceof Error ? uploadError.message : 'Image upload failed',
        })
      }
    }

    if (uploaded.length > 0) {
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(-1))
    }
    setPending(failed)
    setUploading(false)
  }

  function handleFileSelection(files: FileList | null) {
    if (!files?.length || uploading) return
    const remaining = multiple ? maxImages - images.length : 1
    const selected = Array.from(files)
    const accepted: File[] = []
    const errors: string[] = []

    for (const file of selected) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        errors.push(`${file.name}: choose a JPEG, PNG, WebP, or GIF image.`)
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: image must be 8 MB or smaller.`)
      } else if (accepted.length < remaining) {
        accepted.push(file)
      }
    }
    if (selected.length > accepted.length + errors.length) {
      errors.push(`You can select up to ${Math.max(0, remaining)} more image${remaining === 1 ? '' : 's'}.`)
    }
    setError(errors.join(' '))

    if (accepted.length > 0) {
      const items = accepted.map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
      }))
      setPending(items)
      void uploadFiles(items, errors.join(' '))
    }
  }

  function retryFailedUploads() {
    if (!uploading && pending.length > 0) {
      void uploadFiles(pending.map(item => ({ ...item, progress: 0, error: undefined })))
    }
  }

  function moveImage(index: number, offset: -1 | 1) {
    const destination = index + offset
    if (destination < 0 || destination >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    onChange(reordered)
  }

  return (
    <section aria-label={label} className="space-y-3">
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-300">
          {label}
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          {multiple ? 'JPEG, PNG, WebP, or GIF · up to 8 MB each' : 'One image · JPEG, PNG, WebP, or GIF · up to 8 MB'}
        </p>
      </div>

      <label
        htmlFor={inputId}
        className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition-colors hover:border-neutral-500 focus-within:outline focus-within:outline-2 focus-within:outline-blue-500 ${
          uploading ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
        {uploading ? 'Uploading image…' : multiple ? 'Choose images' : 'Choose image'}
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple={multiple}
        disabled={uploading || (multiple && images.length >= maxImages)}
        onChange={event => {
          handleFileSelection(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
        className="sr-only"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">{error}</p>
      )}

      {pending.map(item => (
        <div key={item.id} className="flex items-center gap-3 rounded-md border border-neutral-800 p-3">
          <img
            src={item.previewUrl}
            alt=""
            className="h-14 w-20 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-neutral-300">{item.file.name}</p>
            {item.error ? (
              <p role="alert" className="mt-1 text-xs text-red-400">{item.error}</p>
            ) : (
              <progress
                aria-label={`Uploading ${item.file.name}`}
                value={item.progress}
                max={100}
                className="mt-2 h-1.5 w-full accent-blue-500"
              />
            )}
          </div>
          {item.error && (
            <button
              type="button"
              onClick={retryFailedUploads}
              disabled={uploading}
              className="min-h-10 rounded px-2 text-xs text-blue-400 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50"
            >
              Retry
            </button>
          )}
          {item.error && (
            <button
              type="button"
              aria-label={`Remove failed upload ${item.file.name}`}
              onClick={() => setPending(current => current.filter(candidate => candidate.id !== item.id))}
              className="flex min-h-10 min-w-10 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      ))}

      {images.length > 0 && (
        <ol className="space-y-3">
          {images.map((image, index) => (
            <li key={`${image.asset_id}-${index}`} className="rounded-md border border-neutral-800 p-3">
              <div className="flex flex-wrap gap-3">
                <ImagePreview image={image} />
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-xs text-neutral-400">
                    Alt text
                    <input
                      value={image.alt_text}
                      onChange={event => onChange(images.map((item, i) =>
                        i === index ? { ...item, alt_text: event.target.value } : item
                      ))}
                      maxLength={300}
                      className="mt-1 min-h-10 w-full rounded border border-neutral-700 bg-neutral-950 px-3 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  {multiple && (
                    <label className="block text-xs text-neutral-400">
                      Caption
                      <input
                        value={image.caption}
                        onChange={event => onChange(images.map((item, i) =>
                          i === index ? { ...item, caption: event.target.value } : item
                        ))}
                        maxLength={500}
                        className="mt-1 min-h-10 w-full rounded border border-neutral-700 bg-neutral-950 px-3 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                  )}
                </div>
                <div className="flex items-start gap-1">
                  {multiple && (
                    <>
                      <button
                        type="button"
                        aria-label={`Move image ${index + 1} up`}
                        disabled={index === 0}
                        onClick={() => moveImage(index, -1)}
                        className="flex min-h-10 min-w-10 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40"
                      >
                        <MoveUp size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move image ${index + 1} down`}
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, 1)}
                        className="flex min-h-10 min-w-10 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40"
                      >
                        <MoveDown size={16} aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded text-neutral-400 hover:bg-neutral-800 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ImagePreview({ image }: { image: ManagedImage }) {
  const [previewError, setPreviewError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    setPreviewError('')
    if (image.asset_id <= 0) {
      setPreviewUrl(image.url)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null
    setPreviewUrl(null)
    media.preview(image.asset_id, controller.signal)
      .then(url => {
        objectUrl = url
        setPreviewUrl(url)
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setPreviewError(error instanceof Error ? error.message : 'Image preview unavailable')
        }
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [image.asset_id, image.url])

  if (previewError) {
    return (
      <div className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded bg-neutral-800 px-1 text-center text-neutral-500">
        <ImageIcon size={20} aria-hidden="true" />
        <span className="text-[10px]" title={previewError}>Preview unavailable</span>
      </div>
    )
  }

  if (!previewUrl) {
    return (
      <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded bg-neutral-800 text-neutral-500">
        <Loader2 size={18} className="animate-spin" aria-label="Loading image preview" />
      </div>
    )
  }

  return (
    <img
      src={previewUrl}
      alt={image.alt_text}
      loading="lazy"
      onError={() => setPreviewError('Image preview unavailable')}
      className="h-20 w-28 shrink-0 rounded bg-neutral-800 object-cover"
    />
  )
}
