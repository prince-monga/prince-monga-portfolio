import { useState } from 'react'
import { Mail, Trash2 } from 'lucide-react'
import { contact as api, type Inquiry } from '../api'
import { useFetch } from '../hooks/useFetch'
import {
  PageHeader, StatusBadge, LoadingState, ErrorState, EmptyState,
  ConfirmDialog, Button, Select, Pagination,
} from '../components/ui'

const STATUSES = ['new', 'read', 'replied', 'archived']

export default function InquiriesManager() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useFetch(() => api.list(page), [page])

  const [expanded, setExpanded] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)

  async function handleStatusChange(id: number, status: string) {
    setUpdating(id)
    try {
      await api.updateStatus(id, status)
      refetch()
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const rows = data?.data ?? []
  const pagination = data?.pagination
  const unread = rows.filter(r => r.status === 'new').length

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description={unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'Contact form submissions'}
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState message="No inquiries yet." />
      )}

      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map(inq => (
            <div
              key={inq.id}
              className={`bg-neutral-900 border rounded-lg overflow-hidden transition-colors ${
                inq.status === 'new' ? 'border-blue-800' : 'border-neutral-800'
              }`}
            >
              {/* Header row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800/40 transition-colors"
                onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                aria-expanded={expanded === inq.id}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-neutral-200">{inq.name}</span>
                    <span className="text-xs text-neutral-500">{inq.email}</span>
                    <StatusBadge status={inq.status} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{inq.message}</p>
                </div>
                <span className="text-xs text-neutral-600 flex-shrink-0">
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
              </button>

              {/* Expanded detail */}
              {expanded === inq.id && (
                <div className="px-4 pb-4 border-t border-neutral-800 pt-3 space-y-3">
                  {inq.project_type && (
                    <p className="text-xs text-neutral-500">
                      <span className="text-neutral-400">Project type:</span> {inq.project_type}
                    </p>
                  )}
                  {inq.budget_range && (
                    <p className="text-xs text-neutral-500">
                      <span className="text-neutral-400">Budget:</span> {inq.budget_range}
                    </p>
                  )}
                  <p className="text-sm text-neutral-300 whitespace-pre-wrap">{inq.message}</p>

                  <div className="flex items-center gap-3 flex-wrap pt-1">
                    <a
                      href={`mailto:${inq.email}?subject=Re: Your enquiry`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-md transition-colors"
                    >
                      <Mail size={12} />
                      Reply via email app
                    </a>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-neutral-500">Status:</label>
                      <Select
                        value={inq.status}
                        onChange={e => handleStatusChange(inq.id, e.target.value)}
                        disabled={updating === inq.id}
                        className="py-1 text-xs w-auto"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(inq)}
                      className="text-red-400 hover:text-red-300 ml-auto"
                    >
                      <Trash2 size={12} />
                      Delete
                    </Button>
                  </div>

                  <p className="text-xs text-neutral-600">
                    Note: "Reply via email app" opens your local email client. No email is sent directly from this dashboard.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={setPage} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete inquiry"
          message={`Delete the inquiry from ${deleteTarget.name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
