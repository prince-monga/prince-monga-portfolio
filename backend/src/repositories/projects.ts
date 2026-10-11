import { pool } from '../config/db'

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

export async function findPublishedProjects(opts: {
  page: number
  limit: number
  category?: string
  featured?: boolean
}): Promise<{ rows: Project[]; total: number }> {
  const { page, limit, category, featured } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['published']
  const conditions = ['status = $1']

  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }
  if (featured !== undefined) {
    params.push(featured)
    conditions.push(`featured = $${params.length}`)
  }

  const where = conditions.join(' AND ')

  const [dataRes, countRes] = await Promise.all([
    pool.query<Project>(
      `SELECT * FROM projects WHERE ${where} ORDER BY featured DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM projects WHERE ${where}`,
      params
    ),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findPublishedProjectBySlug(slug: string): Promise<Project | null> {
  const { rows } = await pool.query<Project>(
    'SELECT * FROM projects WHERE slug = $1 AND status = $2',
    [slug, 'published']
  )
  return rows[0] ?? null
}

export async function findProjectById(id: number): Promise<Project | null> {
  const { rows } = await pool.query<Project>('SELECT * FROM projects WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function findAllProjects(page: number, limit: number): Promise<{ rows: Project[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<Project>('SELECT * FROM projects ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM projects'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function insertProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const { rows } = await pool.query<Project>(
    `INSERT INTO projects (title, slug, summary, description, technologies, category, repository_url, live_demo_url, image_url, featured, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [data.title, data.slug, data.summary, data.description, data.technologies, data.category,
     data.repository_url || null, data.live_demo_url || null, data.image_url || null, data.featured, data.status]
  )
  return rows[0]
}

export async function updateProject(id: number, data: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findProjectById(id)

  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const values = fields.map(f => {
    const v = data[f]
    return (f === 'repository_url' || f === 'live_demo_url' || f === 'image_url') && v === '' ? null : v
  })

  const { rows } = await pool.query<Project>(
    `UPDATE projects SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  )
  return rows[0] ?? null
}

export async function deleteProject(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
