import { pool } from '../config/db'

export type TimelineContentType = 'blog' | 'journal' | 'journey' | 'project'

export interface PublicTimelineItem {
  id: string
  content_type: TimelineContentType
  date: string
  title: string
  summary: string
  href: string
  item_label: 'created' | 'updated' | null
  minutes_worked: number | null
}

export async function findPublicTimeline(opts: {
  from: string
  to: string
  timeZone: string
}): Promise<PublicTimelineItem[]> {
  const { from, to, timeZone } = opts
  const { rows } = await pool.query<PublicTimelineItem>(
    `SELECT id, content_type, date, title, summary, href, item_label, minutes_worked
     FROM (
       SELECT
         'blog-' || id::text AS id,
         'blog'::text AS content_type,
         (published_at AT TIME ZONE $1::text)::date::text AS date,
         title,
         excerpt AS summary,
         '/blog/' || slug AS href,
         NULL::text AS item_label,
         NULL::integer AS minutes_worked
       FROM blog_posts
       WHERE status = 'published'
         AND published_at IS NOT NULL
         AND (published_at AT TIME ZONE $1::text)::date BETWEEN $2::date AND $3::date

       UNION ALL

       SELECT
         'journal-' || id::text,
         'journal'::text,
         activity_date::text,
         summary,
         summary,
         '/journal',
         NULL::text,
         minutes_worked
       FROM daily_logs
       WHERE visibility = 'public'
         AND activity_date BETWEEN $2::date AND $3::date

       UNION ALL

       SELECT
         'journey-' || id::text,
         'journey'::text,
         event_date::text,
         title,
         description,
         '/journey',
         NULL::text,
         NULL::integer
       FROM journey_events
       WHERE visibility = 'public'
         AND event_date BETWEEN $2::date AND $3::date

       UNION ALL

       SELECT
         'project-created-' || id::text,
         'project'::text,
         (created_at AT TIME ZONE $1::text)::date::text,
         title,
         summary,
         '/projects/' || slug,
         'created'::text,
         NULL::integer
       FROM projects
       WHERE status = 'published'
         AND (created_at AT TIME ZONE $1::text)::date BETWEEN $2::date AND $3::date

       UNION ALL

       SELECT
         'project-updated-' || id::text,
         'project'::text,
         (updated_at AT TIME ZONE $1::text)::date::text,
         title,
         summary,
         '/projects/' || slug,
         'updated'::text,
         NULL::integer
       FROM projects
       WHERE status = 'published'
         AND (updated_at AT TIME ZONE $1::text)::date <> (created_at AT TIME ZONE $1::text)::date
         AND (updated_at AT TIME ZONE $1::text)::date BETWEEN $2::date AND $3::date
     ) AS public_timeline
     ORDER BY date DESC, content_type, title`,
    [timeZone, from, to]
  )

  return rows
}