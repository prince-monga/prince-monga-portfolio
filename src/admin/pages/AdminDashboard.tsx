import { FolderKanban, FileText, Inbox, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { stats } from '../api'
import { useFetch } from '../hooks/useFetch'
import { PageHeader, StatCard, LoadingState, ErrorState } from '../components/ui'

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useFetch(() => stats.get())

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refetch} />

  const s = data?.data

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your site content"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Projects"
          value={s?.projects.total ?? '—'}
          sub={`${s?.projects.published ?? 0} published · ${s?.projects.draft ?? 0} draft`}
        />
        <StatCard
          label="Blog posts"
          value={s?.blog.total ?? '—'}
          sub={`${s?.blog.published ?? 0} published · ${s?.blog.draft ?? 0} draft`}
        />
        <StatCard
          label="Inquiries"
          value={s?.inquiries.total ?? '—'}
          sub={`${s?.inquiries.unread ?? 0} unread`}
        />
        <StatCard
          label="Current streak"
          value={s?.journal.streak ?? '—'}
          sub={`Longest: ${s?.journal.longestStreak ?? 0} days`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FolderKanban, label: 'Manage Projects', href: '/admin/projects', color: 'text-blue-400' },
          { icon: FileText, label: 'Manage Blog', href: '/admin/blog', color: 'text-purple-400' },
          { icon: Inbox, label: 'View Inquiries', href: '/admin/inquiries', color: 'text-yellow-400' },
          { icon: Flame, label: 'Streak Tracker', href: '/admin/streak', color: 'text-orange-400' },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link
            key={href}
            to={href}
            className="interactive-card surface-card rounded-xl p-4 flex items-center gap-3"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/70 ${color}`}>
              <Icon size={19} />
            </span>
            <span className="text-sm font-medium text-neutral-200">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
