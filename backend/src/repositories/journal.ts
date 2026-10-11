import { pool } from '../config/db'

export interface DailyLog {
  id: number
  activity_date: string
  summary: string
  work_completed: string
  lessons_learned: string
  challenges: string
  next_steps: string
  minutes_worked: number | null
  visibility: string
  image_asset_id: number | null
  image_url: string | null
  image_alt_text: string
  image_caption: string
  created_at: string
  updated_at: string
}

type DailyLogInput = Omit<DailyLog, 'id' | 'created_at' | 'updated_at' | 'image_url'
  | 'image_asset_id' | 'image_alt_text' | 'image_caption'>
  & Partial<Pick<DailyLog, 'image_asset_id' | 'image_alt_text' | 'image_caption'>>

const journalSelect = `SELECT log.*, media.public_url AS image_url
  FROM daily_logs log
  LEFT JOIN media_assets media ON media.id = log.image_asset_id`

export async function findPublicDailyLogs(opts: {
  page: number
  limit: number
  month?: string
}): Promise<{ rows: DailyLog[]; total: number }> {
  const { page, limit, month } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['public']
  const conditions = ['log.visibility = $1']

  if (month) {
    params.push(`${month}%`)
    conditions.push(`log.activity_date::text LIKE $${params.length}`)
  }

  const where = conditions.join(' AND ')
  const [dataRes, countRes] = await Promise.all([
    pool.query<DailyLog>(
      `${journalSelect} WHERE ${where} ORDER BY log.activity_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM daily_logs log WHERE ${where}`, params),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findAllDailyLogs(page: number, limit: number): Promise<{ rows: DailyLog[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<DailyLog>(`${journalSelect} ORDER BY log.activity_date DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM daily_logs'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findDailyLogById(id: number): Promise<DailyLog | null> {
  const { rows } = await pool.query<DailyLog>(`${journalSelect} WHERE log.id = $1`, [id])
  return rows[0] ?? null
}

export async function insertDailyLog(data: DailyLogInput): Promise<DailyLog> {
  const { rows } = await pool.query<DailyLog>(
    `WITH inserted AS (
       INSERT INTO daily_logs (activity_date, summary, work_completed, lessons_learned, challenges, next_steps, minutes_worked, visibility, image_asset_id, image_alt_text, image_caption)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
     )
     SELECT inserted.*, media.public_url AS image_url
     FROM inserted LEFT JOIN media_assets media ON media.id = inserted.image_asset_id`,
    [data.activity_date, data.summary, data.work_completed, data.lessons_learned,
     data.challenges, data.next_steps, data.minutes_worked ?? null, data.visibility,
     data.image_asset_id ?? null, data.image_alt_text ?? '', data.image_caption ?? '']
  )
  return rows[0]
}

export async function updateDailyLog(id: number, data: Partial<DailyLogInput>): Promise<DailyLog | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findDailyLogById(id)
  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const { rows } = await pool.query<DailyLog>(
    `UPDATE daily_logs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map(f => data[f] ?? null)]
  )
  return rows[0] ? findDailyLogById(rows[0].id) : null
}

export async function deleteDailyLog(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM daily_logs WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
