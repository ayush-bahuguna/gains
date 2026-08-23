import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { IconDumbbell, IconNotebook } from '../components/icons'
import { ListCard } from '../components/ListCard'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type SessionRow = {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string | null
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export function JournalHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [unfinished, setUnfinished] = useState<SessionRow | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const [{ data: unfinishedRows }, { data: recentRows }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, name, date, start_time, end_time')
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1),
        supabase
          .from('workout_sessions')
          .select('id, name, date, start_time, end_time')
          .not('end_time', 'is', null)
          .order('start_time', { ascending: false })
          .limit(3),
      ])

      if (cancelled) return
      setUnfinished(unfinishedRows?.[0] ?? null)
      setRecentSessions(recentRows ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function startSession() {
    if (!user || starting) return
    setStarting(true)
    const { data, error } = await supabase.from('workout_sessions').insert({}).select().single()
    setStarting(false)
    if (error || !data) return
    navigate(`/session/${data.id}`)
  }

  const greetingName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6 p-6">
      <Card>
        <p className="text-xs text-graphite">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          Good {timeOfDay()}, {greetingName}
        </h1>
        <p className="mt-1 text-sm text-graphite">Ready to get stronger today?</p>
      </Card>

      <div className="space-y-3">
        <Button variant="primary" className="w-full" onClick={startSession} disabled={starting}>
          {starting ? 'Starting...' : 'Start Session'}
        </Button>
        {unfinished && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/session/${unfinished.id}`)}
          >
            Resume "{unfinished.name}"
          </Button>
        )}
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent Templates</h2>
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="text-xs text-graphite underline"
          >
            View all
          </button>
        </div>
        <EmptyState
          icon={<IconDumbbell className="h-6 w-6" />}
          title="No templates yet"
          subtitle="Create one to speed up logging"
          actionLabel="View Templates"
          onAction={() => navigate('/templates')}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent Sessions</h2>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="text-xs text-graphite underline"
          >
            View all
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : recentSessions.length === 0 ? (
          <EmptyState
            icon={<IconNotebook className="h-6 w-6" />}
            title="No sessions yet"
            subtitle="Start your first workout"
            actionLabel="Start Session"
            onAction={startSession}
          />
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <ListCard
                key={s.id}
                icon={<IconNotebook className="h-5 w-5" />}
                title={s.name}
                subtitle={new Date(s.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
