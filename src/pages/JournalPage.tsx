import { useState, useMemo } from 'react'
import { BookOpen, ChevronDown, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { publicApi, type ApiDailyLog } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'

function EntryCard({ entry }: { entry: ApiDailyLog }) {
  const [expanded, setExpanded] = useState(false)
  const hasExtra = entry.lessons_learned || entry.challenges || entry.next_steps

  const dateLabel = new Date(entry.activity_date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <article className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <time
          dateTime={entry.activity_date}
          className="text-xs font-mono text-neutral-400 dark:text-neutral-500"
        >
          {dateLabel}
        </time>
        {entry.minutes_worked != null && (
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-600">
            {entry.minutes_worked}m
          </span>
        )}
      </div>

      <div className="mb-3">
        <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-1">Summary</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {entry.summary}
        </p>
      </div>

      {entry.work_completed && (
        <div className="mb-3">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-1">Worked on</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {entry.work_completed}
          </p>
        </div>
      )}

      {hasExtra && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              {entry.lessons_learned && (
                <div>
                  <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-1">Learned</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{entry.lessons_learned}</p>
                </div>
              )}
              {entry.challenges && (
                <div>
                  <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-1">Challenges</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{entry.challenges}</p>
                </div>
              )}
              {entry.next_steps && (
                <div>
                  <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-1">Next steps</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{entry.next_steps}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export default function JournalPage() {
  const [monthFilter, setMonthFilter] = useState<string>('all')

  const { data, loading } = usePublicFetch(() => publicApi.journal.list({ limit: 50 }))

  const entries = data?.data ?? []

  const months = useMemo(() => {
    const set = new Set(entries.map(e => e.activity_date.slice(0, 7)))
    return ['all', ...Array.from(set).sort().reverse()]
  }, [entries])

  const filtered = useMemo(() => {
    if (monthFilter === 'all') return entries
    return entries.filter(e => e.activity_date.startsWith(monthFilter))
  }, [entries, monthFilter])

  return (
    <>
      <PageMeta
        title="Journal | Prince Monga"
        description="Daily development journal by Prince Monga — what I worked on, learned, and figured out each day."
        slug="journal"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Journal
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xl">
          A daily log of what I'm working on, learning, and thinking about. Honest and
          unpolished — that's the point.
        </p>

        {loading && (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Loading journal…
          </div>
        )}

        {/* Month filter */}
        {!loading && months.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {months.map(m => (
              <button
                key={m}
                onClick={() => setMonthFilter(m)}
                aria-pressed={monthFilter === m}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  monthFilter === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {m === 'all'
                  ? 'All'
                  : new Date(m + '-01').toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                    })}
              </button>
            ))}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-10 flex flex-col items-center text-center gap-3">
            <BookOpen size={20} className="text-neutral-300 dark:text-neutral-700" aria-hidden="true" />
            <p className="text-sm text-neutral-400 dark:text-neutral-600">
              No public journal entries yet.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 max-w-xs">
              Daily work logs will appear here once they're published. Private entries are not shown.
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && entries.length > 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 py-8">
            No entries for this period.
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered
              .slice()
              .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
              .map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
          </div>
        )}
      </main>
    </>
  )
}
