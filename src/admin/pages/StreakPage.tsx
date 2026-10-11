import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { stats as statsApi, journal as journalApi } from '../api'
import { useFetch } from '../hooks/useFetch'
import { PageHeader, StatCard, LoadingState, ErrorState, Button } from '../components/ui'

// Build a 52-week contribution grid (364 days back from today)
function buildGrid(dates: Set<string>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the most recent Sunday 52 weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - 363)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  const weeks: { date: string; active: boolean }[][] = []
  let current = new Date(start)

  while (current <= today) {
    const week: { date: string; active: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const iso = current.toISOString().slice(0, 10)
      week.push({ date: iso, active: dates.has(iso) })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function StreakPage() {
  const navigate = useNavigate()
  const { data: statsData, loading: statsLoading, error: statsError } = useFetch(() => statsApi.get())
  // Fetch all logs (up to 365) to build the grid
  const { data: logsData, loading: logsLoading, error: logsError } = useFetch(
    () => journalApi.list(1, 50)
  )

  const activeDates = useMemo(() => {
    const set = new Set<string>()
    logsData?.data.forEach(l => set.add(l.activity_date))
    return set
  }, [logsData])

  const grid = useMemo(() => buildGrid(activeDates), [activeDates])

  if (statsLoading || logsLoading) return <LoadingState />
  if (statsError || logsError) return <ErrorState message={statsError ?? logsError ?? 'Failed to load'} />

  const s = statsData?.data

  return (
    <div>
      <PageHeader
        title="Streak Tracker"
        description="Calculated from saved journal entries"
        action={
          <Button size="sm" onClick={() => navigate('/admin/journal')}>
            Log today's work
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Current streak" value={`${s?.journal.streak ?? 0} days`} />
        <StatCard label="Longest streak" value={`${s?.journal.longestStreak ?? 0} days`} />
        <StatCard label="Total active days" value={activeDates.size} />
        <StatCard label="Journal entries" value={s?.journal.total ?? 0} />
      </div>

      {/* Contribution grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 overflow-x-auto">
        <h2 className="text-sm font-medium text-neutral-300 mb-4">Activity — last 52 weeks</h2>

        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-0">
          {grid.map((week, wi) => {
            const firstDay = week.find(d => d.date)
            if (!firstDay) return <div key={wi} className="w-[11px]" />
            const d = new Date(firstDay.date)
            const isFirstWeekOfMonth = d.getDate() <= 7
            return (
              <div key={wi} className="w-[11px] text-[9px] text-neutral-600 text-center">
                {isFirstWeekOfMonth ? MONTHS[d.getMonth()] : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-[3px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(day => (
                <div
                  key={day.date}
                  title={`${day.date}${day.active ? ' ✓' : ''}`}
                  className={`w-[11px] h-[11px] rounded-sm transition-colors ${
                    day.active
                      ? 'bg-blue-500 hover:bg-blue-400'
                      : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-600">
          <span>Less</span>
          <div className="w-[11px] h-[11px] rounded-sm bg-neutral-800" />
          <div className="w-[11px] h-[11px] rounded-sm bg-blue-800" />
          <div className="w-[11px] h-[11px] rounded-sm bg-blue-600" />
          <div className="w-[11px] h-[11px] rounded-sm bg-blue-400" />
          <span>More</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-600">
        Streak rule: consecutive calendar days with at least one journal entry. Timezone: server local time.
      </p>
    </div>
  )
}
