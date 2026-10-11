import { useMemo, useState } from 'react'
import { Info, Plus } from 'lucide-react'
import { stats as statsApi, journal as journalApi, type DailyLog } from '../api'
import { useFetch } from '../hooks/useFetch'
import {
  PageHeader, StatCard, LoadingState, ErrorState, Button, Modal, Field,
  Input, Textarea, Select, Alert,
} from '../components/ui'

const LOGS_PER_PAGE = 50
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getGridStartDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - 363)
  start.setDate(start.getDate() - start.getDay())
  return start
}

async function fetchGridLogs(): Promise<DailyLog[]> {
  const startDate = dateKey(getGridStartDate())
  const logs: DailyLog[] = []
  let page = 1

  while (true) {
    const response = await journalApi.list(page, LOGS_PER_PAGE)
    logs.push(...response.data.filter(log => log.activity_date >= startDate))

    const lastLog = response.data[response.data.length - 1]
    if (
      !lastLog ||
      lastLog.activity_date < startDate ||
      page >= response.pagination.totalPages
    ) {
      return logs
    }
    page++
  }
}

function buildGrid(dates: Set<string>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const current = getGridStartDate()
  const weeks: { date: string; active: boolean; future: boolean }[][] = []

  while (current <= today) {
    const week: { date: string; active: boolean; future: boolean }[] = []
    for (let day = 0; day < 7; day++) {
      const key = dateKey(current)
      week.push({ date: key, active: dates.has(key), future: current > today })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

const newLog = (activityDate: string): Partial<DailyLog> => ({
  activity_date: activityDate,
  summary: '',
  work_completed: '',
  lessons_learned: '',
  challenges: '',
  next_steps: '',
  minutes_worked: undefined,
  visibility: 'private',
})

export default function StreakPage() {
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } =
    useFetch(() => statsApi.get())
  const { data: logs, loading: logsLoading, error: logsError, refetch: refetchLogs } =
    useFetch(fetchGridLogs)

  const [editing, setEditing] = useState<Partial<DailyLog> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [calendarHelpOpen, setCalendarHelpOpen] = useState(false)

  const logsByDate = useMemo(
    () => new Map((logs ?? []).map(log => [log.activity_date, log])),
    [logs]
  )
  const activeDates = useMemo(() => new Set(logsByDate.keys()), [logsByDate])
  const grid = useMemo(() => buildGrid(activeDates), [activeDates])

  function openNew(activityDate = dateKey(new Date())) {
    setEditing(newLog(activityDate))
    setIsNew(true)
    setFormError(null)
    setSaveNotice(null)
  }

  function openEdit(log: DailyLog) {
    setEditing({ ...log })
    setIsNew(false)
    setFormError(null)
    setSaveNotice(null)
  }

  function closeModal() {
    if (saving) return
    setEditing(null)
    setFormError(null)
  }

  async function handleSave() {
    if (!editing) return
    if (!editing.activity_date || !editing.summary?.trim()) {
      setFormError('Date and summary are required.')
      return
    }

    setFormError(null)
    setSaving(true)
    const payload = {
      activity_date: editing.activity_date,
      summary: editing.summary.trim(),
      work_completed: editing.work_completed ?? '',
      lessons_learned: editing.lessons_learned ?? '',
      challenges: editing.challenges ?? '',
      next_steps: editing.next_steps ?? '',
      minutes_worked: editing.minutes_worked ?? undefined,
      visibility: editing.visibility ?? 'private',
    }

    try {
      if (isNew) {
        await journalApi.create(payload)
      } else if (editing.id != null) {
        await journalApi.update(editing.id, payload)
      } else {
        throw new Error('Cannot update an activity without its record ID.')
      }

      setEditing(null)
      setSaveNotice(isNew ? 'Activity saved.' : 'Activity updated.')
      await Promise.all([refetchLogs(), refetchStats()])
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save activity.')
    } finally {
      setSaving(false)
    }
  }

  function setField<K extends keyof DailyLog>(field: K, value: DailyLog[K]) {
    setEditing(current => current ? { ...current, [field]: value } : current)
  }

  if (statsLoading || logsLoading) return <LoadingState />
  if (statsError || logsError) {
    return <ErrorState message={statsError ?? logsError ?? 'Failed to load'} onRetry={() => {
      void Promise.all([refetchLogs(), refetchStats()])
    }} />
  }

  const stats = statsData?.data
  const today = dateKey(new Date())
  const todayLog = logsByDate.get(today)

  return (
    <div className="min-w-0">
      <PageHeader
        title="Streak Tracker"
        description="Manage daily activity and track saved journal entries."
        action={
          <Button size="sm" onClick={() => todayLog ? openEdit(todayLog) : openNew(today)}>
            <Plus size={14} />
            {todayLog ? "Edit today's activity" : 'Log today'}
          </Button>
        }
      />

      {saveNotice && (
        <p role="status" className="mb-4 text-sm text-green-400">{saveNotice}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Current streak" value={`${stats?.journal.streak ?? 0} days`} />
        <StatCard label="Longest streak" value={`${stats?.journal.longestStreak ?? 0} days`} />
        <StatCard label="Active days shown" value={activeDates.size} />
        <StatCard label="Journal entries" value={stats?.journal.total ?? 0} />
      </div>

      <section className="relative z-10 min-w-0 rounded-lg border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <div
          className="group/calendar-help relative mb-4 flex items-center gap-2"
          onMouseEnter={() => setCalendarHelpOpen(true)}
          onMouseLeave={event => {
            if (!event.currentTarget.contains(document.activeElement)) {
              setCalendarHelpOpen(false)
            }
          }}
        >
          <h2 className="text-sm font-medium text-neutral-300">
            Activity — last 52 weeks
          </h2>
          <button
            type="button"
            aria-label="About the streak calendar"
            aria-expanded={calendarHelpOpen}
            aria-controls="streak-calendar-help"
            aria-describedby="streak-calendar-help"
            onClick={() => setCalendarHelpOpen(true)}
            onFocus={() => setCalendarHelpOpen(true)}
            onBlur={() => setCalendarHelpOpen(false)}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                setCalendarHelpOpen(false)
                event.currentTarget.blur()
              }
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-neutral-800 hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            <Info size={16} aria-hidden="true" />
          </button>
          <div
            id="streak-calendar-help"
            role="tooltip"
            className={`pointer-events-none absolute right-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-neutral-700 bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-200 shadow-xl ${
              calendarHelpOpen ? 'block' : 'hidden'
            }`}
          >
            Each column is a week, with days running Sunday to Saturday. Select any past or current day to add or edit activity. Blue marks public activity; violet marks private activity.
          </div>
        </div>
        <p className="mb-4 text-xs text-neutral-500">
          Select a day to add or edit its activity. Blue is public; violet is private.
        </p>

        <div className="streak-calendar-scroll max-w-full overflow-x-auto overscroll-x-contain pb-2">
          <div className="w-max">
            <div className="mb-1 flex gap-px">
              <div className="w-6 shrink-0 xl:w-[18px]" aria-hidden="true" />
              {grid.map((week, weekIndex) => {
                const firstDay = week[0]
                const date = new Date(`${firstDay.date}T12:00:00`)
                const isFirstWeekOfMonth = date.getDate() <= 7
                return (
                  <div
                    key={weekIndex}
                    className="w-6 shrink-0 text-center text-[9px] text-neutral-600 xl:w-[18px]"
                  >
                    {isFirstWeekOfMonth ? MONTHS[date.getMonth()] : ''}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-px" aria-label="Daily activity calendar">
              <div className="flex w-6 shrink-0 flex-col gap-1 text-[9px] leading-6 text-neutral-600 xl:w-[18px] xl:leading-5" aria-hidden="true">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, dayIndex) => (
                  <span key={dayIndex} className="h-6 xl:h-5">
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex gap-px">
                {grid.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex w-6 shrink-0 flex-col gap-1 xl:w-[18px]">
                    {week.map(day => {
                      const log = logsByDate.get(day.date)
                      const description = log
                        ? `${day.date}: ${log.visibility} activity — ${log.summary}`
                        : `${day.date}: no activity; select to add one`
                      return (
                        <button
                          key={day.date}
                          type="button"
                          disabled={day.future}
                          aria-label={description}
                          title={description}
                          onClick={() => log ? openEdit(log) : openNew(day.date)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-default xl:h-5 xl:w-[18px]"
                        >
                          <span className={`h-3.5 w-3.5 rounded-sm transition-colors xl:h-3 xl:w-3 ${
                            log
                              ? log.visibility === 'public'
                                ? 'bg-blue-500 hover:bg-blue-400'
                                : 'bg-violet-600 hover:bg-violet-500'
                              : day.future
                                ? 'bg-transparent'
                                : 'bg-neutral-800 hover:bg-neutral-700'
                          }`} />
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-600 xl:hidden">
          Scroll within the calendar to view all weeks.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>No activity</span>
          <span className="h-3 w-3 rounded-sm bg-neutral-800" aria-hidden="true" />
          <span>Public</span>
          <span className="h-3 w-3 rounded-sm bg-blue-500" aria-hidden="true" />
          <span>Private</span>
          <span className="h-3 w-3 rounded-sm bg-violet-600" aria-hidden="true" />
        </div>
      </section>

      <p className="mt-3 text-xs text-neutral-600">
        Streak rule: consecutive calendar days with at least one journal entry. Totals include private entries visible only to admins.
      </p>

      {editing && (
        <Modal
          title={isNew ? 'New daily activity' : 'Edit daily activity'}
          onClose={closeModal}
        >
          <div className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date" required>
                <Input
                  type="date"
                  value={editing.activity_date ?? ''}
                  onChange={event => setField('activity_date', event.target.value)}
                  required
                />
              </Field>
              <Field label="Minutes worked">
                <Input
                  type="number"
                  min={0}
                  max={1440}
                  value={editing.minutes_worked ?? ''}
                  onChange={event => setField(
                    'minutes_worked',
                    event.target.value ? Number(event.target.value) : null
                  )}
                  placeholder="e.g. 120"
                />
              </Field>
            </div>

            <Field label="Summary" required hint="A short overview of the day's activity.">
              <Input
                value={editing.summary ?? ''}
                onChange={event => setField('summary', event.target.value)}
                maxLength={500}
                required
              />
            </Field>

            <Field label="Tasks completed">
              <Textarea
                value={editing.work_completed ?? ''}
                onChange={event => setField('work_completed', event.target.value)}
                rows={3}
                placeholder="What did you work on?"
              />
            </Field>

            <Field label="Topics learned">
              <Textarea
                value={editing.lessons_learned ?? ''}
                onChange={event => setField('lessons_learned', event.target.value)}
                rows={2}
                placeholder="What did you learn?"
              />
            </Field>

            <Field label="Challenges">
              <Textarea
                value={editing.challenges ?? ''}
                onChange={event => setField('challenges', event.target.value)}
                rows={2}
              />
            </Field>

            <Field label="Next steps">
              <Textarea
                value={editing.next_steps ?? ''}
                onChange={event => setField('next_steps', event.target.value)}
                rows={2}
              />
            </Field>

            <Field label="Publication visibility" hint="Private entries are not included in public activity responses.">
              <Select
                value={editing.visibility ?? 'private'}
                onChange={event => setField('visibility', event.target.value)}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
            </Field>

            <p className="text-xs text-neutral-500">
              Related projects are not supported by the current daily-log database schema.
            </p>

            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-neutral-800">
              <Button variant="secondary" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving}>
                {isNew ? 'Create activity' : 'Save changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
