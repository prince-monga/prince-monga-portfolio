import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Pool, type PoolClient } from 'pg'
import argon2 from 'argon2'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  let client: PoolClient | undefined
  let activeMigration = 'migration setup'
  let transactionOpen = false
  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim()
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD?.trim()
    if (Boolean(adminEmail) !== Boolean(adminPassword)) {
      throw new Error('Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD, or leave both blank')
    }
    if (adminPassword && adminPassword.length < 12) {
      throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters')
    }

    client = await pool.connect()

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
      activeMigration = file
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
      transactionOpen = true
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      transactionOpen = false
      console.log(`  apply ${file}`)
    }

    // One-time initial admin creation
    if (adminEmail && adminPassword) {
      activeMigration = 'initial admin setup'
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
        console.log('  admin created')
        console.log('  Remove INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from the environment now.')
      } else {
        console.log('  admin already exists')
      }
    }

    console.log('Migrations complete.')
  } catch (err) {
    if (client && transactionOpen) await client.query('ROLLBACK').catch(() => {})
    const errorName = err instanceof Error ? err.name : 'UnknownError'
    console.error(`Migration failed during ${activeMigration} (${errorName})`)
    process.exitCode = 1
  } finally {
    client?.release()
    await pool.end()
  }
}

run().catch(async (err: unknown) => {
  const errorName = err instanceof Error ? err.name : 'UnknownError'
  console.error(`Migration shutdown failed (${errorName})`)
  await pool.end()
  process.exitCode = 1
})
