import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { NotesBox } from '../components/NotesBox'
import { SetTable } from '../components/SetTable'
import { supabase } from '../lib/supabase'

type SessionData = {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string | null
  notes: string
  motivation_gif_url: string | null
  motivation_quote: string | null
}

type SetData = { weight: number; reps: number }
type ExerciseData = {
  id: string
  name: string
  exercise_db_id: string | null
  sets: SetData[]
}

function epley1RM(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}

function bestEpley(sets: SetData[]) {
  return sets.reduce((max, s) => Math.max(max, epley1RM(s.weight, s.reps)), 0)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-1 py-4 text-center">
      <span className="text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs text-graphite">{label}</span>
    </Card>
  )
}

export function SessionSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionData | null>(null)
  const [exercises, setExercises] = useState<ExerciseData[]>([])
  const [historicalMax, setHistoricalMax] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [repeating, setRepeating] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      const [{ data: sessionRow }, { data: exerciseRows }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, name, date, start_time, end_time, notes, motivation_gif_url, motivation_quote')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('exercises')
          .select('id, name, exercise_db_id, position, sets(weight, reps)')
          .eq('session_id', id)
          .order('position', { ascending: true }),
      ])

      if (cancelled) return

      if (!sessionRow) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!sessionRow.end_time) {
        navigate(`/session/${id}`, { replace: true })
        return
      }

      setSession(sessionRow)
      setNotesDraft(sessionRow.notes)
      const ex: ExerciseData[] = (exerciseRows ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        exercise_db_id: e.exercise_db_id,
        sets: e.sets ?? [],
      }))
      setExercises(ex)

      const dbIds = [...new Set(ex.map((e) => e.exercise_db_id).filter((v): v is string => Boolean(v)))]
      if (dbIds.length > 0) {
        const { data: historicalRows } = await supabase
          .from('exercises')
          .select('exercise_db_id, sets(weight, reps)')
          .in('exercise_db_id', dbIds)
          .neq('session_id', id)

        if (!cancelled) {
          const maxMap = new Map<string, number>()
          for (const row of historicalRows ?? []) {
            const dbId = row.exercise_db_id as string
            const best = bestEpley(row.sets ?? [])
            maxMap.set(dbId, Math.max(maxMap.get(dbId) ?? 0, best))
          }
          setHistoricalMax(maxMap)
        }
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const stats = useMemo(() => {
    const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0)
    const totalVolume = exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0,
    )
    const prCount = exercises.filter((e) => {
      if (!e.exercise_db_id) return false
      const historical = historicalMax.get(e.exercise_db_id) ?? 0
      return historical > 0 && bestEpley(e.sets) > historical
    }).length
    return { totalExercises: exercises.length, totalSets, totalVolume, prCount }
  }, [exercises, historicalMax])

  function commitNotes() {
    if (!session) return
    supabase.from('workout_sessions').update({ notes: notesDraft }).eq('id', session.id).then()
  }

  async function repeatWorkout() {
    if (!session || repeating) return
    setRepeating(true)
    const { data: newSession, error } = await supabase
      .from('workout_sessions')
      .insert({ name: session.name })
      .select()
      .single()
    if (error || !newSession) {
      setRepeating(false)
      return
    }
    if (exercises.length > 0) {
      await supabase.from('exercises').insert(
        exercises.map((e, i) => ({
          session_id: newSession.id,
          exercise_db_id: e.exercise_db_id,
          name: e.name,
          position: i,
        })),
      )
    }
    navigate(`/session/${newSession.id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (notFound || !session || !session.end_time) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-graphite">Session not found.</p>
        <Button variant="secondary" onClick={() => navigate('/journal')}>
          Back to Journal
        </Button>
      </div>
    )
  }

  const endTime = session.end_time
  const durationMs = new Date(endTime).getTime() - new Date(session.start_time).getTime()

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <span className="text-3xl">⭐</span>
        <h1 className="text-2xl font-bold text-ink">Session Completed</h1>
        <p className="text-sm text-graphite">Great work!</p>
      </div>

      <Card>
        <p className="text-xl font-bold text-ink">{session.name}</p>
        <p className="mt-1 text-xs text-graphite">
          {new Date(session.date).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-ink">
            {formatTime(session.start_time)} – {formatTime(endTime)}
          </span>
          <span
            className="rounded-full px-3 py-1 text-sm font-bold text-ink"
            style={{ backgroundColor: 'var(--color-sage)' }}
          >
            {formatDuration(durationMs)}
          </span>
        </div>
        {session.motivation_gif_url && (
          <div className="mt-3">
            <img
              src={session.motivation_gif_url}
              alt=""
              className="w-full rounded-2xl border border-ink/10 object-cover"
            />
            {session.motivation_quote && (
              <p className="mt-2 text-sm italic text-graphite">"{session.motivation_quote}"</p>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Exercises" value={stats.totalExercises} />
        <StatTile label="Total Sets" value={stats.totalSets} />
        <StatTile label="Total Volume (kg)" value={Math.round(stats.totalVolume)} />
        <StatTile label="Personal Records" value={stats.prCount} />
      </div>

      <div className="space-y-4">
        {exercises.map((e) => {
          const best = bestEpley(e.sets)
          const historical = e.exercise_db_id ? (historicalMax.get(e.exercise_db_id) ?? 0) : 0
          const isPR = historical > 0 && best > historical
          return (
            <Card key={e.id}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-lg font-bold text-ink">{e.name}</h3>
                {isPR && (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-ink"
                    style={{ backgroundColor: 'var(--color-sun)' }}
                  >
                    🏆 PR
                  </span>
                )}
              </div>
              <div className="mt-2">
                <SetTable sets={e.sets.map((s, i) => ({ setNumber: i + 1, ...s }))} />
              </div>
              {best > 0 && <p className="mt-2 text-xs text-graphite">Est. 1RM: {Math.round(best)} kg</p>}
            </Card>
          )
        })}
      </div>

      <NotesBox
        placeholder="No notes"
        value={notesDraft}
        onChange={(e) => setNotesDraft(e.target.value)}
        onBlur={commitNotes}
        defaultExpanded
        bordered={false}
      />

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => navigate('/journal')}>
          Done
        </Button>
        <Button variant="primary" className="flex-1" onClick={repeatWorkout} disabled={repeating}>
          {repeating ? 'Creating...' : 'Repeat This Workout'}
        </Button>
      </div>
    </div>
  )
}
