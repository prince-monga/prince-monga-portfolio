import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

// ─── Page header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7 border-b border-neutral-800/80 pb-5">
      <div>
        <h1 className="page-title text-2xl font-semibold text-neutral-100 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-400">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="admin-stat-card rounded-xl p-4 sm:p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  size?: 'sm' | 'md'
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800',
}

export function Button({
  variant = 'primary',
  loading,
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-[transform,box-shadow,background-color] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
        ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        ${variantClass[variant]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ─── Form field ───────────────────────────────────────────────────────────────

export function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-neutral-300">
        {label}
        {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputBase =
  'w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-y min-h-[80px] ${props.className ?? ''}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} ${props.className ?? ''}`}
    />
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  published: 'bg-green-900/50 text-green-400 border-green-800',
  draft: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  archived: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  new: 'bg-blue-900/50 text-blue-400 border-blue-800',
  read: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  replied: 'bg-green-900/50 text-green-400 border-green-800',
  public: 'bg-green-900/50 text-green-400 border-green-800',
  private: 'bg-neutral-800 text-neutral-400 border-neutral-700',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[status] ?? 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
      {status}
    </span>
  )
}

// ─── Loading / Error / Empty states ──────────────────────────────────────────

export function LoadingState() {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-1 gap-3 py-8 sm:grid-cols-2">
      {[0, 1, 2, 3].map(item => (
        <div key={item} className="admin-stat-card rounded-xl p-5">
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton mt-4 h-7 w-1/2 rounded" />
          <div className="skeleton mt-3 h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle size={24} className="text-red-400" />
      <p className="text-sm text-neutral-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
      {action}
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-sm w-full shadow-xl"
      >
        <h2 id="dialog-title" className="text-base font-semibold text-neutral-100 mb-2">{title}</h2>
        <p className="text-sm text-neutral-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>Delete</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-2xl my-8 shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

export function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div className={`rounded-md px-4 py-3 text-sm mb-4 ${
      type === 'success'
        ? 'bg-green-900/40 border border-green-800 text-green-300'
        : 'bg-red-900/40 border border-red-800 text-red-300'
    }`}>
      {message}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="text-xs text-neutral-500">
        {page} / {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  )
}
