import { pool } from '../config/db'

export interface JourneyEvent {
  id: number
  title: string
  description: string
  event_date: string
  category: string
  visibility: string
  image_asset_id: number | null
  image_url: string | null
  image_alt_text: string
  image_caption: string
  created_at: string
  updated_at: string
}

type JourneyEventInput = Omit<JourneyEvent, 'id' | 'created_at' | 'updated_at' | 'image_url'
  | 'image_asset_id' | 'image_alt_text' | 'image_caption'>
  & Partial<Pick<JourneyEvent, 'image_asset_id' | 'image_alt_text' | 'image_caption'>>

const journeySelect = `SELECT event.*, media.public_url AS image_url
  FROM journey_events event
  LEFT JOIN media_assets media ON media.id = event.image_asset_id`

export async function findPublicJourneyEvents(opts: {
  page: number
  limit: number
  category?: string
}): Promise<{ rows: JourneyEvent[]; total: number }> {
  const { page, limit, category } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['public']
  const conditions = ['event.visibility = $1']

  if (category) {
    params.push(category)
    conditions.push(`event.category = $${params.length}`)
  }

  const where = conditions.join(' AND ')
  const [dataRes, countRes] = await Promise.all([
    pool.query<JourneyEvent>(
      `${journeySelect} WHERE ${where} ORDER BY event.event_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM journey_events event WHERE ${where}`, params),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findAllJourneyEvents(page: number, limit: number): Promise<{ rows: JourneyEvent[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<JourneyEvent>(`${journeySelect} ORDER BY event.event_date DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM journey_events'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findJourneyEventById(id: number): Promise<JourneyEvent | null> {
  const { rows } = await pool.query<JourneyEvent>(`${journeySelect} WHERE event.id = $1`, [id])
  return rows[0] ?? null
}

export async function insertJourneyEvent(data: JourneyEventInput): Promise<JourneyEvent> {
  const { rows } = await pool.query<JourneyEvent>(
    `WITH inserted AS (
       INSERT INTO journey_events (title, description, event_date, category, visibility, image_asset_id, image_alt_text, image_caption)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
     )
     SELECT inserted.*, media.public_url AS image_url
     FROM inserted LEFT JOIN media_assets media ON media.id = inserted.image_asset_id`,
    [data.title, data.description, data.event_date, data.category, data.visibility,
      data.image_asset_id ?? null, data.image_alt_text ?? '', data.image_caption ?? '']
  )
  return rows[0]
}

export async function updateJourneyEvent(id: number, data: Partial<JourneyEventInput>): Promise<JourneyEvent | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findJourneyEventById(id)
  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const { rows } = await pool.query<JourneyEvent>(
    `UPDATE journey_events SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map(f => data[f])]
  )
  return rows[0] ? findJourneyEventById(rows[0].id) : null
}

export async function deleteJourneyEvent(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM journey_events WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
