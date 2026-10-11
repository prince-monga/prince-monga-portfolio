import 'dotenv/config'
import app from './app'
import { closePool } from './config/db'

const PORT = parseInt(process.env.PORT ?? '4000', 10)

const server = app.listen(PORT, () => {
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
