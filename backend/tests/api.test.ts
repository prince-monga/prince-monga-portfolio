import request from 'supertest'
import app from '../src/app'
import { pool } from '../src/config/db'

// Helper to check if DB is reachable
async function dbAvailable(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

afterAll(async () => {
  await pool.end().catch(() => {})
})

// ─── Health ───────────────────────────────────────────────────────────────────

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.status).toBe('ok')
    expect(res.body).not.toHaveProperty('DATABASE_URL')
    expect(res.body).not.toHaveProperty('JWT_SECRET')
  })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  it('returns 404 for unknown path', async () => {
    const res = await request(app).get('/api/v1/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

// ─── Input validation ─────────────────────────────────────────────────────────

describe('Query parameter validation', () => {
  it('rejects page=0', async () => {
    const res = await request(app).get('/api/v1/projects?page=0')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects limit=100 (exceeds max 50)', async () => {
    const res = await request(app).get('/api/v1/projects?limit=100')
    expect(res.status).toBe(400)
  })

  it('rejects invalid slug characters', async () => {
    const res = await request(app).get('/api/v1/projects/INVALID_SLUG!')
    expect(res.status).toBe(400)
  })

  it('rejects invalid blog slug', async () => {
    const res = await request(app).get('/api/v1/blog/Has Spaces')
    expect(res.status).toBe(400)
  })

  it('rejects invalid dates for the public timeline', async () => {
    const res = await request(app).get('/api/v1/timeline?from=2026-02-30&to=2026-03-01')
    expect(res.status).toBe(400)
  })

  it('rejects reversed or oversized public timeline ranges', async () => {
    const reversed = await request(app).get('/api/v1/timeline?from=2026-10-10&to=2026-10-09')
    const oversized = await request(app).get('/api/v1/timeline?from=2025-01-01&to=2026-01-03')
    expect(reversed.status).toBe(400)
    expect(oversized.status).toBe(400)
  })

  it('rejects invalid timeline time zones', async () => {
    const res = await request(app).get('/api/v1/timeline?from=2026-10-09&to=2026-10-09&timeZone=Not%2FAZone')
    expect(res.status).toBe(400)
  })
})

// ─── Contact validation ───────────────────────────────────────────────────────

describe('POST /api/v1/contact', () => {
  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/v1/contact').send({})
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.details).toBeDefined()
  })

  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'Test User',
      email: 'not-an-email',
      message: 'Hello, this is a test message that is long enough.',
    })
    expect(res.status).toBe(400)
  })

  it('rejects message that is too short', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Short',
    })
    expect(res.status).toBe(400)
  })

  it('rejects oversized body', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({ name: 'x'.repeat(60_000) })
    // Express body limit (50kb) or Zod validation should reject this
    expect([400, 413]).toContain(res.status)
  })
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/admin/login', () => {
  it('rejects missing credentials', async () => {
    const res = await request(app).post('/api/v1/admin/login').send({})
    expect(res.status).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'notanemail', password: 'somepassword' })
    expect(res.status).toBe(400)
  })
})

describe('Admin routes without token', () => {
  it('returns 401 for GET /api/v1/admin/projects without token', async () => {
    const res = await request(app).get('/api/v1/admin/projects')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('returns 401 for POST /api/v1/admin/blog without token', async () => {
    const res = await request(app).post('/api/v1/admin/blog').send({ title: 'Test' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for DELETE /api/v1/admin/projects/1 without token', async () => {
    const res = await request(app).delete('/api/v1/admin/projects/1')
    expect(res.status).toBe(401)
  })
})

describe('Admin routes with invalid token', () => {
  it('returns 401 for tampered token', async () => {
    const res = await request(app)
      .get('/api/v1/admin/projects')
      .set('Authorization', 'Bearer this.is.not.valid')
    expect(res.status).toBe(401)
  })
})

// ─── DB-dependent tests (skipped if DB unavailable) ──────────────────────────

describe('Public endpoints (DB required)', () => {
  let hasDb = false

  beforeAll(async () => {
    hasDb = await dbAvailable()
    if (!hasDb) console.warn('  Skipping DB tests — no database connection')
  })

  it('GET /api/v1/projects returns paginated response', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/projects')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 20,
    })
  })

  it('GET /api/v1/blog returns paginated response', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/blog')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/v1/journey returns only public events', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/journey')
    expect(res.status).toBe(200)
    const events = res.body.data as Array<{ visibility: string }>
    events.forEach(e => expect(e.visibility).toBe('public'))
  })

  it('GET /api/v1/journal returns only public logs', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/journal')
    expect(res.status).toBe(200)
    const logs = res.body.data as Array<{ visibility: string }>
    logs.forEach(l => expect(l.visibility).toBe('public'))
  })

  it('GET /api/v1/timeline returns only safe public item fields', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/timeline?from=2025-10-09&to=2026-10-09&timeZone=Asia%2FKolkata')
    expect(res.status).toBe(200)
    expect(res.body.time_zone).toBe('Asia/Kolkata')
    expect(Array.isArray(res.body.data)).toBe(true)
    for (const item of res.body.data as Array<Record<string, unknown>>) {
      expect(['blog', 'journal', 'journey', 'project']).toContain(item.content_type)
      expect(item).not.toHaveProperty('visibility')
      expect(item).not.toHaveProperty('status')
      expect(item).not.toHaveProperty('email')
    }
  })

  it('GET /api/v1/projects/:slug returns 404 for unknown slug', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/projects/this-slug-does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/v1/blog/:slug returns 404 for unknown slug', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/blog/this-slug-does-not-exist')
    expect(res.status).toBe(404)
  })

  it('draft projects are not returned in public listing', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/projects')
    expect(res.status).toBe(200)
    const projects = res.body.data as Array<{ status: string }>
    projects.forEach(p => expect(p.status).toBe('published'))
  })

  it('draft blog posts are not returned in public listing', async () => {
    if (!hasDb) return
    const res = await request(app).get('/api/v1/blog')
    expect(res.status).toBe(200)
    const posts = res.body.data as Array<{ status: string }>
    posts.forEach(p => expect(p.status).toBe('published'))
  })

  it('admin login with wrong credentials returns 401', async () => {
    if (!hasDb) return
    const res = await request(app)
      .post('/api/v1/admin/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword123' })
    expect(res.status).toBe(401)
    expect(res.body).not.toHaveProperty('token')
  })

  it('contact submission with valid data returns 201', async () => {
    if (!hasDb) return
    const res = await request(app).post('/api/v1/contact').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message that is long enough to pass validation.',
    })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.message).toContain('received')
    // Must not expose internal IDs or sensitive data beyond confirmation
    expect(res.body.data).not.toHaveProperty('email')
  })
})
