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
const safeWebUrlSchema = z.string().url().refine(value => {
  const protocol = new URL(value).protocol
  return protocol === 'http:' || protocol === 'https:'
}, 'URL must use HTTP or HTTPS')
const optionalSafeWebUrlSchema = safeWebUrlSchema.optional().or(z.literal(''))
const projectGalleryImageSchema = z.object({
  asset_id: z.number().int().positive(),
  alt_text: z.string().max(300),
  caption: z.string().max(500),
})

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
  repository_url: optionalSafeWebUrlSchema,
  live_demo_url:  optionalSafeWebUrlSchema,
  image_url:      optionalSafeWebUrlSchema,
  image_asset_id: z.number().int().positive().nullable().optional(),
  image_alt_text: z.string().max(300).optional(),
  gallery_images: z.array(projectGalleryImageSchema).max(12).default([]),
  featured:       z.boolean().default(false),
  status:         z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const updateProjectSchema = createProjectSchema.partial()

// ─── Blog Posts ───────────────────────────────────────────────────────────────

const articleImageSchema = z.object({
  asset_id: z.number().int().positive(),
  alt_text: z.string().max(300),
  caption: z.string().max(500),
})

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
  cover_image_url:  optionalSafeWebUrlSchema,
  cover_image_asset_id: z.number().int().positive().nullable().optional(),
  cover_image_alt: z.string().max(300).optional(),
  article_images: z.array(articleImageSchema).max(20).default([]),
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
  image_asset_id: z.number().int().positive().nullable().optional(),
  image_alt_text: z.string().max(300).optional(),
  image_caption: z.string().max(500).optional(),
})

export const updateJourneyEventSchema = createJourneyEventSchema.partial()

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export const logFilterSchema = paginationSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}, 'Invalid calendar date')

const timelineDateSchema = calendarDateSchema

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
  activity_date:   calendarDateSchema,
  summary:         z.string().min(1).max(500),
  work_completed:  z.string().default(''),
  lessons_learned: z.string().default(''),
  challenges:      z.string().default(''),
  next_steps:      z.string().default(''),
  minutes_worked:  z.number().int().min(0).max(1440).optional(),
  visibility:      z.enum(['public', 'private']).default('private'),
  image_asset_id: z.number().int().positive().nullable().optional(),
  image_alt_text: z.string().max(300).optional(),
  image_caption: z.string().max(500).optional(),
})

export const updateDailyLogSchema = createDailyLogSchema.partial()

// ─── Site-wide images ─────────────────────────────────────────────────────────

const siteImageReferenceSchema = z.object({
  asset_id: z.number().int().positive(),
  alt_text: z.string().max(300),
})

export const updateSiteImagesSchema = z.object({
  profile_image: siteImageReferenceSchema.nullable().optional(),
  og_image: siteImageReferenceSchema.nullable().optional(),
})

export const updateSiteSettingsSchema = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  tagline: z.string().trim().max(300).optional(),
  github_url: optionalSafeWebUrlSchema,
  linkedin_url: optionalSafeWebUrlSchema,
  twitter_url: optionalSafeWebUrlSchema,
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
})

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
