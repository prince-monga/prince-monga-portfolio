import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-400 dark:text-neutral-600">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={11} aria-hidden="true" />}
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-neutral-600 dark:text-neutral-400" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
