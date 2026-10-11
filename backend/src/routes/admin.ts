import { raw, Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  paginationSchema, idParamSchema, loginSchema,
  createProjectSchema, updateProjectSchema,
  createBlogPostSchema, updateBlogPostSchema,
  createJourneyEventSchema, updateJourneyEventSchema,
  createDailyLogSchema, updateDailyLogSchema,
  updateSiteImagesSchema, updateSiteSettingsSchema,
} from '../schemas'
import { login } from '../controllers/auth'
import { adminListProjects, adminCreateProject, adminUpdateProject, adminDeleteProject } from '../controllers/projects'
import { adminListPosts, adminGetPost, adminCreatePost, adminUpdatePost, adminDeletePost } from '../controllers/blog'
import { adminListJourneyEvents, adminCreateJourneyEvent, adminUpdateJourneyEvent, adminDeleteJourneyEvent } from '../controllers/journey'
import { adminListLogs, adminCreateLog, adminUpdateLog, adminDeleteLog } from '../controllers/journal'
import { adminListInquiries, adminUpdateInquiryStatus, adminDeleteInquiry } from '../controllers/contact'
import { getDashboardStats } from '../controllers/stats'
import { getAdminImagePreview, uploadImage } from '../controllers/media'
import {
  getAdminSiteImages, updateAdminSiteImages,
  getAdminSiteSettings, updateAdminSiteSettings,
} from '../controllers/siteSettings'

const router = Router()
const imageContentTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const parseImageBody = raw({ type: imageContentTypes, limit: '8mb' })

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again later.' },
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many uploads. Please try again later.' },
})

// Auth
router.post('/login', loginLimiter, validate(loginSchema), login)

// All routes below require authentication
router.use(requireAuth)

// Images are sent as binary, not JSON. The parser's limit matches the UI limit.
router.post(
  '/media/upload',
  uploadLimiter,
  (req, res, next) => {
    const contentType = req.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
    if (!contentType || !imageContentTypes.includes(contentType)) {
      return res.status(415).json({ success: false, error: 'Unsupported image type' })
    }
    next()
  },
  parseImageBody,
  uploadImage
)

router.get('/site-images', getAdminSiteImages)
router.patch('/site-images', validate(updateSiteImagesSchema), updateAdminSiteImages)
router.get('/site-settings', getAdminSiteSettings)
router.patch('/site-settings', validate(updateSiteSettingsSchema), updateAdminSiteSettings)
router.get('/media/:id/preview', validate(idParamSchema, 'params'), getAdminImagePreview)

// Projects
router.get('/projects', validate(paginationSchema, 'query'), adminListProjects)
router.post('/projects', validate(createProjectSchema), adminCreateProject)
router.patch('/projects/:id', validate(idParamSchema, 'params'), validate(updateProjectSchema), adminUpdateProject)
router.delete('/projects/:id', validate(idParamSchema, 'params'), adminDeleteProject)

// Blog
router.get('/blog', validate(paginationSchema, 'query'), adminListPosts)
router.get('/blog/:id', validate(idParamSchema, 'params'), adminGetPost)
router.post('/blog', validate(createBlogPostSchema), adminCreatePost)
router.patch('/blog/:id', validate(idParamSchema, 'params'), validate(updateBlogPostSchema), adminUpdatePost)
router.delete('/blog/:id', validate(idParamSchema, 'params'), adminDeletePost)

// Journey
router.get('/journey', validate(paginationSchema, 'query'), adminListJourneyEvents)
router.post('/journey', validate(createJourneyEventSchema), adminCreateJourneyEvent)
router.patch('/journey/:id', validate(idParamSchema, 'params'), validate(updateJourneyEventSchema), adminUpdateJourneyEvent)
router.delete('/journey/:id', validate(idParamSchema, 'params'), adminDeleteJourneyEvent)

// Journal / Daily logs
router.get('/journal', validate(paginationSchema, 'query'), adminListLogs)
router.post('/journal', validate(createDailyLogSchema), adminCreateLog)
router.patch('/journal/:id', validate(idParamSchema, 'params'), validate(updateDailyLogSchema), adminUpdateLog)
router.delete('/journal/:id', validate(idParamSchema, 'params'), adminDeleteLog)

// Dashboard stats
router.get('/stats', getDashboardStats)

// Contact inquiries
router.get('/contact', validate(paginationSchema, 'query'), adminListInquiries)
router.patch('/contact/:id/status', validate(idParamSchema, 'params'), adminUpdateInquiryStatus)
router.delete('/contact/:id', validate(idParamSchema, 'params'), adminDeleteInquiry)

export default router
