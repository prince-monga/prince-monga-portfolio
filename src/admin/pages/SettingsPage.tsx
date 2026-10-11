import { useState, useEffect, type FormEvent } from 'react'
import { PageHeader, Field, Input, Button, Alert } from '../components/ui'
import { stats } from '../api'
import { useFetch } from '../hooks/useFetch'

// Settings are stored in localStorage as a simple profile config.
// A full DB-backed settings table can be added in a future migration.
// This page intentionally excludes secrets and infrastructure credentials.

interface SiteSettings {
  displayName: string
  tagline: string
  githubUrl: string
  linkedinUrl: string
  twitterUrl: string
  email: string
}

const STORAGE_KEY = 'admin_site_settings'

function loadSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SiteSettings
  } catch { /* ignore */ }
  return { displayName: '', tagline: '', githubUrl: '', linkedinUrl: '', twitterUrl: '', email: '' }
}

function validateUrl(url: string): boolean {
  if (!url) return true
  try { new URL(url); return true } catch { return false }
}

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings>(loadSettings)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Partial<SiteSettings>>({})

  // Show backend info
  const { data: statsData } = useFetch(() => stats.get())
  const s = statsData?.data

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3000)
      return () => clearTimeout(t)
    }
  }, [saved])

  function validate(): boolean {
    const errs: Partial<SiteSettings> = {}
    if (!form.displayName.trim()) errs.displayName = 'Required'
    if (form.githubUrl && !validateUrl(form.githubUrl)) errs.githubUrl = 'Invalid URL'
    if (form.linkedinUrl && !validateUrl(form.linkedinUrl)) errs.linkedinUrl = 'Invalid URL'
    if (form.twitterUrl && !validateUrl(form.twitterUrl)) errs.twitterUrl = 'Invalid URL'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(true)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Public profile and social links" />

      {saved && <Alert type="success" message="Settings saved." />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <Field label="Display name" required error={errors.displayName}>
            <Input
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              placeholder="Prince Monga"
            />
          </Field>

          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              placeholder="Full-stack developer building in public"
            />
          </Field>

          <Field label="Contact email" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="hello@example.com"
            />
          </Field>

          <Field label="GitHub URL" error={errors.githubUrl}>
            <Input
              type="url"
              value={form.githubUrl}
              onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
              placeholder="https://github.com/..."
            />
          </Field>

          <Field label="LinkedIn URL" error={errors.linkedinUrl}>
            <Input
              type="url"
              value={form.linkedinUrl}
              onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>

          <Field label="Twitter / X URL" error={errors.twitterUrl}>
            <Input
              type="url"
              value={form.twitterUrl}
              onChange={e => setForm(f => ({ ...f, twitterUrl: e.target.value }))}
              placeholder="https://x.com/..."
            />
          </Field>

          <div className="pt-2">
            <Button type="submit">Save settings</Button>
          </div>
        </form>

        {/* Site stats sidebar */}
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-neutral-300 mb-3">Site overview</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Projects', s?.projects.total ?? '—'],
                ['Published projects', s?.projects.published ?? '—'],
                ['Blog posts', s?.blog.total ?? '—'],
                ['Published posts', s?.blog.published ?? '—'],
                ['Inquiries', s?.inquiries.total ?? '—'],
                ['Journal entries', s?.journal.total ?? '—'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-neutral-500">{label}</dt>
                  <dd className="text-neutral-300 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-neutral-300 mb-2">Note</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Settings are saved locally in this browser. A database-backed settings table can be added in a future migration for multi-device sync.
              Never store secrets or credentials here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
