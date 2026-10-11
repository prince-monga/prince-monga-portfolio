import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  paginationSchema, idParamSchema, loginSchema,
  createProjectSchema, updateProjectSchema,
  createBlogPostSchema, updateBlogPostSchema,
  createJourneyEventSchema, updateJourneyEventSchema,
  createDailyLogSchema, updateDailyLogSchema,
} from '../schemas'
import { login } from '../controllers/auth'
import { adminListProjects, adminCreateProject, adminUpdateProject, adminDeleteProject } from '../controllers/projects'
import { adminListPosts, adminCreatePost, adminUpdatePost, adminDeletePost } from '../controllers/blog'
import { adminListJourneyEvents, adminCreateJourneyEvent, adminUpdateJourneyEvent, adminDeleteJourneyEvent } from '../controllers/journey'
import { adminListLogs, adminCreateLog, adminUpdateLog, adminDeleteLog } from '../controllers/journal'
import { adminListInquiries, adminUpdateInquiryStatus, adminDeleteInquiry } from '../controllers/contact'
import { getDashboardStats } from '../controllers/stats'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again later.' },
})

// Auth
router.post('/login', loginLimiter, validate(loginSchema), login)

// All routes below require authentication
router.use(requireAuth)

// Projects
router.get('/projects', validate(paginationSchema, 'query'), adminListProjects)
router.post('/projects', validate(createProjectSchema), adminCreateProject)
router.patch('/projects/:id', validate(idParamSchema, 'params'), validate(updateProjectSchema), adminUpdateProject)
router.delete('/projects/:id', validate(idParamSchema, 'params'), adminDeleteProject)

// Blog
router.get('/blog', validate(paginationSchema, 'query'), adminListPosts)
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
