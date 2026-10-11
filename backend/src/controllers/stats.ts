import type { Request, Response, NextFunction } from 'express'
import { pool } from '../config/db'
import { single } from '../utils/response'

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [projectsRes, blogRes, inquiriesRes, journalRes] = await Promise.all([
      pool.query<{ status: string; count: string }>(`
        SELECT status, COUNT(*) as count FROM projects GROUP BY status
      `),
      pool.query<{ status: string; count: string }>(`
        SELECT status, COUNT(*) as count FROM blog_posts GROUP BY status
      `),
      pool.query<{ total: string; unread: string }>(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'new') as unread
        FROM contact_inquiries
      `),
      pool.query<{ total: string; dates: string[] }>(`
        SELECT
          COUNT(*) as total,
          ARRAY_AGG(activity_date::text ORDER BY activity_date DESC) as dates
        FROM daily_logs
      `),
    ])

    // Projects
    const projectCounts = { total: 0, published: 0, draft: 0 }
    for (const row of projectsRes.rows) {
      const n = parseInt(row.count, 10)
      projectCounts.total += n
      if (row.status === 'published') projectCounts.published = n
      if (row.status === 'draft') projectCounts.draft = n
    }

    // Blog
    const blogCounts = { total: 0, published: 0, draft: 0 }
    for (const row of blogRes.rows) {
      const n = parseInt(row.count, 10)
      blogCounts.total += n
      if (row.status === 'published') blogCounts.published = n
      if (row.status === 'draft') blogCounts.draft = n
    }

    // Inquiries
    const inqRow = inquiriesRes.rows[0]
    const inquiries = {
      total: parseInt(inqRow?.total ?? '0', 10),
      unread: parseInt(inqRow?.unread ?? '0', 10),
    }

    // Streak calculation from sorted dates (DESC)
    const jRow = journalRes.rows[0]
    const total = parseInt(jRow?.total ?? '0', 10)
    const dates: string[] = jRow?.dates ?? []

    const { streak, longestStreak } = calculateStreaks(dates)

    single(res, {
      projects: projectCounts,
      blog: blogCounts,
      inquiries,
      journal: { total, streak, longestStreak },
    })
  } catch (err) { next(err) }
}

function calculateStreaks(datesDesc: string[]): { streak: number; longestStreak: number } {
  if (datesDesc.length === 0) return { streak: 0, longestStreak: 0 }

  // Sort ascending for streak calculation
  const sorted = [...datesDesc].sort()

  let longestStreak = 1
  let current = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000)
    if (diffDays === 1) {
      current++
      if (current > longestStreak) longestStreak = current
    } else if (diffDays > 1) {
      current = 1
    }
    // diffDays === 0 means duplicate date — skip (shouldn't happen due to UNIQUE constraint)
  }

  // Current streak: count backwards from today
  const todayStr = new Date().toISOString().slice(0, 10)
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const dateSet = new Set(sorted)

  let streak = 0
  if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
    const startDate = dateSet.has(todayStr) ? todayStr : yesterdayStr
    let check = new Date(startDate)
    while (dateSet.has(check.toISOString().slice(0, 10))) {
      streak++
      check.setDate(check.getDate() - 1)
    }
  }

  return { streak, longestStreak }
}
