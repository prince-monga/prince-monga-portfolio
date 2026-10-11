import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { validate } from '../middleware/validate'
import {
  slugSchema, projectFilterSchema, blogFilterSchema,
  journeyFilterSchema, logFilterSchema, contactSchema,
  timelineFilterSchema,
} from '../schemas'
import { listProjects, getProject } from '../controllers/projects'
import { listPosts, getPost } from '../controllers/blog'
import { listJourneyEvents } from '../controllers/journey'
import { listPublicLogs } from '../controllers/journal'
import { submitContact } from '../controllers/contact'
import { listPublicTimeline } from '../controllers/timeline'
import { getPublicSiteImages, getPublicSiteSettings } from '../controllers/siteSettings'
import { getPublicImage } from '../controllers/media'

const router = Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
})

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

router.get('/site-images', getPublicSiteImages)
router.get('/site-settings', getPublicSiteSettings)
router.get('/media/:key', getPublicImage)
router.get('/projects', validate(projectFilterSchema, 'query'), listProjects)
router.get('/projects/:slug', validate(slugSchema, 'params'), getProject)

router.get('/blog', validate(blogFilterSchema, 'query'), listPosts)
router.get('/blog/:slug', validate(slugSchema, 'params'), getPost)

router.get('/journey', validate(journeyFilterSchema, 'query'), listJourneyEvents)

router.get('/journal', validate(logFilterSchema, 'query'), listPublicLogs)
router.get('/timeline', validate(timelineFilterSchema, 'query'), listPublicTimeline)

router.post('/contact', contactLimiter, validate(contactSchema), submitContact)

export default router
