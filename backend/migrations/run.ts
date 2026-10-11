import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import argon2 from 'argon2'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const migrationsDir = path.join(__dirname, '.')
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM _migrations WHERE filename = $1',
        [file]
      )
      if (rows.length > 0) {
        console.log(`  skip  ${file}`)
        continue
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`  apply ${file}`)
    }

    // One-time initial admin creation
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim()
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD?.trim()

    if (adminEmail && adminPassword) {
      if (adminPassword.length < 12) {
        console.error('INITIAL_ADMIN_PASSWORD must be at least 12 characters')
        process.exit(1)
      }
      const { rows } = await client.query(
        'SELECT 1 FROM admin_users WHERE email = $1',
        [adminEmail]
      )
      if (rows.length === 0) {
        const hash = await argon2.hash(adminPassword, { type: argon2.argon2id })
        await client.query(
          'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
          [adminEmail, hash]
        )
        console.log(`  admin created: ${adminEmail}`)
        console.log('  IMPORTANT: Remove INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from .env now.')
      } else {
        console.log(`  admin already exists: ${adminEmail}`)
      }
    }

    console.log('Migrations complete.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
