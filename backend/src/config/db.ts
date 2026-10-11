import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  const code = 'code' in err && typeof err.code === 'string' ? err.code : 'unknown'
  console.error('Unexpected database pool error:', code)
})

export async function closePool(): Promise<void> {
  await pool.end()
}
