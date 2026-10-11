import { validateOrigin } from './validateOrigin'

const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const configuredSiteOrigin = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '')

if (configuredApiOrigin) {
  validateOrigin(configuredApiOrigin, 'VITE_API_BASE_URL', !import.meta.env.PROD)
}

if (configuredSiteOrigin) {
  validateOrigin(configuredSiteOrigin, 'VITE_SITE_URL', false)
}

export const API_BASE = configuredApiOrigin
  ? `${configuredApiOrigin}/api/v1`
  : '/api/v1'
export const SITE_URL = configuredSiteOrigin ?? ''

export function resolveMediaUrl(url: string): string {
  if (!url.startsWith('/api/v1/media/')) return url
  return `${API_BASE}${url.slice('/api/v1'.length)}`
}

export function resolveMediaUrls<T>(value: T): T {
  if (typeof value === 'string') return resolveMediaUrl(value) as T
  if (Array.isArray(value)) return value.map(resolveMediaUrls) as T
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, resolveMediaUrls(entry)])
    ) as T
  }
  return value
}
