import { Link } from 'react-router-dom'
import { GraduationCap, Briefcase, BookOpen, Star, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { publicApi, type ApiJourneyEvent } from '../lib/publicApi'
import { journey as staticJourney } from '../data/content'
import { usePublicFetch } from '../hooks/usePublicFetch'

type Category = 'education' | 'experience' | 'learning' | 'milestone'

const typeIcon: Record<Category, React.ReactNode> = {
  education: <GraduationCap size={13} />,
  experience: <Briefcase size={13} />,
  learning: <BookOpen size={13} />,
  milestone: <Star size={13} />,
}

const typeLabel: Record<Category, string> = {
  education: 'Education',
  experience: 'Experience',
  learning: 'Learning',
  milestone: 'Milestone',
}

function formatEventDate(dateStr: string) {
  // event_date is YYYY-MM-DD
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
}

interface DisplayEvent {
  id: string
  date: string
  title: string
  description: string
  category: Category
  isCurrent?: boolean
}

function fromApi(e: ApiJourneyEvent): DisplayEvent {
  return {
    id: String(e.id),
    date: formatEventDate(e.event_date),
    title: e.title,
    description: e.description,
    category: e.category as Category,
  }
}

export default function JourneyPage() {
  const { data, loading } = usePublicFetch(() => publicApi.journey.list())

  const events: DisplayEvent[] = (() => {
    if (data?.data && data.data.length > 0) {
      return data.data.map(fromApi)
    }
    // Static fallback
    return staticJourney.map(m => ({
      id: m.id,
      date: m.period,
      title: m.title,
      description: m.description,
      category: m.type as Category,
      isCurrent: m.tags?.includes('Current'),
    }))
  })()

  return (
    <>
      <PageMeta
        title="Journey | Prince Monga"
        description="Prince Monga's journey — BCA at CDLU, web development internship at Podosphere Technologies, MCA in Cyber Security at LPU, and ongoing projects."
        slug="journey"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          My journey
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10 max-w-xl">
          A chronological record of my education, work experience, and ongoing learning — from
          BCA at CDLU to an MCA in Cyber Security, and everything built along the way.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
          {(Object.keys(typeLabel) as Category[]).map(type => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"
            >
              <span className="text-blue-600 dark:text-blue-400">{typeIcon[type]}</span>
              {typeLabel[type]}
            </span>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Loading timeline…
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <ol className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3">
            {events.map((ev, i) => {
              const cat = typeIcon[ev.category] ? ev.category : 'learning'
              return (
                <li
                  key={ev.id}
                  className={`pl-7 relative ${i < events.length - 1 ? 'pb-10' : ''}`}
                >
                  {/* Dot */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-950 ${
                      ev.isCurrent
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  />

                  {/* Type badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      {typeIcon[cat as Category]}
                      {typeLabel[cat as Category]}
                    </span>
                    {ev.isCurrent && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        Current
                      </span>
                    )}
                  </div>

                  <time className="text-xs font-mono text-neutral-400 dark:text-neutral-500 block mb-1">
                    {ev.date}
                  </time>

                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug mb-2">
                    {ev.title}
                  </h2>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                    {ev.description}
                  </p>
                </li>
              )
            })}
          </ol>
        )}

        {!loading && events.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 py-8">
            No journey events yet.
          </p>
        )}

        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-4">
          <Link to="/about" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            More about me →
          </Link>
          <Link to="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            See my projects →
          </Link>
        </div>
      </main>
    </>
  )
}
