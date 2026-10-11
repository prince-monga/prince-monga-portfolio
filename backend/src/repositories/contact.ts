import { pool } from '../config/db'

export interface ContactInquiry {
  id: number
  name: string
  email: string
  project_type: string
  budget_range: string
  message: string
  status: string
  created_at: string
}

export async function insertInquiry(data: Omit<ContactInquiry, 'id' | 'created_at' | 'status'>): Promise<ContactInquiry> {
  const { rows } = await pool.query<ContactInquiry>(
    'INSERT INTO contact_inquiries (name, email, project_type, budget_range, message) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [data.name, data.email, data.project_type, data.budget_range, data.message]
  )
  return rows[0]
}

export async function findAllInquiries(page: number, limit: number): Promise<{ rows: ContactInquiry[]; total: number }> {
  const offset = (page - 1) * limit
  const [dataRes, countRes] = await Promise.all([
    pool.query<ContactInquiry>('SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM contact_inquiries'),
  ])
  return { rows: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) }
}

export async function updateInquiryStatus(id: number, status: string): Promise<ContactInquiry | null> {
  const { rows } = await pool.query<ContactInquiry>(
    "UPDATE contact_inquiries SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  )
  return rows[0] ?? null
}

export async function deleteInquiry(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM contact_inquiries WHERE id = $1', [id])
  return (rowCount ?? 0) > 0
}
