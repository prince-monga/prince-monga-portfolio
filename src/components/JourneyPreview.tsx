import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { journey } from '../data/content'

// Show the 3 most recent milestones on the homepage
const preview = journey.slice(-3)

export default function JourneyPreview() {
  return (
    <section
      aria-labelledby="journey-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2
            id="journey-heading"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Journey
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Where I've been and where I'm headed.
          </p>
        </div>
        <Link
          to="/journey"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Full timeline <ArrowRight size={14} />
        </Link>
      </div>

      <ol className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3">
        {preview.map((milestone, i) => (
          <li key={milestone.id} className={`pl-6 relative ${i < preview.length - 1 ? 'pb-8' : ''}`}>
            <span
              aria-hidden="true"
              className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-950 ${
                milestone.tags?.includes('Current')
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            />

            <time className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
              {milestone.period}
            </time>

            <h3 className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {milestone.title}
            </h3>

            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl line-clamp-2">
              {milestone.description}
            </p>

            {milestone.tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {milestone.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      tag === 'Current'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Link
          to="/journey"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline sm:hidden"
        >
          Full timeline <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
