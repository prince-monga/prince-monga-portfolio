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
  created_at: string
  updated_at: string
}

export async function findPublicDailyLogs(opts: {
  page: number
  limit: number
  month?: string
}): Promise<{ rows: DailyLog[]; total: number }> {
  const { page, limit, month } = opts
  const offset = (page - 1) * limit
  const params: unknown[] = ['public']
  const conditions = ['visibility = $1']

  if (month) {
    params.push(`${month}%`)
    conditions.push(`activity_date::text LIKE $${params.length}`)
  }

  const where = conditions.join(' AND ')
  const [dataRes, countRes] = await Promise.all([
    pool.query<DailyLog>(
      `SELECT * FROM daily_logs WHERE ${where} ORDER BY activity_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM daily_logs WHERE ${where}`, params),
  ])

  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findAllDailyLogs(page: number, limit: number): Promise<{ rows: DailyLog[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<DailyLog>('SELECT * FROM daily_logs ORDER BY activity_date DESC LIMIT $1 OFFSET $2', [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM daily_logs'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function findDailyLogById(id: number): Promise<DailyLog | null> {
  const { rows } = await pool.query<DailyLog>('SELECT * FROM daily_logs WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function insertDailyLog(data: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>): Promise<DailyLog> {
  const { rows } = await pool.query<DailyLog>(
    `INSERT INTO daily_logs (activity_date, summary, work_completed, lessons_learned, challenges, next_steps, minutes_worked, visibility)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.activity_date, data.summary, data.work_completed, data.lessons_learned,
     data.challenges, data.next_steps, data.minutes_worked ?? null, data.visibility]
  )
  return rows[0]
}

export async function updateDailyLog(id: number, data: Partial<Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>>): Promise<DailyLog | null> {
  const fields = Object.keys(data) as (keyof typeof data)[]
  if (fields.length === 0) return findDailyLogById(id)
  const sets = fields.map((f, i) => `${f} = $${i + 2}`)
  const { rows } = await pool.query<DailyLog>(
    `UPDATE daily_logs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...fields.map(f => data[f] ?? null)]
  )
  return rows[0] ?? null
}

export async function deleteDailyLog(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM daily_logs WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
