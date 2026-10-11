import { useState } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { projects as api, type ManagedImage, type Project } from '../api'
import { useFetch } from '../hooks/useFetch'
import ImageManager from '../components/ImageManager'
import {
  PageHeader, Button, StatusBadge, LoadingState, ErrorState, EmptyState,
  ConfirmDialog, Modal, Field, Input, Textarea, Select, Alert, Pagination,
} from '../components/ui'

const CATEGORIES = ['Frontend', 'Backend', 'Full Stack', 'Experiment']
const STATUSES = ['draft', 'published', 'archived']

const empty: Partial<Project> = {
  title: '', slug: '', summary: '', description: '', technologies: [],
  category: 'Full Stack', repository_url: '', live_demo_url: '', image_url: '',
  image_asset_id: null, image_alt_text: '', gallery_images: [],
  featured: false, status: 'draft',
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function ProjectsManager() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useFetch(() => api.list(page), [page])

  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [techInput, setTechInput] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)

  function openNew() {
    setEditing({ ...empty })
    setIsNew(true)
    setFormError(null)
    setTechInput('')
  }

  function openEdit(p: Project) {
    setEditing({ ...p })
    setIsNew(false)
    setFormError(null)
    setTechInput('')
  }

  function closeModal() {
    setEditing(null)
    setFormError(null)
  }

  function handleTitleChange(title: string) {
    setEditing(e => ({
      ...e!,
      title,
      ...(isNew ? { slug: slugify(title) } : {}),
    }))
  }

  function addTech() {
    const t = techInput.trim()
    if (!t) return
    setEditing(e => ({ ...e!, technologies: [...(e!.technologies ?? []), t] }))
    setTechInput('')
  }

  function removeTech(i: number) {
    setEditing(e => ({ ...e!, technologies: e!.technologies!.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    if (!editing || coverUploading || galleryUploading || saving) return
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
        title="Projects"
        description="Manage your portfolio projects"
        action={<Button onClick={openNew}><Plus size={14} />New project</Button>}
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          message="No projects yet."
          action={<Button size="sm" onClick={openNew}><Plus size={14} />Add your first project</Button>}
        />
      )}

      {rows.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden md:table-cell">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map(p => (
                <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-200">{p.title}</div>
                    <div className="text-xs text-neutral-500 font-mono">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-neutral-400 hidden md:table-cell">
                    {p.featured ? '★ Yes' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {p.status === 'published' && (
                        <a
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                          aria-label="View live"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
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

      {/* Edit / Create modal */}
      {editing && (
        <Modal title={isNew ? 'New project' : 'Edit project'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            <Field label="Title" required>
              <Input
                value={editing.title ?? ''}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="My Awesome Project"
              />
            </Field>

            <Field label="Slug" required hint="URL-safe identifier, auto-generated from title">
              <Input
                value={editing.slug ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, slug: e.target.value }))}
                placeholder="my-awesome-project"
                className="font-mono"
              />
            </Field>

            <Field label="Summary" required hint="Short description (max 500 chars)">
              <Textarea
                value={editing.summary ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, summary: e.target.value }))}
                rows={2}
                maxLength={500}
              />
            </Field>

            <Field label="Description" required>
              <Textarea
                value={editing.description ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))}
                rows={5}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <Select
                  value={editing.category ?? 'Full Stack'}
                  onChange={e => setEditing(ed => ({ ...ed!, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Status" required>
                <Select
                  value={editing.status ?? 'draft'}
                  onChange={e => setEditing(ed => ({ ...ed!, status: e.target.value }))}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Technologies">
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  placeholder="e.g. React"
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={addTech} type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(editing.technologies ?? []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-300">
                    {t}
                    <button onClick={() => removeTech(i)} className="text-neutral-500 hover:text-red-400" aria-label={`Remove ${t}`}>×</button>
                  </span>
                ))}
              </div>
            </Field>

            <Field label="Repository URL">
              <Input
                type="url"
                value={editing.repository_url ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, repository_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </Field>

            <Field label="Live demo URL">
              <Input
                type="url"
                value={editing.live_demo_url ?? ''}
                onChange={e => setEditing(ed => ({ ...ed!, live_demo_url: e.target.value }))}
                placeholder="https://..."
              />
            </Field>

            <ImageManager
              label="Project cover image"
              images={editing.image_url
                ? [{
                    asset_id: editing.image_asset_id ?? 0,
                    url: editing.image_url,
                    alt_text: editing.image_alt_text ?? '',
                    caption: '',
                  }]
                : []}
              onChange={(images: ManagedImage[]) => {
                const image = images[0]
                setEditing(ed => ({
                  ...ed!,
                  image_url: image?.url ?? '',
                  image_asset_id: image?.asset_id ? image.asset_id : null,
                  image_alt_text: image?.alt_text ?? '',
                }))
              }}
              onUploadingChange={setCoverUploading}
            />

            <ImageManager
              label="Additional project screenshots"
              images={editing.gallery_images ?? []}
              onChange={images => setEditing(ed => ({ ...ed!, gallery_images: images }))}
              onUploadingChange={setGalleryUploading}
              multiple
              maxImages={12}
            />

            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.featured ?? false}
                onChange={e => setEditing(ed => ({ ...ed!, featured: e.target.checked }))}
                className="rounded border-neutral-600 bg-neutral-800 text-blue-600 focus:ring-blue-500"
              />
              Featured project
            </label>

            <div className="flex gap-3 justify-end pt-2 border-t border-neutral-800">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} loading={saving} disabled={coverUploading || galleryUploading}>
                {isNew ? 'Create project' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
