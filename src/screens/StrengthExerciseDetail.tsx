import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { HeaderDivider } from '../components/HeaderDivider'
import { RecentPRsList } from '../components/RecentPRsList'
import { StrengthGraph } from '../components/StrengthGraph'
import { buildExerciseSummaries, type ExerciseSummary } from '../lib/analytics'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type SetRow = { weight: number; reps: number }
type SessionRow = {
  date: string
  exercises:
    { exercise_db_id: string | null; name: string; sets: SetRow[] | null }[] | null
}

export function StrengthExerciseDetail() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { exerciseDbId } = useParams<{ exerciseDbId: string }>()

  const [exercise, setExercise] = useState<ExerciseSummary | null | undefined>(undefined)

  useEffect(() => {
    if (!user || !exerciseDbId) return
    let cancelled = false

    async function load() {
      const { data: sessionRows } = await supabase
        .from('workout_sessions')
        .select('date, exercises(exercise_db_id, name, sets(weight, reps))')
        .not('end_time', 'is', null)
        .order('date', { ascending: true })
      if (cancelled) return

      const sessions = (sessionRows ?? []) as SessionRow[]
      const { data: defRow } = await supabase
        .from('exercise_definitions')
        .select('id, primary_muscle')
        .eq('id', exerciseDbId)
        .maybeSingle()
      if (cancelled) return

      const primaryMuscleByDbId = new Map([
        [exerciseDbId as string, defRow?.primary_muscle ?? null],
      ])
      const summaries = buildExerciseSummaries(sessions, primaryMuscleByDbId)
      setExercise(summaries.find((e) => e.dbId === exerciseDbId) ?? null)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, exerciseDbId])

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/analytics/strength')}
            className="mb-1 text-sm font-medium text-graphite"
          >
            ← Strength Analytics
          </button>
          <h1 className="text-2xl font-bold text-ink">
            {exercise ? exercise.name : 'Exercise'}
          </h1>
        </div>
        <HeaderDivider />
      </div>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {exercise === undefined ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : exercise === null ? (
          <p className="text-sm text-graphite">No history found for this exercise.</p>
        ) : (
          <Card variant="filled">
            <StrengthGraph points={exercise.bestSets} />
            <RecentPRsList bestSets={exercise.bestSets} />
          </Card>
        )}
      </div>
    </div>
  )
}
