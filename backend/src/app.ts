import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import publicRoutes from './routes/public'
import adminRoutes from './routes/admin'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet())

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', publicRoutes)
app.use('/api/v1/admin', adminRoutes)

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler)

export default app
