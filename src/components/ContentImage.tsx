import { useEffect, useState, type ReactNode } from 'react'

interface ContentImageProps {
  src: string | null | undefined
  alt: string
  className: string
  fallback?: ReactNode
}

export default function ContentImage({ src, alt, className, fallback = null }: ContentImageProps) {
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => setUnavailable(false), [src])

  if (!src || unavailable) return fallback

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setUnavailable(true)}
      className={className}
    />
  )
}
