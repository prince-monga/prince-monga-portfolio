import { useState, useEffect, type FormEvent } from 'react'
import { PageHeader, Field, Input, Button, Alert } from '../components/ui'
import ImageManager from '../components/ImageManager'
import {
  siteImages as siteImagesApi,
  siteSettings as siteSettingsApi,
  stats,
  type AdminSiteImages,
  type AdminSiteSettings,
} from '../api'
import { useFetch } from '../hooks/useFetch'
import { useSiteSettings } from '../../context/SiteSettings'
import { siteConfig } from '../../data/content'

interface SiteSettings {
  displayName: string
  tagline: string
  githubUrl: string
  linkedinUrl: string
  twitterUrl: string
  email: string
}

function toForm(settings: AdminSiteSettings): SiteSettings {
  return {
    displayName: settings.display_name ?? siteConfig.name,
    tagline: settings.tagline ?? siteConfig.tagline,
    githubUrl: settings.github_url ?? siteConfig.github,
    linkedinUrl: settings.linkedin_url ?? siteConfig.linkedin,
    twitterUrl: settings.twitter_url ?? siteConfig.twitter,
    email: settings.email ?? siteConfig.email,
  }
}

function validateUrl(url: string): boolean {
  if (!url) return true
  try {
    const protocol = new URL(url).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export default function SettingsPage() {
  const [form, setForm] = useState<SiteSettings>({
    displayName: siteConfig.name,
    tagline: siteConfig.tagline,
    githubUrl: siteConfig.github,
    linkedinUrl: siteConfig.linkedin,
    twitterUrl: siteConfig.twitter,
    email: siteConfig.email,
  })
  const [saved, setSaved] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState('')
  const [errors, setErrors] = useState<Partial<SiteSettings>>({})
  const [images, setImages] = useState<AdminSiteImages | null>(null)
  const [imagesLoading, setImagesLoading] = useState(true)
  const [imagesError, setImagesError] = useState('')
  const [imageSettingsRetry, setImageSettingsRetry] = useState(0)
  const [imagesSaved, setImagesSaved] = useState(false)
  const [savingImages, setSavingImages] = useState(false)
  const [profileUploading, setProfileUploading] = useState(false)
  const [ogUploading, setOgUploading] = useState(false)
  const { applyApiSettings } = useSiteSettings()

  // Show backend info
  const { data: statsData } = useFetch(() => stats.get())
  const s = statsData?.data

  useEffect(() => {
    let current = true
    siteSettingsApi.get()
      .then(response => { if (current) setForm(toForm(response.data)) })
      .catch(error => {
        if (current) setSettingsError(error instanceof Error ? error.message : 'Could not load site settings')
      })
      .finally(() => { if (current) setSettingsLoading(false) })
    return () => { current = false }
  }, [])

  useEffect(() => {
    let current = true
    setImagesLoading(true)
    siteImagesApi.get()
      .then(response => { if (current) setImages(response.data) })
      .catch(error => {
        if (current) setImagesError(error instanceof Error ? error.message : 'Could not load site images')
      })
      .finally(() => { if (current) setImagesLoading(false) })
    return () => { current = false }
  }, [imageSettingsRetry])

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate() || savingSettings) return
    setSavingSettings(true)
    setSettingsError('')
    setSaved(false)
    try {
      const response = await siteSettingsApi.update({
        display_name: form.displayName,
        tagline: form.tagline,
        github_url: form.githubUrl,
        linkedin_url: form.linkedinUrl,
        twitter_url: form.twitterUrl,
        email: form.email,
      })
      setForm(toForm(response.data))
      applyApiSettings(response.data)
      setSaved(true)
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Could not save site settings')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSaveImages(e: FormEvent) {
    e.preventDefault()
    if (!images || savingImages || profileUploading || ogUploading) return
    setSavingImages(true)
    setImagesError('')
    setImagesSaved(false)
    try {
      const response = await siteImagesApi.update({
        profile_image: images.profile_image
          ? { asset_id: images.profile_image.asset_id, alt_text: images.profile_image.alt_text }
          : null,
        og_image: images.og_image
          ? { asset_id: images.og_image.asset_id, alt_text: images.og_image.alt_text }
          : null,
      })
      setImages(response.data)
      setImagesSaved(true)
    } catch (error) {
      setImagesError(error instanceof Error ? error.message : 'Could not save site images')
    } finally {
      setSavingImages(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Public profile and social links" />

      {saved && <Alert type="success" message="Settings saved." />}
      {settingsError && <Alert type="error" message={settingsError} />}
      {imagesSaved && <Alert type="success" message="Site images saved." />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          {settingsLoading && (
            <p role="status" className="text-sm text-neutral-500">Loading profile settings…</p>
          )}
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
            <Button type="submit" loading={savingSettings} disabled={settingsLoading}>
              Save settings
            </Button>
          </div>
        </form>

        <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
          <h2 className="text-sm font-medium text-neutral-300 mb-2">Site images</h2>
          <p className="mb-4 text-xs text-neutral-500">
            Manage the optional profile photo used on Home and About, and the default social preview image.
          </p>
          {imagesError && <Alert type="error" message={imagesError} />}
          {imagesLoading ? (
            <p className="text-sm text-neutral-500">Loading site image settings…</p>
          ) : images ? (
            <form onSubmit={handleSaveImages} className="space-y-5">
              <ImageManager
                label="Profile photo"
                images={images.profile_image ? [images.profile_image] : []}
                onChange={next => setImages(current => current && ({
                  ...current,
                  profile_image: next[0] ?? null,
                }))}
                onUploadingChange={setProfileUploading}
              />
              <ImageManager
                label="Default social preview image"
                images={images.og_image ? [images.og_image] : []}
                onChange={next => setImages(current => current && ({
                  ...current,
                  og_image: next[0] ?? null,
                }))}
                onUploadingChange={setOgUploading}
              />
              <div className="flex justify-end border-t border-neutral-800 pt-4">
                <Button
                  type="submit"
                  loading={savingImages}
                  disabled={profileUploading || ogUploading}
                >
                  Save site images
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="secondary" onClick={() => setImageSettingsRetry(value => value + 1)}>
              Retry loading images
            </Button>
          )}
        </section>
        </div>

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
              Profile settings are stored in the database and shared with the public site.
              Never store secrets or credentials here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
