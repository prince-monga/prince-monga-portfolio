import { pool } from '../config/db'

export interface AdminUser {
  id: number
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const { rows } = await pool.query<AdminUser>(
    'SELECT * FROM admin_users WHERE email = $1',
    [email]
  )
  return rows[0] ?? null
}
