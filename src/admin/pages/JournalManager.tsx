import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { journal as api, type DailyLog } from '../api'
import ImageManager, { type ManagedImage } from '../components/ImageManager'
import { useFetch } from '../hooks/useFetch'
import {
  PageHeader, Button, StatusBadge, LoadingState, ErrorState, EmptyState,
  ConfirmDialog, Modal, Field, Input, Textarea, Select, Alert, Pagination,
} from '../components/ui'

const empty: Partial<DailyLog> = {
  activity_date: new Date().toISOString().slice(0, 10),
  summary: '', work_completed: '', lessons_learned: '',
  challenges: '', next_steps: '', minutes_worked: undefined, visibility: 'private',
}

export default function JournalManager() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useFetch(() => api.list(page), [page])

  const [editing, setEditing] = useState<Partial<DailyLog> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DailyLog | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function openNew() {
    setEditing({ ...empty })
    setIsNew(true)
    setFormError(null)
  }

  function openEdit(log: DailyLog) {
    setEditing({ ...log })
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
  const pagination = data?.pagination

  return (
    <div>
      <PageHeader
        title="Journal"
        description="Daily work logs — one entry per day"
        action={<Button onClick={openNew}><Plus size={14} />Log today</Button>}
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          message="No journal entries yet."
          action={<Button size="sm" onClick={openNew}><Plus size={14} />Log today's work</Button>}
        />
      )}

      {rows.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Summary</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Time</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Visibility</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map(log => (
                <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-neutral-300">{log.activity_date}</td>
                  <td className="px-4 py-3 text-neutral-300 max-w-xs truncate">{log.summary}</td>
                  <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                    {log.minutes_worked != null ? `${log.minutes_worked}m` : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={log.visibility} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(log)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(log)}
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

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPage={setPage} />
      )}

      {editing && (
        <Modal title={isNew ? 'New journal entry' : 'Edit entry'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" required>
                <Input
                  type="date"
                  value={editing.activity_date ?? ''}
                  onChange={e => setEditing(ed => ({ ...ed!, activity_date: e.target.value }))}
                  disabled={!isNew}
                />
              </Field>
              <Field label="Minutes worked">
                <Input
                  type="number"
                  min={0}
                  max={1440}
                  value={editing.minutes_worked ?? ''}
                  onChange={e => setEditing(ed => ({
                    ...ed!,
                    minutes_worked: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
                  placeholder="e.g. 120"
                />
              </Field>
            </div>

            <Field label="Summary" required hint="One-line overview of the day">
              <Input
                value={editing.summary ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, summary: e.target.value }))}
                maxLength={500}
              />
            </Field>

            <Field label="Work completed">
              <Textarea
                value={editing.work_completed ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, work_completed: e.target.value }))}
                rows={3}
                placeholder="What did you build or ship?"
              />
            </Field>

            <Field label="Lessons learned">
              <Textarea
                value={editing.lessons_learned ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, lessons_learned: e.target.value }))}
                rows={2}
              />
            </Field>

            <Field label="Challenges">
              <Textarea
                value={editing.challenges ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, challenges: e.target.value }))}
                rows={2}
              />
            </Field>

            <Field label="Next steps">
              <Textarea
                value={editing.next_steps ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, next_steps: e.target.value }))}
                rows={2}
              />
            </Field>

            <Field label="Visibility">
              <Select
                value={editing.visibility ?? 'private'}
                onChange={e => setEditing(ed => ({ ...ed!, visibility: e.target.value }))}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
            </Field>

            <ImageManager
              label="Entry image (optional)"
              images={editing.image_asset_id && editing.image_url ? [{
                asset_id: editing.image_asset_id,
                url: editing.image_url,
                alt_text: editing.image_alt_text ?? '',
                caption: editing.image_caption ?? '',
              }] : []}
              onChange={(images: ManagedImage[]) => setEditing(log => ({
                ...log!,
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
                {isNew ? 'Create entry' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete entry"
          message={`Delete the entry for ${deleteTarget.activity_date}? This will affect streak calculations.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
