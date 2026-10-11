import { pool } from '../config/db'
import type { PoolClient } from 'pg'

export interface BlogArticleImage {
  asset_id: number
  url: string
  alt_text: string
  caption: string
}

export interface BlogArticleImageInput {
  asset_id: number
  alt_text: string
  caption: string
}

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
  article_images: BlogArticleImage[]
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  reading_time_minutes?: number
}

type BlogPostWrite = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'article_images'> & {
  article_images?: BlogArticleImageInput[]
}

const imageColumns = `
  COALESCE(cover.public_url, p.cover_image_url) AS cover_image_url,
  p.cover_image_asset_id,
  COALESCE(p.cover_image_alt, '') AS cover_image_alt,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'asset_id', asset.id,
      'url', asset.public_url,
      'alt_text', gallery.alt_text,
      'caption', gallery.caption
    ) ORDER BY gallery.position)
    FROM blog_article_images gallery
    JOIN media_assets asset ON asset.id = gallery.asset_id
    WHERE gallery.post_id = p.id
  ), '[]'::jsonb) AS article_images
`

async function replaceArticleImages(
  client: PoolClient,
  postId: number,
  images: BlogArticleImageInput[]
) {
  await client.query('DELETE FROM blog_article_images WHERE post_id = $1', [postId])
  for (const [position, image] of images.entries()) {
    await client.query(
      `INSERT INTO blog_article_images (post_id, asset_id, position, alt_text, caption)
       VALUES ($1, $2, $3, $4, $5)`,
      [postId, image.asset_id, position, image.alt_text, image.caption]
    )
  }
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
  const conditions = ['p.status = $1']

  if (category) {
    params.push(category)
    conditions.push(`p.category = $${params.length}`)
  }
  if (tag) {
    params.push(tag)
    conditions.push(`$${params.length} = ANY(p.tags)`)
  }
  if (search) {
    params.push(`%${search}%`)
    const n = params.length
    conditions.push(`(p.title ILIKE $${n} OR p.excerpt ILIKE $${n})`)
  }

  const where = conditions.join(' AND ')
  // Exclude content from list view for performance
  const cols = `p.id, p.title, p.slug, p.excerpt, p.category, p.tags,
    p.seo_title, p.meta_description, ${imageColumns}, p.status, p.published_at,
    p.created_at, p.updated_at,
    GREATEST(1, CEIL(cardinality(regexp_split_to_array(btrim(p.content), '[[:space:]]+')) / 200.0))::int AS reading_time_minutes`

  const [dataRes, countRes] = await Promise.all([
    pool.query<BlogPost>(
      `SELECT ${cols} FROM blog_posts p
       LEFT JOIN media_assets cover ON cover.id = p.cover_image_asset_id
       WHERE ${where} ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM blog_posts p WHERE ${where}`,
      params
    ),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const { rows } = await pool.query<BlogPost>(
    `SELECT p.*, ${imageColumns}
     FROM blog_posts p
     LEFT JOIN media_assets cover ON cover.id = p.cover_image_asset_id
     WHERE p.slug = $1 AND p.status = $2`,
    [slug, 'published']
  )
  return rows[0] ?? null
}

export async function findPostById(id: number): Promise<BlogPost | null> {
  const { rows } = await pool.query<BlogPost>(
    `SELECT p.*, ${imageColumns}
     FROM blog_posts p
     LEFT JOIN media_assets cover ON cover.id = p.cover_image_asset_id
     WHERE p.id = $1`,
    [id]
  )
  return rows[0] ?? null
}

export async function findAllPosts(page: number, limit: number): Promise<{ rows: BlogPost[]; total: number }> {
  const offset = (page - 1) * limit
  const cols = `p.id, p.title, p.slug, p.excerpt, p.category, p.tags,
    p.seo_title, p.meta_description, ${imageColumns}, p.status, p.published_at,
    p.created_at, p.updated_at`
  const [dataRes, countRes] = await Promise.all([
    pool.query<BlogPost>(
      `SELECT ${cols} FROM blog_posts p
       LEFT JOIN media_assets cover ON cover.id = p.cover_image_asset_id
       ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM blog_posts'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function insertPost(data: BlogPostWrite): Promise<BlogPost> {
  const client = await pool.connect()
  let postId: number
  try {
    await client.query('BEGIN')
    const publishedAt = data.status === 'published' ? 'NOW()' : 'NULL'
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO blog_posts (
         title, slug, excerpt, content, category, tags, seo_title, meta_description,
         cover_image_url, cover_image_asset_id, cover_image_alt, status, published_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,${publishedAt}) RETURNING id`,
      [
        data.title, data.slug, data.excerpt, data.content, data.category, data.tags,
        data.seo_title || null, data.meta_description || null, data.cover_image_url || null,
        data.cover_image_asset_id ?? null, data.cover_image_alt ?? '', data.status,
      ]
    )
    postId = rows[0].id
    await replaceArticleImages(client, postId, data.article_images ?? [])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  const post = await findPostById(postId)
  if (!post) throw new Error('Article was created but could not be reloaded')
  return post
}

export async function updatePost(id: number, data: Partial<BlogPostWrite> & { status?: string }): Promise<BlogPost | null> {
  const { article_images: articleImages, ...postData } = data
  const fields = Object.keys(postData) as (keyof typeof postData)[]
  if (fields.length === 0 && articleImages === undefined) return findPostById(id)

  const client = await pool.connect()
  let found = false
  try {
    await client.query('BEGIN')
    if (fields.length > 0) {
      const sets = fields.map((field, index) => `${field} = $${index + 2}`)
      if (postData.status === 'published') {
        sets.push('published_at = COALESCE(published_at, NOW())')
      }
      const values = fields.map(field => {
        const value = postData[field]
        return (field === 'cover_image_url' || field === 'seo_title' || field === 'meta_description') && value === ''
          ? null
          : value
      })
      const result = await client.query(
        `UPDATE blog_posts SET ${[...sets, 'updated_at = NOW()'].join(', ')} WHERE id = $1`,
        [id, ...values]
      )
      found = (result.rowCount ?? 0) > 0
    } else {
      const result = await client.query('SELECT 1 FROM blog_posts WHERE id = $1', [id])
      found = result.rows.length > 0
    }

    if (!found) {
      await client.query('ROLLBACK')
      return null
    }
    if (articleImages !== undefined) await replaceArticleImages(client, id, articleImages)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  return findPostById(id)
}

export async function deletePost(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM blog_posts WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
