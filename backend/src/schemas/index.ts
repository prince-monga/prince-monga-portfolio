import { z } from 'zod'

// ─── Shared ───────────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const slugSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
})

// ─── Projects ─────────────────────────────────────────────────────────────────

const projectCategories = ['Frontend', 'Backend', 'Full Stack', 'Experiment'] as const

export const projectFilterSchema = paginationSchema.extend({
  category: z.enum(projectCategories).optional(),
  featured: z.enum(['true', 'false']).optional(),
})

export const createProjectSchema = z.object({
  title:          z.string().min(1).max(200),
  slug:           z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  summary:        z.string().min(1).max(500),
  description:    z.string().min(1),
  technologies:   z.array(z.string().min(1).max(100)).max(20).default([]),
  category:       z.enum(projectCategories),
  repository_url: z.string().url().optional().or(z.literal('')),
  live_demo_url:  z.string().url().optional().or(z.literal('')),
  image_url:      z.string().url().optional().or(z.literal('')),
  featured:       z.boolean().default(false),
  status:         z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const updateProjectSchema = createProjectSchema.partial()

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const blogFilterSchema = paginationSchema.extend({
  category: z.string().min(1).max(100).optional(),
  tag:      z.string().min(1).max(100).optional(),
  search:   z.string().max(200).optional(),
})

export const createBlogPostSchema = z.object({
  title:            z.string().min(1).max(300),
  slug:             z.string().min(1).max(300).regex(/^[a-z0-9-]+$/),
  excerpt:          z.string().min(1).max(500),
  content:          z.string().default(''),
  category:         z.string().min(1).max(100),
  tags:             z.array(z.string().min(1).max(100)).max(20).default([]),
  seo_title:        z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  cover_image_url:  z.string().url().optional().or(z.literal('')),
  status:           z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

// ─── Journey Events ───────────────────────────────────────────────────────────

const journeyCategories = ['education', 'experience', 'learning', 'milestone'] as const

export const journeyFilterSchema = paginationSchema.extend({
  category: z.enum(journeyCategories).optional(),
})

export const createJourneyEventSchema = z.object({
  title:       z.string().min(1).max(300),
  description: z.string().min(1),
  event_date:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category:    z.enum(journeyCategories),
  visibility:  z.enum(['public', 'private']).default('public'),
})

export const updateJourneyEventSchema = createJourneyEventSchema.partial()

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export const logFilterSchema = paginationSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

const timelineDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}, 'Invalid calendar date')

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}

export const timelineFilterSchema = z.object({
  from: timelineDateSchema,
  to: timelineDateSchema,
  timeZone: z.string().min(1).max(100).refine(isValidTimeZone, 'Invalid time zone').default('Asia/Kolkata'),
}).refine(({ from, to }) => from <= to, {
  message: 'The end date must not be before the start date',
  path: ['to'],
}).refine(({ from, to }) => Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`) <= 365 * 24 * 60 * 60 * 1000, {
  message: 'Date range must not exceed 366 days',
  path: ['to'],
})

export const createDailyLogSchema = z.object({
  activity_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary:         z.string().min(1).max(500),
  work_completed:  z.string().default(''),
  lessons_learned: z.string().default(''),
  challenges:      z.string().default(''),
  next_steps:      z.string().default(''),
  minutes_worked:  z.number().int().min(0).max(1440).optional(),
  visibility:      z.enum(['public', 'private']).default('private'),
})

export const updateDailyLogSchema = createDailyLogSchema.partial()

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name:         z.string().min(1).max(100).trim(),
  email:        z.string().email().max(254).trim(),
  project_type: z.string().max(100).default(''),
  budget_range: z.string().max(100).default(''),
  message:      z.string().min(10).max(2000).trim(),
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email().max(254),
  password: z.string().min(1).max(200),
})

// ─── Admin ID param ───────────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})
