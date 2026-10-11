import 'dotenv/config'
import app from './app'
import { closePool } from './config/db'

const portValue = process.env.PORT ?? '4000'
const PORT = Number(portValue)
const jwtSecret = process.env.JWT_SECRET
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}
if (!jwtSecret || (process.env.NODE_ENV === 'production' && jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET is required and must be at least 32 characters in production')
}
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must contain the exact frontend origin in production')
}
for (const origin of allowedOrigins) {
  let parsedOrigin: URL
  try {
    parsedOrigin = new URL(origin)
  } catch {
    throw new Error('CORS_ORIGINS must contain valid HTTP(S) origins')
  }
  if (
    !['http:', 'https:'].includes(parsedOrigin.protocol) ||
    parsedOrigin.origin !== origin ||
    (process.env.NODE_ENV === 'production' && parsedOrigin.protocol !== 'https:')
  ) {
    throw new Error('CORS_ORIGINS must contain exact HTTPS origins in production')
  }
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
})

function shutdown(signal: string) {
  console.log(`${signal} received — shutting down gracefully`)
  server.close(async () => {
    await closePool()
    console.log('Database pool closed')
    process.exit(0)
  })
  // Force exit after 10 seconds
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
