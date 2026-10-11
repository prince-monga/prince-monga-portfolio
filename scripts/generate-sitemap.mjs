/**
 * generate-sitemap.mjs
 * Set SITE_URL to the real HTTPS site origin before running this script.
 * Or add to package.json scripts: "sitemap": "node scripts/generate-sitemap.mjs"
 *
 * Only includes indexable, non-placeholder routes.
 * /journal and /streak are excluded (personal/thin content).
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '')
const API_ORIGIN = (process.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

if (!SITE_URL) {
  throw new Error('[sitemap] Set SITE_URL to the actual HTTPS site origin before generating SEO files.')
}
if (!API_ORIGIN) {
  throw new Error('[sitemap] Set VITE_API_BASE_URL to the public API origin to include published content.')
}

function validateOrigin(value, name) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`[sitemap] ${name} must be an absolute HTTPS origin.`)
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.origin !== value ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(`[sitemap] ${name} must be an HTTPS origin without credentials or a path.`)
  }
  return parsed.origin
}

const base = validateOrigin(SITE_URL, 'SITE_URL')
validateOrigin(API_ORIGIN, 'VITE_API_BASE_URL')

function isSlugPage(value) {
  if (!value || typeof value !== 'object') return false
  const record = value
  return (
    record.success === true &&
    Array.isArray(record.data) &&
    record.data.every(item =>
      item &&
      typeof item === 'object' &&
      typeof item.slug === 'string' &&
      /^[a-z0-9-]+$/.test(item.slug)
    ) &&
    record.pagination &&
    typeof record.pagination === 'object' &&
    Number.isInteger(record.pagination.totalPages) &&
    record.pagination.totalPages >= 0
  )
}

async function fetchPublishedSlugs(resource) {
  const slugs = new Set()
  let page = 1

  while (true) {
    const response = await fetch(
      `${API_ORIGIN}/api/v1/${resource}?page=${page}&limit=50`,
      { signal: AbortSignal.timeout(30_000) }
    )
    if (!response.ok) {
      throw new Error(`[sitemap] The public ${resource} API returned HTTP ${response.status}.`)
    }

    const payload = await response.json()
    if (!isSlugPage(payload)) {
      throw new Error(`[sitemap] The public ${resource} API returned an invalid response.`)
    }

    for (const item of payload.data) slugs.add(item.slug)
    if (page >= payload.pagination.totalPages) break
    page += 1
  }

  return [...slugs]
}

const [publishedBlogSlugs, publishedProjectSlugs] = await Promise.all([
  fetchPublishedSlugs('blog'),
  fetchPublishedSlugs('projects'),
])

const staticRoutes = [
  { path: '/',         changefreq: 'weekly',  priority: '1.0' },
  { path: '/about',    changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'weekly',  priority: '0.9' },
  { path: '/blog',     changefreq: 'weekly',  priority: '0.9' },
  { path: '/journey',  changefreq: 'monthly', priority: '0.7' },
  { path: '/services', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',  changefreq: 'yearly',  priority: '0.6' },
]

const dynamicRoutes = [
  ...publishedBlogSlugs.map(slug => ({ path: `/blog/${slug}`, changefreq: 'monthly', priority: '0.8' })),
  ...publishedProjectSlugs.map(slug => ({ path: `/projects/${slug}`, changefreq: 'monthly', priority: '0.8' })),
]

const allRoutes = [...staticRoutes, ...dynamicRoutes]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${base}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf-8')
console.log(`[sitemap] Written to public/sitemap.xml — ${allRoutes.length} URLs`)

const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /journal
Disallow: /streak

Sitemap: ${base}/sitemap.xml
`
writeFileSync(join(root, 'public', 'robots.txt'), robots, 'utf-8')

const dist = join(root, 'dist')
mkdirSync(dist, { recursive: true })
writeFileSync(join(dist, 'sitemap.xml'), xml, 'utf-8')
writeFileSync(join(dist, 'robots.txt'), robots, 'utf-8')
console.log('[sitemap] Also written to dist/sitemap.xml')
