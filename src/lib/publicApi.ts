// Public API client — only fetches publicly permitted data

import { API_BASE, resolveMediaUrls } from './apiConfig'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new ApiError(res.status, json.error ?? `HTTP ${res.status}`)
  }
  return resolveMediaUrls(await res.json()) as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = resolveMediaUrls(await res.json()) as {
    success?: boolean
    error?: string
  }
  if (!json.success) throw new ApiError(res.status, json.error ?? 'Request failed')
  return json as T
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface SingleResponse<T> {
  success: true
  data: T
}

export interface PublicSiteImages {
  profile_image_url: string | null
  profile_image_alt: string
  og_image_url: string | null
  og_image_alt: string
}

export interface PublicSiteSettings {
  display_name: string | null
  tagline: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  email: string | null
  updated_at: string
}

export interface PublicImage {
  asset_id: number
  url: string
  alt_text: string
  caption: string
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ApiProject {
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
  gallery_images: PublicImage[]
  featured: boolean
  status: string
  created_at: string
  updated_at: string
}

export const publicApi = {
  siteImages: {
    get: () => get<SingleResponse<PublicSiteImages>>('/site-images'),
  },
  siteSettings: {
    get: () => get<SingleResponse<PublicSiteSettings>>('/site-settings'),
  },
  projects: {
    list: (params?: { page?: number; limit?: number; category?: string; featured?: boolean }) => {
      const q = new URLSearchParams()
      if (params?.page) q.set('page', String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      if (params?.category) q.set('category', params.category)
      if (params?.featured !== undefined) q.set('featured', String(params.featured))
      return get<PaginatedResponse<ApiProject>>(`/projects?${q}`)
    },
    get: (slug: string) => get<SingleResponse<ApiProject>>(`/projects/${slug}`),
  },

  blog: {
    list: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
      const q = new URLSearchParams()
      if (params?.page) q.set('page', String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      if (params?.category) q.set('category', params.category)
      if (params?.search) q.set('search', params.search)
      return get<PaginatedResponse<ApiBlogPost>>(`/blog?${q}`)
    },
    get: (slug: string) => get<SingleResponse<ApiBlogPost>>(`/blog/${slug}`),
  },

  journey: {
    list: () => get<PaginatedResponse<ApiJourneyEvent>>('/journey?limit=50'),
  },

  journal: {
    list: (params?: { page?: number; limit?: number }) => {
      const q = new URLSearchParams()
      if (params?.page) q.set('page', String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      return get<PaginatedResponse<ApiDailyLog>>(`/journal?${q}`)
    },
  },

  timeline: {
    list: (params: { from: string; to: string; timeZone: string }) => {
      const q = new URLSearchParams({ from: params.from, to: params.to, timeZone: params.timeZone })
      return get<TimelineResponse>(`/timeline?${q}`)
    },
  },

  contact: {
    submit: (data: {
      name: string
      email: string
      project_type: string
      budget_range: string
      message: string
    }) => post<SingleResponse<{ id: number; message: string }>>('/contact', data),
  },
}

export interface ApiBlogPost {
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
  article_images: PublicImage[]
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  reading_time_minutes?: number
  is_demo?: boolean
}

export interface ApiJourneyEvent {
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

export interface ApiDailyLog {
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

export interface ApiTimelineItem {
  id: string
  content_type: 'blog' | 'journal' | 'journey' | 'project'
  date: string
  title: string
  summary: string
  href: string
  item_label: 'created' | 'updated' | null
  minutes_worked: number | null
  is_demo?: boolean
}

export interface TimelineResponse {
  success: true
  data: ApiTimelineItem[]
  time_zone: string
}
