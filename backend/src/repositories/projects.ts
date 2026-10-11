import { pool } from '../config/db'
import type { PoolClient } from 'pg'

export interface ProjectGalleryImage {
  asset_id: number
  url: string
  alt_text: string
  caption: string
}

export interface ProjectGalleryImageInput {
  asset_id: number
  alt_text: string
  caption: string
}

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
  gallery_images: ProjectGalleryImage[]
  featured: boolean
  status: string
  created_at: string
  updated_at: string
}

type ProjectWrite = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'gallery_images'> & {
  gallery_images?: ProjectGalleryImageInput[]
}

const projectSelect = `
  SELECT p.*,
         COALESCE(cover.public_url, p.image_url) AS image_url,
         COALESCE(p.image_alt_text, '') AS image_alt_text,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'asset_id', asset.id,
             'url', asset.public_url,
             'alt_text', gallery.alt_text,
             'caption', gallery.caption
           ) ORDER BY gallery.position)
           FROM project_gallery_images gallery
           JOIN media_assets asset ON asset.id = gallery.asset_id
           WHERE gallery.project_id = p.id
         ), '[]'::jsonb) AS gallery_images
  FROM projects p
  LEFT JOIN media_assets cover ON cover.id = p.image_asset_id
`

async function replaceGallery(
  client: PoolClient,
  projectId: number,
  images: ProjectGalleryImageInput[]
) {
  await client.query('DELETE FROM project_gallery_images WHERE project_id = $1', [projectId])
  for (const [position, image] of images.entries()) {
    await client.query(
      `INSERT INTO project_gallery_images (project_id, asset_id, position, alt_text, caption)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, image.asset_id, position, image.alt_text, image.caption]
    )
  }
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
      `${projectSelect} WHERE ${where} ORDER BY p.featured DESC, p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
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
    `${projectSelect} WHERE p.slug = $1 AND p.status = $2`,
    [slug, 'published']
  )
  return rows[0] ?? null
}

export async function findProjectById(id: number): Promise<Project | null> {
  const { rows } = await pool.query<Project>(`${projectSelect} WHERE p.id = $1`, [id])
  return rows[0] ?? null
}

export async function findAllProjects(page: number, limit: number): Promise<{ rows: Project[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<Project>(`${projectSelect} ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM projects'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function insertProject(data: ProjectWrite): Promise<Project> {
  const client = await pool.connect()
  let projectId: number
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO projects (
         title, slug, summary, description, technologies, category,
         repository_url, live_demo_url, image_url, image_asset_id, image_alt_text, featured, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [
        data.title, data.slug, data.summary, data.description, data.technologies, data.category,
        data.repository_url || null, data.live_demo_url || null, data.image_url || null,
        data.image_asset_id ?? null, data.image_alt_text ?? '', data.featured, data.status,
      ]
    )
    projectId = rows[0].id
    await replaceGallery(client, projectId, data.gallery_images ?? [])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  const project = await findProjectById(projectId)
  if (!project) throw new Error('Project was created but could not be reloaded')
  return project
}

export async function updateProject(
  id: number,
  data: Partial<ProjectWrite>
): Promise<Project | null> {
  const { gallery_images: galleryImages, ...projectData } = data
  const fields = Object.keys(projectData) as (keyof typeof projectData)[]
  if (fields.length === 0 && galleryImages === undefined) return findProjectById(id)

  const client = await pool.connect()
  let found = false
  try {
    await client.query('BEGIN')
    if (fields.length > 0) {
      const sets = fields.map((field, index) => `${field} = $${index + 2}`)
      const values = fields.map(field => {
        const value = projectData[field]
        return (field === 'repository_url' || field === 'live_demo_url' || field === 'image_url') && value === ''
          ? null
          : value
      })
      const result = await client.query(
        `UPDATE projects SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1`,
        [id, ...values]
      )
      found = (result.rowCount ?? 0) > 0
    } else {
      const result = await client.query('SELECT 1 FROM projects WHERE id = $1', [id])
      found = result.rows.length > 0
    }

    if (!found) {
      await client.query('ROLLBACK')
      return null
    }
    if (galleryImages !== undefined) await replaceGallery(client, id, galleryImages)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  return findProjectById(id)
}

export async function deleteProject(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
