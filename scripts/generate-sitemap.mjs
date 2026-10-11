/**
 * generate-sitemap.mjs
 * Run: SITE_URL=https://yourdomain.com node scripts/generate-sitemap.mjs
 * Or add to package.json scripts: "sitemap": "node scripts/generate-sitemap.mjs"
 *
 * Only includes indexable, non-placeholder routes.
 * /journal and /streak are excluded (personal/thin content).
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '')

if (!SITE_URL) {
  console.warn('[sitemap] SITE_URL not set. Set via env: SITE_URL=https://yourdomain.com node scripts/generate-sitemap.mjs')
}

const base = SITE_URL || ''

// Static indexable routes — excludes /journal, /streak, 404
const staticRoutes = [
  { path: '/',         changefreq: 'weekly',  priority: '1.0' },
  { path: '/about',    changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'weekly',  priority: '0.9' },
  { path: '/blog',     changefreq: 'weekly',  priority: '0.9' },
  { path: '/journey',  changefreq: 'monthly', priority: '0.7' },
  { path: '/services', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',  changefreq: 'yearly',  priority: '0.6' },
]

// Parse published blog slugs and complete project slugs from content.ts source
const contentSrc = readFileSync(join(root, 'src/data/content.ts'), 'utf-8')

const publishedBlogSlugs = []
for (const m of contentSrc.matchAll(/slug:\s*'([^']+)'[\s\S]*?status:\s*'published'/g)) {
  publishedBlogSlugs.push(m[1])
}

const projectSlugs = []
for (const m of contentSrc.matchAll(/slug:\s*'([^']+)'[\s\S]*?status:\s*'(complete|in-progress)'/g)) {
  projectSlugs.push(m[1])
}

const dynamicRoutes = [
  ...publishedBlogSlugs.map(slug => ({ path: `/blog/${slug}`,     changefreq: 'monthly', priority: '0.8' })),
  ...projectSlugs.map(slug =>        ({ path: `/projects/${slug}`, changefreq: 'monthly', priority: '0.8' })),
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
writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf-8')
console.log(`[sitemap] Written to public/sitemap.xml — ${allRoutes.length} URLs`)

try {
  mkdirSync(join(root, 'dist'), { recursive: true })
  writeFileSync(join(root, 'dist/sitemap.xml'), xml, 'utf-8')
  console.log('[sitemap] Also written to dist/sitemap.xml')
} catch {
  // dist may not exist before first build — that's fine
}
