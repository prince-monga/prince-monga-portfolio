import { pool } from '../config/db'

export interface MediaAsset {
  id: number
  storage_key: string
  public_url: string
  original_name: string
  content_type: string
  byte_size: number
  created_at: string
}

export type NewMediaAsset = Omit<MediaAsset, 'id' | 'created_at'>

export async function insertMediaAsset(asset: NewMediaAsset): Promise<MediaAsset> {
  const { rows } = await pool.query<MediaAsset>(
    `INSERT INTO media_assets (storage_key, public_url, original_name, content_type, byte_size)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [asset.storage_key, asset.public_url, asset.original_name, asset.content_type, asset.byte_size]
  )
  return rows[0]
}

export async function findMediaAssetByKey(key: string): Promise<MediaAsset | null> {
  const { rows } = await pool.query<MediaAsset>(
    'SELECT * FROM media_assets WHERE storage_key = $1',
    [key]
  )
  return rows[0] ?? null
}

export async function findMediaAssetById(id: number): Promise<MediaAsset | null> {
  const { rows } = await pool.query<MediaAsset>(
    'SELECT * FROM media_assets WHERE id = $1',
    [id]
  )
  return rows[0] ?? null
}

export async function isPublicMediaAsset(id: number): Promise<boolean> {
  const { rows } = await pool.query<{ is_public: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM site_settings
       WHERE profile_image_asset_id = $1 OR og_image_asset_id = $1
       UNION ALL
       SELECT 1 FROM projects project
       WHERE project.status = 'published' AND project.image_asset_id = $1
       UNION ALL
       SELECT 1 FROM project_gallery_images gallery
       JOIN projects project ON project.id = gallery.project_id
       WHERE project.status = 'published' AND gallery.asset_id = $1
       UNION ALL
       SELECT 1 FROM blog_posts post
       WHERE post.status = 'published' AND post.cover_image_asset_id = $1
       UNION ALL
       SELECT 1 FROM blog_article_images gallery
       JOIN blog_posts post ON post.id = gallery.post_id
       WHERE post.status = 'published' AND gallery.asset_id = $1
       UNION ALL
       SELECT 1 FROM journey_events
       WHERE visibility = 'public' AND image_asset_id = $1
       UNION ALL
       SELECT 1 FROM daily_logs
       WHERE visibility = 'public' AND image_asset_id = $1
     ) AS is_public`,
    [id]
  )
  return rows[0]?.is_public ?? false
}
