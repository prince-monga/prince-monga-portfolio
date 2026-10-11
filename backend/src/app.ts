import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { AppError, errorHandler } from './middleware/errorHandler'
import publicRoutes from './routes/public'
import adminRoutes from './routes/admin'

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

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
    cb(new AppError(403, 'Origin not allowed'))
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Image-Filename'],
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
