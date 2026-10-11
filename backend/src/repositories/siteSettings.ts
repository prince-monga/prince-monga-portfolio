import { pool } from '../config/db'

export interface SiteImageReference {
  asset_id: number
  url: string
  alt_text: string
  caption: string
}

export interface AdminSiteImages {
  profile_image: SiteImageReference | null
  og_image: SiteImageReference | null
  updated_at: string
}

export interface PublicSiteImages {
  profile_image_url: string | null
  profile_image_alt: string
  og_image_url: string | null
  og_image_alt: string
}

export interface SiteProfileSettings {
  display_name: string | null
  tagline: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  email: string | null
  updated_at: string
}

interface SiteImagesRow {
  profile_image_asset_id: number | null
  profile_image_url: string | null
  profile_image_alt: string
  og_image_asset_id: number | null
  og_image_url: string | null
  og_image_alt: string
  updated_at: string
}

const selectImages = `
  SELECT settings.profile_image_asset_id,
         profile.public_url AS profile_image_url,
         settings.profile_image_alt,
         settings.og_image_asset_id,
         social.public_url AS og_image_url,
         settings.og_image_alt,
         settings.updated_at
  FROM site_settings settings
  LEFT JOIN media_assets profile ON profile.id = settings.profile_image_asset_id
  LEFT JOIN media_assets social ON social.id = settings.og_image_asset_id
  WHERE settings.id = 1
`

async function findSiteImages(): Promise<SiteImagesRow> {
  const { rows } = await pool.query<SiteImagesRow>(selectImages)
  if (!rows[0]) throw new Error('Site image settings row is missing')
  return rows[0]
}

function toAdminImages(row: SiteImagesRow): AdminSiteImages {
  return {
    profile_image: row.profile_image_asset_id && row.profile_image_url
      ? {
          asset_id: row.profile_image_asset_id,
          url: row.profile_image_url,
          alt_text: row.profile_image_alt,
          caption: '',
        }
      : null,
    og_image: row.og_image_asset_id && row.og_image_url
      ? {
          asset_id: row.og_image_asset_id,
          url: row.og_image_url,
          alt_text: row.og_image_alt,
          caption: '',
        }
      : null,
    updated_at: row.updated_at,
  }
}

export async function getAdminSiteImages(): Promise<AdminSiteImages> {
  return toAdminImages(await findSiteImages())
}

export async function getPublicSiteImages(): Promise<PublicSiteImages> {
  const row = await findSiteImages()
  return {
    profile_image_url: row.profile_image_url,
    profile_image_alt: row.profile_image_alt,
    og_image_url: row.og_image_url,
    og_image_alt: row.og_image_alt,
  }
}

export async function updateSiteImages(data: {
  profile_image?: { asset_id: number; alt_text: string } | null
  og_image?: { asset_id: number; alt_text: string } | null
}): Promise<AdminSiteImages> {
  const assignments: string[] = []
  const values: unknown[] = []

  if (Object.prototype.hasOwnProperty.call(data, 'profile_image')) {
    const image = data.profile_image
    values.push(image?.asset_id ?? null, image?.alt_text ?? '')
    assignments.push(`profile_image_asset_id = $${values.length - 1}`, `profile_image_alt = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(data, 'og_image')) {
    const image = data.og_image
    values.push(image?.asset_id ?? null, image?.alt_text ?? '')
    assignments.push(`og_image_asset_id = $${values.length - 1}`, `og_image_alt = $${values.length}`)
  }

  if (assignments.length > 0) {
    await pool.query(
      `UPDATE site_settings SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = 1`,
      values
    )
  }
  return getAdminSiteImages()
}

export async function getSiteProfileSettings(): Promise<SiteProfileSettings> {
  const { rows } = await pool.query<SiteProfileSettings>(
    `SELECT display_name, tagline, github_url, linkedin_url, twitter_url, email, updated_at
     FROM site_settings WHERE id = 1`
  )
  if (!rows[0]) throw new Error('Site settings row is missing')
  return rows[0]
}

export async function updateSiteProfileSettings(
  data: Partial<Record<
    'display_name' | 'tagline' | 'github_url' | 'linkedin_url' | 'twitter_url' | 'email',
    string
  >>
): Promise<SiteProfileSettings> {
  const fields = [
    ['display_name', data.display_name],
    ['tagline', data.tagline],
    ['github_url', data.github_url],
    ['linkedin_url', data.linkedin_url],
    ['twitter_url', data.twitter_url],
    ['email', data.email],
  ] as const
  const assignments: string[] = []
  const values: string[] = []

  for (const [column, value] of fields) {
    if (value !== undefined) {
      values.push(value)
      assignments.push(`${column} = $${values.length}`)
    }
  }

  if (assignments.length > 0) {
    await pool.query(
      `UPDATE site_settings SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = 1`,
      values
    )
  }
  return getSiteProfileSettings()
}
