import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { IconBox } from '../components/IconBox'
import { IconDumbbell, IconNotebook, IconSearch } from '../components/icons'
import { ListCard } from '../components/ListCard'
import { MotivationGif } from '../components/MotivationGif'
import { TemplateCard } from '../components/TemplateCard'
import { getDailyMotivation, type DailyMotivation } from '../lib/dailyMotivation'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type SessionRow = {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string | null
}

type TemplateRow = {
  id: string
  name: string
  description: string
  exerciseCount: number
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

export function JournalHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [unfinished, setUnfinished] = useState<SessionRow | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionRow[]>([])
  const [recentTemplates, setRecentTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null)

  useEffect(() => {
    let cancelled = false
    getDailyMotivation().then((m) => {
      if (!cancelled) setMotivation(m)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const [{ data: unfinishedRows }, { data: recentRows }, { data: templateRows }] = await Promise.all([
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
        supabase
          .from('templates')
          .select('id, name, description, template_exercises(id)')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      if (cancelled) return
      setUnfinished(unfinishedRows?.[0] ?? null)
      setRecentSessions(recentRows ?? [])
      setRecentTemplates(
        (templateRows ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          exerciseCount: (t.template_exercises ?? []).length,
        })),
      )
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
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        motivation_gif_url: motivation?.gifUrl ?? null,
        motivation_quote: motivation?.quote ?? null,
      })
      .select()
      .single()
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
        {motivation && (
          <div className="mt-3">
            <MotivationGif motivation={motivation} onChange={setMotivation} />
            <p className="mt-2 text-sm italic text-graphite">"{motivation.quote}"</p>
          </div>
        )}
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
          <h2 className="text-lg font-bold text-ink">Recent Workouts</h2>
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="text-xs text-graphite underline"
          >
            View all
          </button>
        </div>
        {recentTemplates.length === 0 ? (
          <EmptyState
            icon={<IconDumbbell className="h-6 w-6" />}
            title="No workouts yet"
            subtitle="Create one to speed up logging"
            actionLabel="View Workouts"
            onAction={() => navigate('/templates')}
          />
        ) : (
          <div className="space-y-3">
            {recentTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                icon={<IconDumbbell className="h-4 w-4" />}
                title={t.name}
                description={t.description}
                exerciseCount={t.exerciseCount}
                onClick={() => navigate(`/templates/${t.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <Card onClick={() => navigate('/exercises')} className="cursor-pointer text-left">
        <div className="flex items-start gap-3">
          <IconBox icon={<IconSearch className="h-5 w-5" />} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Exercise Library</p>
            <p className="mt-1 text-xs text-graphite">
              Explore exercises, muscles, equipment and how to perform them.
            </p>
            <p className="mt-2 text-xs font-medium text-ink">Browse Exercises →</p>
          </div>
        </div>
      </Card>

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
                onClick={() => navigate(`/history/${s.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
