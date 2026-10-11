// Typed API client for admin dashboard — all requests go to /api/v1

import { API_BASE, resolveMediaUrls } from '../lib/apiConfig'

function getToken(): string | null {
  return sessionStorage.getItem('admin_token')
}

export function setToken(token: string): void {
  sessionStorage.setItem('admin_token', token)
}

export function clearToken(): void {
  sessionStorage.removeItem('admin_token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const json = resolveMediaUrls(await res.json()) as {
    success?: boolean
    error?: string
    details?: { path: string; message: string }[]
  }
  if (!json.success) {
    const msg = json.error ?? json.details?.[0]?.message ?? 'Request failed'
    throw new ApiError(res.status, msg, json.details)
  }
  return json as T
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: { path: string; message: string }[]
  ) {
    super(message)
  }
}

export interface UploadedImage {
  id: number
  url: string
  name: string
  content_type: string
  byte_size: number
  created_at: string
}

export interface ManagedImage {
  asset_id: number
  url: string
  alt_text: string
  caption: string
}

export interface AdminSiteImages {
  profile_image: ManagedImage | null
  og_image: ManagedImage | null
  updated_at: string
}

export interface AdminSiteSettings {
  display_name: string | null
  tagline: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  email: string | null
  updated_at: string
}

export const siteImages = {
  get: () => request<Single<AdminSiteImages>>('GET', '/admin/site-images'),
  update: (data: {
    profile_image?: { asset_id: number; alt_text: string } | null
    og_image?: { asset_id: number; alt_text: string } | null
  }) => request<Single<AdminSiteImages>>('PATCH', '/admin/site-images', data),
}

export const siteSettings = {
  get: () => request<Single<AdminSiteSettings>>('GET', '/admin/site-settings'),
  update: (data: Partial<Omit<AdminSiteSettings, 'updated_at'>>) =>
    request<Single<AdminSiteSettings>>('PATCH', '/admin/site-settings', data),
}

async function getImagePreview(assetId: number, signal?: AbortSignal): Promise<string> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${API_BASE}/admin/media/${assetId}/preview`, { headers, signal })
  if (!response.ok) {
    let message = 'Could not load image preview'
    try {
      const body = await response.json() as { error?: string }
      message = body.error ?? message
    } catch {
      // Non-JSON server errors retain the generic, actionable message.
    }
    throw new ApiError(response.status, message)
  }
  return URL.createObjectURL(await response.blob())
}

function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/admin/media/upload`)
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('X-Image-Filename', encodeURIComponent(file.name))
    xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    })
    xhr.addEventListener('error', () => reject(new ApiError(0, 'Image upload failed. Check your connection and try again.')))
    xhr.addEventListener('abort', () => reject(new ApiError(0, 'Image upload was canceled.')))
    xhr.addEventListener('timeout', () => reject(new ApiError(0, 'Image upload timed out. Try again.')))
    xhr.timeout = 30_000
    xhr.addEventListener('load', () => {
      let response: { success?: boolean; data?: UploadedImage; error?: string }
      try {
        response = JSON.parse(xhr.responseText) as typeof response
      } catch {
        reject(new ApiError(xhr.status, 'The server returned an invalid image upload response'))
        return
      }
      if (xhr.status < 200 || xhr.status >= 300 || !response.success || !response.data) {
        reject(new ApiError(xhr.status, response.error ?? 'Image upload failed'))
        return
      }
      resolve(response.data)
    })
    xhr.send(file)
  })
}

export const media = {
  upload: uploadImage,
  preview: getImagePreview,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await request<{ success: true; data: { token: string; email: string } }>(
    'POST', '/admin/login', { email, password }
  )
  return res.data
}

// ─── Pagination wrapper ───────────────────────────────────────────────────────

