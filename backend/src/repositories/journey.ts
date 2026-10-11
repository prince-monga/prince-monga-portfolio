import { pool } from '../config/db'

export interface JourneyEvent {
  id: number
  title: string
  description: string
  event_date: string
  category: string
  visibility: string
  created_at: string
  updated_at: string
}

export async function findPublicJourneyEvents(opts: {
  page: number
  limit: number
  category?: string
}): Promise<{ rows: JourneyEvent[]; total: number }> {
  const { page, limit, category } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['public']
  const conditions = ['visibility = $1']

  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }

  const where = conditions.join(' AND ')
  const [dataRes, countRes] = await Promise.all([
    pool.query<JourneyEvent>(
      `SELECT * FROM journey_events WHERE ${where} ORDER BY event_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM journey_events WHERE ${where}`, params),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findAllJourneyEvents(page: number, limit: number): Promise<{ rows: JourneyEvent[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<JourneyEvent>('SELECT * FROM journey_events ORDER BY event_date DESC LIMIT $1 OFFSET $2', [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM journey_events'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findJourneyEventById(id: number): Promise<JourneyEvent | null> {
  const { rows } = await pool.query<JourneyEvent>('SELECT * FROM journey_events WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function insertJourneyEvent(data: Omit<JourneyEvent, 'id' | 'created_at' | 'updated_at'>): Promise<JourneyEvent> {
  const { rows } = await pool.query<JourneyEvent>(
    'INSERT INTO journey_events (title, description, event_date, category, visibility) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [data.title, data.description, data.event_date, data.category, data.visibility]
  )
  return rows[0]
}

export async function updateJourneyEvent(id: number, data: Partial<Omit<JourneyEvent, 'id' | 'created_at' | 'updated_at'>>): Promise<JourneyEvent | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findJourneyEventById(id)
  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const { rows } = await pool.query<JourneyEvent>(
    `UPDATE journey_events SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map(f => data[f])]
  )
  return rows[0] ?? null
}

export async function deleteJourneyEvent(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM journey_events WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
