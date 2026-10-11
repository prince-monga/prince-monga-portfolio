import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { journey as api, type JourneyEvent } from '../api'
import ImageManager, { type ManagedImage } from '../components/ImageManager'
import { useFetch } from '../hooks/useFetch'
import {
  PageHeader, Button, StatusBadge, LoadingState, ErrorState, EmptyState,
  ConfirmDialog, Modal, Field, Input, Textarea, Select, Alert,
} from '../components/ui'

const CATEGORIES = ['education', 'experience', 'learning', 'milestone']

const empty: Partial<JourneyEvent> = {
  title: '', description: '', event_date: '', category: 'learning', visibility: 'public',
}

export default function JourneyManager() {
  const { data, loading, error, refetch } = useFetch(() => api.list(1, 50))

  const [editing, setEditing] = useState<Partial<JourneyEvent> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<JourneyEvent | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openNew() {
    setEditing({ ...empty })
    setIsNew(true)
    setFormError(null)
  }

  function openEdit(e: JourneyEvent) {
    setEditing({ ...e })
    setIsNew(false)
    setFormError(null)
  }

  function closeModal() {
    setEditing(null)
    setFormError(null)
  }

  async function handleSave() {
    if (!editing) return
    setFormError(null)
    setSaving(true)
    try {
      if (isNew) {
        await api.create(editing)
      } else {
        await api.update(editing.id!, editing)
      }
      closeModal()
      refetch()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
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

  return (
    <div>
      <PageHeader
        title="Journey"
        description="Timeline events shown on the public journey page"
        action={<Button onClick={openNew}><Plus size={14} />New event</Button>}
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          message="No journey events yet."
          action={<Button size="sm" onClick={openNew}><Plus size={14} />Add first event</Button>}
        />
      )}

      {rows.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Visibility</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map(ev => (
                <tr key={ev.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-200">{ev.title}</td>
                  <td className="px-4 py-3 text-neutral-400 hidden sm:table-cell">{ev.event_date}</td>
                  <td className="px-4 py-3 text-neutral-400 hidden sm:table-cell capitalize">{ev.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={ev.visibility} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ev)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={isNew ? 'New journey event' : 'Edit event'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            <Field label="Title" required>
              <Input
                value={editing.title ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, title: e.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" required>
                <Input
                  type="date"
                  value={editing.event_date ?? ''}
                  onChange={e => setEditing(ed => ({ ...ed!, event_date: e.target.value }))}
                />
              </Field>
              <Field label="Category" required>
                <Select
                  value={editing.category ?? 'learning'}
                  onChange={e => setEditing(ed => ({ ...ed!, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Description" required>
              <Textarea
                value={editing.description ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))}
                rows={4}
              />
            </Field>

            <Field label="Visibility">
              <Select
                value={editing.visibility ?? 'public'}
                onChange={e => setEditing(ed => ({ ...ed!, visibility: e.target.value }))}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Select>
            </Field>

            <ImageManager
              label="Milestone image (optional)"
              images={editing.image_asset_id && editing.image_url ? [{
                asset_id: editing.image_asset_id,
                url: editing.image_url,
                alt_text: editing.image_alt_text ?? '',
                caption: editing.image_caption ?? '',
              }] : []}
              onChange={(images: ManagedImage[]) => setEditing(event => ({
                ...event!,
                image_asset_id: images[0]?.asset_id ?? null,
                image_alt_text: images[0]?.alt_text ?? '',
                image_caption: images[0]?.caption ?? '',
                image_url: undefined,
              }))}
              multiple={false}
            />

            <div className="flex gap-3 justify-end pt-2 border-t border-neutral-800">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>
                {isNew ? 'Create event' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete event"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
