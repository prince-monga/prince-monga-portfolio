import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

const suggestions = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Writing' },
  { to: '/journey', label: 'Journey' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="Page not found | Prince Monga"
        description="This page doesn't exist. Head back to Prince Monga's website."
      />

      <main
        id="main-content"
        className="section-padding container-narrow py-24 flex flex-col items-start"
      >
        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">404</p>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed">
          This page doesn't exist or may have moved. Here are some places you might be looking
          for:
        </p>

        <nav aria-label="Suggested pages">
          <ul className="space-y-2" role="list">
            {suggestions.map(s => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {s.label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Back to home
        </Link>
      </main>
    </>
  )
}
