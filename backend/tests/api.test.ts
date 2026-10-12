import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../src/app'
import { pool } from '../src/config/db'
import * as blogRepository from '../src/repositories/blog'
import {
  createBlogPostSchema,
  createDailyLogSchema,
  createJourneyEventSchema,
  createProjectSchema,
  updateSiteSettingsSchema,
} from '../src/schemas'

// Helper to check if DB is reachable
async function dbAvailable(): Promise<boolean> {
  if (!process.env.TEST_DATABASE_URL) return false
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

describe('CORS', () => {
  it('allows configured origins and rejects origins outside the allowlist', async () => {
    const allowed = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173')
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const rejected = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'https://untrusted.example')

      expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')
      expect(rejected.status).toBe(403)
      expect(rejected.headers['access-control-allow-origin']).toBeUndefined()
    } finally {
      errorSpy.mockRestore()
    }
  })
})

// ─── Input validation ─────────────────────────────────────────────────────────

describe('Query parameter validation', () => {
  it('rejects page=0', async () => {
    const res = await request(app).get('/api/v1/projects?page=0')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  describe('Daily log validation', () => {
    const validLog = {
      activity_date: '2024-02-29',
      summary: 'Built a feature',
    }

    it('accepts a real leap-day date', () => {
      expect(createDailyLogSchema.safeParse(validLog).success).toBe(true)
    })

    it('accepts optional image metadata and rejects invalid asset references', () => {
      expect(createDailyLogSchema.safeParse({
        ...validLog,
        image_asset_id: 5,
        image_alt_text: 'Code editor',
        image_caption: 'A work in progress',
      }).success).toBe(true)
      expect(createDailyLogSchema.safeParse({
        ...validLog,
        image_asset_id: 0,
      }).success).toBe(false)
    })

    describe('Project image validation', () => {
      const validProject = {
        title: 'Project',
        slug: 'project',
        summary: 'A project summary',
        description: 'Project description',
        category: 'Full Stack',
        gallery_images: [{ asset_id: 1, alt_text: 'Dashboard view', caption: 'Dashboard' }],
      }

      it('accepts image metadata and ordered gallery entries', () => {
        expect(createProjectSchema.safeParse(validProject).success).toBe(true)
      })

      describe('Blog image validation', () => {
        const validPost = {
          title: 'Article',
          slug: 'article',
          excerpt: 'Article excerpt',
          content: 'Article content',
          category: 'Engineering',
          article_images: [{ asset_id: 2, alt_text: 'Architecture', caption: 'System diagram' }],
        }

        it('accepts cover and ordered article image metadata', () => {
          expect(createBlogPostSchema.safeParse({
            ...validPost,
            cover_image_asset_id: 1,
            cover_image_alt: 'Article cover',
          }).success).toBe(true)
        })

        it('rejects invalid asset IDs and oversized article galleries', () => {
          expect(createBlogPostSchema.safeParse({
            ...validPost,
            article_images: [{ asset_id: -1, alt_text: '', caption: '' }],
          }).success).toBe(false)
          expect(createBlogPostSchema.safeParse({
            ...validPost,
            article_images: Array.from({ length: 21 }, (_, index) => ({
              asset_id: index + 1,
              alt_text: '',
              caption: '',
            })),
          }).success).toBe(false)
        })
      })

      it('rejects invalid asset IDs and galleries above the configured maximum', () => {
        expect(createProjectSchema.safeParse({
          ...validProject,
          gallery_images: [{ asset_id: 0, alt_text: '', caption: '' }],
        }).success).toBe(false)
        expect(createProjectSchema.safeParse({
          ...validProject,
          gallery_images: Array.from({ length: 13 }, (_, asset_id) => ({
            asset_id: asset_id + 1,
            alt_text: '',
            caption: '',
          })),
        }).success).toBe(false)
      })
    })

    it('rejects impossible calendar dates', () => {
      expect(createDailyLogSchema.safeParse({
        ...validLog,
        activity_date: '2026-02-30',
      }).success).toBe(false)
    })

  })

  it('accepts optional journey image metadata and rejects invalid asset references', () => {
    const event = {
      title: 'Completed a course',
      description: 'Finished an advanced course.',
      event_date: '2024-02-29',
      category: 'milestone',
    }
    expect(createJourneyEventSchema.safeParse({
      ...event,
      image_asset_id: 5,
      image_alt_text: 'Certificate',
      image_caption: 'Course completion',
    }).success).toBe(true)
    expect(createJourneyEventSchema.safeParse({
      ...event,
      image_asset_id: -1,
    }).success).toBe(false)
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

  it('accepts safe site profile values and rejects executable URL schemes', () => {
    expect(updateSiteSettingsSchema.safeParse({
      display_name: 'Prince Monga',
      github_url: 'https://github.com/prince-monga',
      email: 'hello@example.com',
    }).success).toBe(true)
    expect(updateSiteSettingsSchema.safeParse({
      twitter_url: 'javascript:alert(1)',
    }).success).toBe(false)
    expect(createProjectSchema.safeParse({
      title: 'Project',
      slug: 'project',
      summary: 'A project summary',
      description: 'Project description',
      category: 'Full Stack',
      live_demo_url: 'javascript:alert(1)',
    }).success).toBe(false)
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
  it('keeps site settings protected', async () => {
    const res = await request(app).get('/api/v1/admin/site-settings')
    expect(res.status).toBe(401)
  })

  it('keeps the admin router protected at its base path', async () => {
    const res = await request(app).get('/api/v1/admin?page=0')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

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

describe('GET /api/v1/admin/blog database errors', () => {
  it('keeps the response generic and logs the PostgreSQL schema diagnostic', async () => {
    const databaseError = Object.assign(
      new Error('column p.cover_image_asset_id does not exist'),
      { code: '42703' }
    )
    const repositorySpy = jest.spyOn(blogRepository, 'findAllPosts')
      .mockRejectedValue(databaseError)
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const token = jwt.sign(
        { adminId: 1, email: 'admin@example.test' },
        process.env.JWT_SECRET as string
      )
      const res = await request(app)
        .get('/api/v1/admin/blog')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ success: false, error: 'Internal server error' })
      expect(res.text).not.toContain('cover_image_asset_id')
      expect(errorSpy).toHaveBeenCalledWith('Unhandled request error:', {
        errorName: 'Error',
        errorCode: '42703',
        databaseMessage: 'column p.cover_image_asset_id does not exist',
      })
    } finally {
      repositorySpy.mockRestore()
      errorSpy.mockRestore()
    }
  })
})

describe('Admin image uploads', () => {
  const validAdminToken = () => jwt.sign(
    { adminId: 1, email: 'admin@example.test' },
    process.env.JWT_SECRET as string
  )
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  it('requires admin authentication before accepting image uploads', async () => {
    const res = await request(app)
      .post('/api/v1/admin/media/upload')
      .set('Content-Type', 'image/png')
      .send(pngHeader)
    expect(res.status).toBe(401)
  })

  it('requires admin authentication for private image previews', async () => {
    const res = await request(app).get('/api/v1/admin/media/1/preview')
    expect(res.status).toBe(401)
  })

  it('returns a clear error when image storage is not configured', async () => {
    const envKeys = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'] as const
    const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]))
    for (const key of envKeys) delete process.env[key]

    try {
      const res = await request(app)
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${validAdminToken()}`)
        .set('Content-Type', 'image/png')
        .send(pngHeader)
      expect(res.status).toBe(503)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Image storage is not configured')
      expect(res.body.data).toBeUndefined()
    } finally {
      for (const key of envKeys) {
        const value = previous[key]
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
  })

  it('rejects unsupported media types', async () => {
    const res = await request(app)
      .post('/api/v1/admin/media/upload')
      .set('Authorization', `Bearer ${validAdminToken()}`)
      .set('Content-Type', 'image/svg+xml')
      .send('<svg/>')
    expect(res.status).toBe(415)
  })

  it('rejects uploads larger than 8 MB', async () => {
    const res = await request(app)
      .post('/api/v1/admin/media/upload')
      .set('Authorization', `Bearer ${validAdminToken()}`)
      .set('Content-Type', 'image/png')
      .send(Buffer.alloc(8 * 1024 * 1024 + 1))
    expect(res.status).toBe(413)
    expect(res.body.error).toBe('Request body too large')
  })

  it('rejects file content that does not match its declared image type', async () => {
    const res = await request(app)
      .post('/api/v1/admin/media/upload')
      .set('Authorization', `Bearer ${validAdminToken()}`)
      .set('Content-Type', 'image/png')
      .send(Buffer.from('GIF89a'))
    expect(res.status).toBe(415)
  })

  it('returns a configuration error rather than pretending upload succeeded', async () => {
    const envKeys = [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_PUBLIC_BASE_URL',
    ] as const
    const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]))
    process.env.R2_ACCOUNT_ID = 'invalid'
    process.env.R2_ACCESS_KEY_ID = 'test-access-key'
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key'
    process.env.R2_BUCKET_NAME = 'test-bucket'
    process.env.R2_PUBLIC_BASE_URL = 'https://images.example.test'

    try {
      const res = await request(app)
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${validAdminToken()}`)
        .set('Content-Type', 'image/png')
        .send(pngHeader)
      expect(res.status).toBe(503)
      expect(res.body.success).toBe(false)
      expect(res.body.data).toBeUndefined()
    } finally {
      for (const key of envKeys) {
        const value = previous[key]
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
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
