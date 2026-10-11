import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'

export default function DailyBuilding() {
  const { data } = usePublicFetch(() => publicApi.journal.list({ limit: 1 }))
  const latest = data?.data?.[0] ?? null

  const dateLabel = latest
    ? new Date(latest.activity_date).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : null

  return (
    <section
      aria-labelledby="building-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2
            id="building-heading"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Daily building
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            A running log of what I'm working on each day.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/journal"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Journal <ArrowRight size={14} />
          </Link>
          <Link
            to="/streak"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Streak <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {latest ? (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 max-w-2xl">
          <time
            dateTime={latest.activity_date}
            className="text-xs font-mono text-neutral-400 dark:text-neutral-500 block mb-2"
          >
            {dateLabel}
          </time>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {latest.summary}
          </p>
          {latest.work_completed && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {latest.work_completed}
            </p>
          )}
          <Link
            to="/journal"
            className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Full journal <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-8 max-w-2xl">
          <p className="text-sm text-neutral-400 dark:text-neutral-600 mb-1">
            No public entries yet.
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4">
            Daily work logs will appear here once published. No fabricated streaks.
          </p>
          <div className="flex gap-4">
            <Link to="/journal" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View journal →
            </Link>
            <Link to="/streak" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View streak →
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
