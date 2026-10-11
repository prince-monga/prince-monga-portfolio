import { useState } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { blog as api, type BlogPost } from '../api'
import { useFetch } from '../hooks/useFetch'
import {
  PageHeader, Button, StatusBadge, LoadingState, ErrorState, EmptyState,
  ConfirmDialog, Modal, Field, Input, Textarea, Select, Alert, Pagination,
} from '../components/ui'

const STATUSES = ['draft', 'published', 'archived']

const empty: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  tags: [], seo_title: '', meta_description: '', cover_image_url: '', status: 'draft',
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function readingTime(text: string) {
  return Math.max(1, Math.round(wordCount(text) / 200))
}

export default function BlogManager() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useFetch(() => api.list(page), [page])

  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tab, setTab] = useState<'write' | 'seo'>('write')

  function openNew() {
    setEditing({ ...empty })
    setIsNew(true)
    setFormError(null)
    setTagInput('')
    setTab('write')
  }

  function openEdit(p: BlogPost) {
    setEditing({ ...p })
    setIsNew(false)
    setFormError(null)
    setTagInput('')
    setTab('write')
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

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (!t) return
    setEditing(e => ({ ...e!, tags: [...(e!.tags ?? []), t] }))
    setTagInput('')
  }

  function removeTag(i: number) {
    setEditing(e => ({ ...e!, tags: e!.tags!.filter((_, idx) => idx !== i) }))
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
  const wc = editing?.content ? wordCount(editing.content) : 0
  const rt = editing?.content ? readingTime(editing.content) : 0

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Manage articles and technical writing"
        action={<Button onClick={openNew}><Plus size={14} />New post</Button>}
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          message="No posts yet."
          action={<Button size="sm" onClick={openNew}><Plus size={14} />Write your first post</Button>}
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
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden md:table-cell">Published</th>
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
                  <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {p.status === 'published' && (
                        <a
                          href={`/blog/${p.slug}`}
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

      {editing && (
        <Modal title={isNew ? 'New post' : 'Edit post'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-neutral-800 -mx-6 px-6 pb-0">
              {(['write', 'seo'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === t
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {t === 'write' ? 'Content' : 'SEO'}
                </button>
              ))}
            </div>

            {tab === 'write' && (
              <>
                <Field label="Title" required>
                  <Input
                    value={editing.title ?? ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Article title"
                  />
                </Field>

                <Field label="Slug" required>
                  <Input
                    value={editing.slug ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, slug: e.target.value }))}
                    className="font-mono"
                  />
                </Field>

                <Field label="Excerpt" required hint="Short summary shown in listings (max 500 chars)">
                  <Textarea
                    value={editing.excerpt ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, excerpt: e.target.value }))}
                    rows={2}
                    maxLength={500}
                  />
                </Field>

                <Field label="Content" required>
                  <Textarea
                    value={editing.content ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, content: e.target.value }))}
                    rows={12}
                    placeholder="Write in Markdown..."
                  />
                  {wc > 0 && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {wc} words · ~{rt} min read
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category" required>
                    <Input
                      value={editing.category ?? ''}
                      onChange={e => setEditing(ed => ({ ...ed!, category: e.target.value }))}
                      placeholder="e.g. TypeScript"
                    />
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

                <Field label="Tags">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="e.g. react"
                      className="flex-1"
                    />
                    <Button variant="secondary" size="sm" onClick={addTag} type="button">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(editing.tags ?? []).map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-300">
                        {t}
                        <button onClick={() => removeTag(i)} className="text-neutral-500 hover:text-red-400" aria-label={`Remove ${t}`}>×</button>
                      </span>
                    ))}
                  </div>
                </Field>

                <Field label="Cover image URL">
                  <Input
                    type="url"
                    value={editing.cover_image_url ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, cover_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </Field>
              </>
            )}

            {tab === 'seo' && (
              <>
                <Field label="SEO title" hint="Overrides the page title tag (max 70 chars)">
                  <Input
                    value={editing.seo_title ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, seo_title: e.target.value }))}
                    maxLength={70}
                    placeholder="Leave blank to use article title"
                  />
                </Field>

                <Field label="Meta description" hint="Shown in search results (max 160 chars)">
                  <Textarea
                    value={editing.meta_description ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed!, meta_description: e.target.value }))}
                    rows={3}
                    maxLength={160}
                  />
                </Field>
              </>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-neutral-800">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>
                {isNew ? 'Create post' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete post"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