export interface Paginated<T> {
  success: true
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface Single<T> {
  success: true
  data: T
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  technologies: string[]
  category: string
  repository_url: string | null
  live_demo_url: string | null
  image_url: string | null
  image_asset_id: number | null
  image_alt_text: string
  gallery_images: ManagedImage[]
  featured: boolean
  status: string
  created_at: string
  updated_at: string
}

export const projects = {
  list: (page = 1, limit = 20) =>
    request<Paginated<Project>>('GET', `/admin/projects?page=${page}&limit=${limit}`),
  create: (data: Partial<Project>) =>
    request<Single<Project>>('POST', '/admin/projects', data),
  update: (id: number, data: Partial<Project>) =>
    request<Single<Project>>('PATCH', `/admin/projects/${id}`, data),
  delete: (id: number) =>
    request<void>('DELETE', `/admin/projects/${id}`),
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  seo_title: string | null
  meta_description: string | null
  cover_image_url: string | null
  cover_image_asset_id: number | null
  cover_image_alt: string
  article_images: ManagedImage[]
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export const blog = {
  list: (page = 1, limit = 20) =>
    request<Paginated<BlogPost>>('GET', `/admin/blog?page=${page}&limit=${limit}`),
  get: (id: number) =>
    request<Single<BlogPost>>('GET', `/admin/blog/${id}`),
  create: (data: Partial<BlogPost>) =>
    request<Single<BlogPost>>('POST', '/admin/blog', data),
  update: (id: number, data: Partial<BlogPost>) =>
    request<Single<BlogPost>>('PATCH', `/admin/blog/${id}`, data),
  delete: (id: number) =>
    request<void>('DELETE', `/admin/blog/${id}`),
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export interface JourneyEvent {
  id: number
  title: string
  description: string
  event_date: string
  category: string
  visibility: string
  image_asset_id: number | null
  image_url: string | null
  image_alt_text: string
  image_caption: string
  created_at: string
  updated_at: string
}

export const journey = {
  list: (page = 1, limit = 50) =>
    request<Paginated<JourneyEvent>>('GET', `/admin/journey?page=${page}&limit=${limit}`),
  create: (data: Partial<JourneyEvent>) =>
    request<Single<JourneyEvent>>('POST', '/admin/journey', data),
  update: (id: number, data: Partial<JourneyEvent>) =>
    request<Single<JourneyEvent>>('PATCH', `/admin/journey/${id}`, data),
  delete: (id: number) =>
    request<void>('DELETE', `/admin/journey/${id}`),
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface DailyLog {
  id: number
  activity_date: string
  summary: string
  work_completed: string
  lessons_learned: string
  challenges: string
  next_steps: string
  minutes_worked: number | null
  visibility: string
  image_asset_id: number | null
  image_url: string | null
  image_alt_text: string
  image_caption: string
  created_at: string
  updated_at: string
}

export const journal = {
  list: (page = 1, limit = 20) =>
    request<Paginated<DailyLog>>('GET', `/admin/journal?page=${page}&limit=${limit}`),
  create: (data: Partial<DailyLog>) =>
    request<Single<DailyLog>>('POST', '/admin/journal', data),
  update: (id: number, data: Partial<DailyLog>) =>
    request<Single<DailyLog>>('PATCH', `/admin/journal/${id}`, data),
  delete: (id: number) =>
    request<void>('DELETE', `/admin/journal/${id}`),
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface Inquiry {
  id: number
  name: string
  email: string
  project_type: string
  budget_range: string
  message: string
  status: string
  created_at: string
}

export const contact = {
  list: (page = 1, limit = 20) =>
    request<Paginated<Inquiry>>('GET', `/admin/contact?page=${page}&limit=${limit}`),
  updateStatus: (id: number, status: string) =>
    request<Single<Inquiry>>('PATCH', `/admin/contact/${id}/status`, { status }),
  delete: (id: number) =>
    request<void>('DELETE', `/admin/contact/${id}`),
}

// ─── Stats (dashboard overview) ───────────────────────────────────────────────

export interface DashboardStats {
  projects: { total: number; published: number; draft: number }
  blog: { total: number; published: number; draft: number }
  inquiries: { total: number; unread: number }
  journal: { total: number; streak: number; longestStreak: number }
}

export const stats = {
  get: () => request<Single<DashboardStats>>('GET', '/admin/stats'),
}
