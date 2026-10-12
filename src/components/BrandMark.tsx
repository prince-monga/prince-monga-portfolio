interface BrandMarkProps {
  admin?: boolean
  compact?: boolean
  className?: string
}

export default function BrandMark({
  admin = false,
  compact = false,
  className = '',
}: BrandMarkProps) {
  return (
    <span className={`brand-mark ${compact ? 'brand-mark-compact' : ''} ${className}`}>
      <svg
        className="brand-mark-icon"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="34" height="34" rx="10" className="brand-mark-tile" />
        <path
          d="M8.5 25V11h5.3c3.3 0 5 1.7 5 4.3s-1.7 4.3-5 4.3H8.5m12 5.4V11l5.1 6.2 5.1-6.2v14"
          className="brand-mark-stroke"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="29.5" cy="28.5" r="1.5" className="brand-mark-dot" />
      </svg>
      <span className="brand-mark-word">
        prince<span className="brand-mark-accent">.monga</span>
      </span>
      {admin && <span className="brand-mark-admin">admin</span>}
    </span>
  )
}
