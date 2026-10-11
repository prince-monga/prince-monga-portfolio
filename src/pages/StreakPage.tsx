import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import { blogPosts, contentSettings, demoStreakData } from '../data/content'
import type { ApiTimelineItem } from '../lib/publicApi'
import type { StreakDay } from '../types'

const levelColors = [
  'bg-neutral-100 dark:bg-neutral-800',
  'bg-blue-100 dark:bg-blue-900',
  'bg-blue-300 dark:bg-blue-700',
  'bg-blue-500 dark:bg-blue-500',
  'bg-blue-700 dark:bg-blue-300',
]

const levelLabels = ['No activity', 'Light', 'Moderate', 'Active', 'Very active']
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseCalendarDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`)
}

function getWeeks(days: StreakDay[]) {
  if (days.length === 0) return []
  const firstDate = parseCalendarDate(days[0].date)
  const startPad = firstDate.getUTCDay()
  const padded: (StreakDay | null)[] = [...Array(startPad).fill(null), ...days]
  const weeks: (StreakDay | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
  return weeks
}

function getMonthLabels(days: StreakDay[]) {
  const labels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1
  const startPad = days.length ? parseCalendarDate(days[0].date).getUTCDay() : 0
  days.forEach((day, i) => {
    const d = parseCalendarDate(day.date)
    const month = d.getUTCMonth()
    if (month !== lastMonth) {
      labels.push({
        label: new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(d),
        weekIndex: Math.floor((i + startPad) / 7),
      })
      lastMonth = month
    }
  })
  return labels
}

function getCalendarRange(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find(part => part.type === 'year')?.value)
  const month = Number(parts.find(part => part.type === 'month')?.value)
  const day = Number(parts.find(part => part.type === 'day')?.value)
  const to = new Date(Date.UTC(year, month - 1, day))
  const from = new Date(to.getTime() - 364 * 24 * 60 * 60 * 1000)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

function buildRealDays(from: string, items: ApiTimelineItem[]): StreakDay[] {
  const journalMinutes = new Map(
    items.filter(item => item.content_type === 'journal')
      .map(item => [item.date, item.minutes_worked ?? 30])
  )
  const fromTime = parseCalendarDate(from).getTime()

  return Array.from({ length: 365 }, (_, offset) => {
    const date = new Date(fromTime + offset * 24 * 60 * 60 * 1000)
    const iso = date.toISOString().slice(0, 10)
    const minutes = journalMinutes.get(iso) ?? 0
    const level: 0 | 1 | 2 | 3 | 4 =
      minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 120 ? 3 : 4
    return { date: iso, level }
  })
}

function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parseCalendarDate(iso))
}

const typeLabels: Record<ApiTimelineItem['content_type'], string> = {
  blog: 'Blog',
  journal: 'Journal',
  journey: 'Journey',
  project: 'Project',
}

function getTooltip(day: StreakDay, items: ApiTimelineItem[], demoMode: boolean) {
  const publicItems = items.filter(item => !item.is_demo)
  const demoItems = items.filter(item => item.is_demo)
  const lines = [formatFullDate(day.date)]

  if (publicItems.length === 0 && demoItems.length === 0) {
    lines.push('No public entries for this date.')
  } else {
    lines.push(`${publicItems.length} public item${publicItems.length === 1 ? '' : 's'}`)
    if (demoItems.length) lines.push(`${demoItems.length} demo item${demoItems.length === 1 ? '' : 's'}`)
    for (const item of items.slice(0, 3)) {
      const preview = item.content_type === 'journal' ? item.summary : item.title
      lines.push(`${item.is_demo ? 'Demo blog' : typeLabels[item.content_type]}: ${preview.slice(0, 90)}`)
    }
  }

  if (demoMode) lines.push('Demo activity — sample data.')
  return lines.join('\n')
}

export default function StreakPage() {
  const demoMode = contentSettings.demoMode
  const [calendarRange] = useState(() => getCalendarRange(contentSettings.timeZone))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { data, loading, error } = usePublicFetch(
    () => publicApi.timeline.list({ ...calendarRange, timeZone: contentSettings.timeZone }),
    [calendarRange.from, calendarRange.to, contentSettings.timeZone]
  )

  const timelineItems = useMemo(() => {
    const publicItems = data?.data ?? []
    const existingHrefs = new Set(publicItems.map(item => item.href))
    const demoArticles: ApiTimelineItem[] = demoMode
      ? blogPosts
        .filter(post => post.status === 'published' && post.isDemo && post.date !== undefined && post.date >= calendarRange.from && post.date <= calendarRange.to)
        .filter(post => !existingHrefs.has(`/blog/${post.slug}`))
        .map(post => ({
          id: `demo-${post.id}`,
          content_type: 'blog',
          date: post.date!,
          title: post.title,
          summary: post.excerpt,
          href: `/blog/${post.slug}`,
          item_label: null,
          minutes_worked: null,
          is_demo: true,
        }))
      : []

    return [...publicItems, ...demoArticles]
  }, [data, demoMode, calendarRange.from, calendarRange.to])

  const streakDays = useMemo<StreakDay[]>(() => {
    if (demoMode) return demoStreakData
    return buildRealDays(calendarRange.from, timelineItems)
  }, [demoMode, calendarRange.from, timelineItems])

  const weeks = useMemo(() => getWeeks(streakDays), [streakDays])
  const monthLabels = useMemo(() => getMonthLabels(streakDays), [streakDays])
  const totalActive = streakDays.filter(d => d.level > 0).length
  const publicLogDays = new Set(timelineItems
    .filter(item => item.content_type === 'journal' && !item.is_demo)
    .map(item => item.date))
  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, ApiTimelineItem[]>()
    for (const item of timelineItems) {
      const items = grouped.get(item.date) ?? []
      items.push(item)
      grouped.set(item.date, items)
    }
    return grouped
  }, [timelineItems])
  const selectedItems = selectedDate ? itemsByDate.get(selectedDate) ?? [] : []
  const selectedPublicItems = selectedItems.filter(item => !item.is_demo)
  const selectedDemoItems = selectedItems.filter(item => item.is_demo)
  const sections: { type: ApiTimelineItem['content_type']; label: string }[] = [
    { type: 'blog', label: 'Blog' },
    { type: 'journal', label: 'Journal' },
    { type: 'journey', label: 'Journey' },
    { type: 'project', label: 'Projects' },
  ]

  return (
    <>
      <PageMeta
        title="Build Streak | Prince Monga"
        description="Prince Monga's development activity calendar — a visual record of daily building and learning."
        slug="streak"
      />

      <main id="main-content" className="section-padding container-wide py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Build streak
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-xl">
          {demoMode
            ? 'A calendar preview using generated sample records. These values are not your development history.'
            : 'A calendar of published public activity logs from the past year. Darker cells indicate more logged work.'}
        </p>

        {demoMode && (
          <p className="mb-6 inline-block rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Demo activity — sample data
          </p>
        )}

        {!demoMode && loading && (
          <div className="mb-6 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Loading activity…
          </div>
        )}

        {!demoMode && data && publicLogDays.size === 0 && (
          <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
            No published public logs in this 365-day window. The calendar shows no activity until public logs are available.
          </p>
        )}

        {!demoMode && !loading && error && (
          <p role="alert" className="mb-6 text-sm text-red-700 dark:text-red-300">
            Public activity could not be loaded: {error}
          </p>
        )}

        {demoMode && error && (
          <p role="status" className="mb-6 text-xs text-amber-700 dark:text-amber-300">
            Public timeline details are unavailable right now; the labeled sample calendar remains visible.
          </p>
        )}

        {/* Stats */}
        {streakDays.length > 0 && (demoMode || !loading) && (
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {totalActive}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{demoMode ? 'sample active days' : 'public activity days'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {demoMode ? streakDays.length : publicLogDays.size}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{demoMode ? 'sample days' : 'days with public logs'}</p>
            </div>
          </div>
        )}

        {/* Calendar heatmap */}
        {streakDays.length > 0 && (demoMode || !loading) && (
          <div className="overflow-x-auto pb-2" role="region" aria-label="Activity calendar heatmap">
            <div className="min-w-max">
              {/* Month labels */}
              <div className="flex mb-1 ml-10">
                {weeks.map((_, wi) => {
                  const label = monthLabels.find(m => m.weekIndex === wi)
                  return (
                    <div
                      key={wi}
                      className="w-3.5 mr-0.5 text-xs text-neutral-400 dark:text-neutral-600 font-mono"
                    >
                      {label ? label.label : ''}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-0.5">
                {/* Day of week labels */}
                <div className="flex flex-col gap-0.5 mr-1">
                  {DAYS_OF_WEEK.map((d, i) => (
                    <div
                      key={d}
                      aria-label={d}
                      className="w-8 h-3.5 flex items-center justify-end pr-1 text-[10px] text-neutral-400 dark:text-neutral-600 font-mono"
                    >
                      {i === 1 || i === 3 || i === 5 ? d : ''}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-0.5">
                    {week.map((day, di) => {
                      if (!day) return <div key={di} className="w-3.5 h-3.5" aria-hidden="true" />
                      const dayItems = itemsByDate.get(day.date) ?? []
                      const label = getTooltip(day, dayItems, demoMode)
                      const isSelected = selectedDate === day.date
                      return (
                        <button
                          key={di}
                          type="button"
                          role="gridcell"
                          aria-label={label}
                          aria-selected={isSelected}
                          title={label}
                          onClick={() => setSelectedDate(day.date)}
                          className={`w-3.5 h-3.5 rounded-sm ${levelColors[day.level]} cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 ${isSelected ? 'ring-2 ring-neutral-900 dark:ring-white' : ''}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {streakDays.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-neutral-400 dark:text-neutral-600">Less</span>
            {levelColors.map((cls, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-sm ${cls}`}
                aria-label={levelLabels[i]}
                title={levelLabels[i]}
              />
            ))}
            <span className="text-xs text-neutral-400 dark:text-neutral-600">More</span>
          </div>
        )}

        {selectedDate && (
          <section
            id="selected-day-details"
            aria-labelledby="selected-day-heading"
            aria-live="polite"
            className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="selected-day-heading" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatFullDate(selectedDate)}
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {selectedPublicItems.length} public item{selectedPublicItems.length === 1 ? '' : 's'}
                  {selectedDemoItems.length > 0 && ` · ${selectedDemoItems.length} demo item${selectedDemoItems.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Close details
              </button>
            </div>

            {demoMode && (
              <p className="mb-5 text-xs text-amber-700 dark:text-amber-300">
                Sample activity is separate from the public content listed below.
              </p>
            )}

            {loading && (
              <p role="status" className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Loading public entries…
              </p>
            )}

            {!loading && error && selectedPublicItems.length === 0 && (
              <p role="alert" className="mb-5 text-sm text-red-700 dark:text-red-300">
                Public entries could not be loaded: {error}
              </p>
            )}

            {!loading && !error && selectedItems.length === 0 && (
              <p className="mb-5 rounded-md border border-dashed border-neutral-300 p-5 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                No public entries for this date.
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {sections.map(section => {
                const sectionItems = selectedItems.filter(item => item.content_type === section.type)
                return (
                  <section key={section.type} aria-labelledby={`day-${section.type}-heading`}>
                    <h3 id={`day-${section.type}-heading`} className="mb-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                      {section.label}
                    </h3>
                    {sectionItems.length === 0 ? (
                      <p className="text-sm text-neutral-400 dark:text-neutral-600">No {section.label.toLowerCase()} entries for this day.</p>
                    ) : (
                      <ul className="space-y-2">
                        {sectionItems.map(item => (
                          <li key={item.id}>
                            <article className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                {item.item_label && (
                                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                                    {item.item_label === 'created' ? 'Created on this date' : 'Updated on this date'}
                                  </span>
                                )}
                                {item.is_demo && (
                                  <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                    DEMO CONTENT
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                                <Link to={item.href} className="hover:text-blue-600 hover:underline dark:hover:text-blue-400">
                                  {item.title}
                                </Link>
                              </h4>
                              {item.summary && (
                                <p className="mt-1 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">{item.summary}</p>
                              )}
                              <Link to={item.href} className="mt-3 inline-block text-xs font-medium text-blue-700 hover:underline dark:text-blue-400">
                                {item.content_type === 'blog' ? 'Read article' : item.content_type === 'project' ? 'View project' : item.content_type === 'journey' ? 'View journey' : 'View journal'}
                              </Link>
                            </article>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
