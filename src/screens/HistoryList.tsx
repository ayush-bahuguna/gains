import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { IconNotebook } from '../components/icons'
import { ListCard } from '../components/ListCard'
import { supabase } from '../lib/supabase'

type FilterKey = 'all' | 'week' | 'month'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Sessions' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
]

type SessionRow = {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string
  exerciseCount: number
}

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function isoDateDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function HistoryList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      let query = supabase
        .from('workout_sessions')
        .select('id, name, date, start_time, end_time, exercises(count)')
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false })

      if (filter === 'week') query = query.gte('date', isoDateDaysAgo(7))
      if (filter === 'month') query = query.gte('date', isoDateDaysAgo(30))

      const { data } = await query
      if (cancelled) return

      setSessions(
        (data ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time as string,
          exerciseCount: (s.exercises as { count: number }[] | null)?.[0]?.count ?? 0,
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filter])

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-ink">History</h1>

      <div className="flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <Chip
            key={f.key}
            variant="filter"
            selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className="cursor-pointer whitespace-nowrap"
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-graphite">Loading...</p>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<IconNotebook className="h-6 w-6" />}
          title="No history yet"
          subtitle="Your past workouts will appear here"
          actionLabel="Start Session"
          onAction={() => navigate('/journal')}
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const durationMs = new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
            const dateLabel = new Date(s.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
            return (
              <ListCard
                key={s.id}
                icon={<IconNotebook className="h-5 w-5" />}
                title={s.name}
                subtitle={`${dateLabel} · ${formatDuration(durationMs)} · ${s.exerciseCount} exercises`}
                onClick={() => navigate(`/history/${s.id}`)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
