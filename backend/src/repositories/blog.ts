import { pool } from '../config/db'

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
  reading_time_minutes?: number
}

export async function findPublishedPosts(opts: {
  page: number
  limit: number
  category?: string
  tag?: string
  search?: string
}): Promise<{ rows: BlogPost[]; total: number }> {
  const { page, limit, category, tag, search } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['published']
  const conditions = ['status = $1']

  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }
  if (tag) {
    params.push(tag)
    conditions.push(`$${params.length} = ANY(tags)`)
  }
  if (search) {
    params.push(`%${search}%`)
    const n = params.length
    conditions.push(`(title ILIKE $${n} OR excerpt ILIKE $${n})`)
  }

  const where = conditions.join(' AND ')
  // Exclude content from list view for performance
  const cols = "id, title, slug, excerpt, category, tags, seo_title, meta_description, cover_image_url, status, published_at, created_at, updated_at, GREATEST(1, CEIL(cardinality(regexp_split_to_array(btrim(content), '[[:space:]]+')) / 200.0))::int AS reading_time_minutes"

  const [dataRes, countRes] = await Promise.all([
    pool.query<BlogPost>(
      `SELECT ${cols} FROM blog_posts WHERE ${where} ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM blog_posts WHERE ${where}`,
      params
    ),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const { rows } = await pool.query<BlogPost>(
    'SELECT * FROM blog_posts WHERE slug = $1 AND status = $2',
    [slug, 'published']
  )
  return rows[0] ?? null
}

export async function findPostById(id: number): Promise<BlogPost | null> {
  const { rows } = await pool.query<BlogPost>('SELECT * FROM blog_posts WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function findAllPosts(page: number, limit: number): Promise<{ rows: BlogPost[]; total: number }> {
  const offset = (page - 1) * limit
  const cols = 'id, title, slug, excerpt, category, tags, seo_title, meta_description, cover_image_url, status, published_at, created_at, updated_at'
  const [dataRes, countRes] = await Promise.all([
    pool.query<BlogPost>(`SELECT ${cols} FROM blog_posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM blog_posts'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function insertPost(data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>): Promise<BlogPost> {
  const publishedAt = data.status === 'published' ? 'NOW()' : 'NULL'
  const { rows } = await pool.query<BlogPost>(
    `INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, seo_title, meta_description, cover_image_url, status, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,${publishedAt}) RETURNING *`,
    [data.title, data.slug, data.excerpt, data.content, data.category, data.tags,
     data.seo_title || null, data.meta_description || null, data.cover_image_url || null, data.status]
  )
  return rows[0]
}

export async function updatePost(id: number, data: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<BlogPost | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findPostById(id)

  // Auto-set published_at when status changes to published
  const extraSets: string[] = []
  if (data.status === 'published') {
    extraSets.push('published_at = COALESCE(published_at, NOW())')
  }

  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const values = fields.map(f => {
    const v = data[f]
    return (f === 'cover_image_url' || f === 'seo_title' || f === 'meta_description') && v === '' ? null : v
  })

  const allSets = [...sets, ...extraSets, 'updated_at = NOW()'].join(', ')
  const { rows } = await pool.query<BlogPost>(
    `UPDATE blog_posts SET ${allSets} WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0] ?? null
}

export async function deletePost(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM blog_posts WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
