// Typed API client for admin dashboard — all requests go to /api/v1

const BASE = '/api/v1'

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

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const json = await res.json()
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
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export const blog = {
  list: (page = 1, limit = 20) =>
    request<Paginated<BlogPost>>('GET', `/admin/blog?page=${page}&limit=${limit}`),
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
