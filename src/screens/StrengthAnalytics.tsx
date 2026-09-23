import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Chip } from '../components/Chip'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconChevronRight } from '../components/icons'
import {
  buildExerciseSummaries,
  computeImprovement,
  type ExerciseSummary,
} from '../lib/analytics'
import { fromISODate } from '../lib/date'
import { categoryFor, type BodyCategory } from '../lib/muscleGroups'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type SetRow = { weight: number; reps: number }
type SessionRow = {
  date: string
  exercises:
    { exercise_db_id: string | null; name: string; sets: SetRow[] | null }[] | null
}

const CATEGORY_FILTERS: ('All' | BodyCategory)[] = [
  'All',
  'Upper Body',
  'Lower Body',
  'Core',
  'Other',
]

export function StrengthAnalytics() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [exercises, setExercises] = useState<ExerciseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('All')

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const { data: sessionRows } = await supabase
        .from('workout_sessions')
        .select('date, exercises(exercise_db_id, name, sets(weight, reps))')
        .not('end_time', 'is', null)
        .order('date', { ascending: true })
      if (cancelled) return

      const sessions = (sessionRows ?? []) as SessionRow[]
      const dbIds = [
        ...new Set(
          sessions.flatMap((s) =>
            (s.exercises ?? [])
              .map((e) => e.exercise_db_id)
              .filter((v): v is string => Boolean(v)),
          ),
        ),
      ]
      let primaryMuscleByDbId = new Map<string, string | null>()
      if (dbIds.length > 0) {
        const { data: defRows } = await supabase
          .from('exercise_definitions')
          .select('id, primary_muscle')
          .in('id', dbIds)
        if (cancelled) return
        primaryMuscleByDbId = new Map(
          (defRows ?? []).map((d) => [d.id, d.primary_muscle]),
        )
      }

      setExercises(buildExerciseSummaries(sessions, primaryMuscleByDbId))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const filtered = useMemo(() => {
    if (category === 'All') return exercises
    return exercises.filter((e) => categoryFor(e.muscleGroup) === category)
  }, [exercises, category])

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Strength Analytics</h1>
        </div>
        <HeaderDivider />
      </div>

      <div className="space-y-4 px-6 pb-6 pt-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((c) => (
            <Chip
              key={c}
              variant="filter"
              selected={category === c}
              onClick={() => setCategory(c)}
              className="cursor-pointer whitespace-nowrap"
            >
              {c}
            </Chip>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-graphite">
            No exercises logged in this category yet.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const improvement = computeImprovement(e.bestSets, null)
              const best = e.bestSets.reduce(
                (max, p) => (p.e1rm > max.e1rm ? p : max),
                e.bestSets[0],
              )
              const lastPerformed = e.bestSets[e.bestSets.length - 1]
              return (
                <Card
                  key={e.dbId}
                  onClick={() => navigate(`/analytics/strength/${e.dbId}`)}
                  className="cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-ink">
                      {e.name}
                    </p>
                    <IconChevronRight className="h-4 w-4 shrink-0 text-graphite" />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-graphite">
                    <p>
                      Improvement:{' '}
                      <span className="font-medium text-ink">
                        {improvement
                          ? `${improvement.pct >= 0 ? '+' : ''}${improvement.pct.toFixed(1)}%`
                          : '—'}
                      </span>
                    </p>
                    <p>
                      Best:{' '}
                      <span className="font-medium text-ink">
                        {Math.round(best.weight)} kg × {best.reps}
                      </span>
                    </p>
                    <p>
                      Last PR:{' '}
                      <span className="font-medium text-ink">
                        {fromISODate(best.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                    <p>
                      Last performed:{' '}
                      <span className="font-medium text-ink">
                        {lastPerformed
                          ? fromISODate(lastPerformed.date).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )
                          : '—'}
                      </span>
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
