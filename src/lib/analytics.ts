import { toISODate } from './date'
import { muscleGroupFor } from './muscleGroups'
import { bestSetPerDate, type BestSetPoint } from './personalRecord'

export type Period = '30d' | 'all'

/** Inclusive lower bound (YYYY-MM-DD) for the selected period, or null for
 *  "all" (no lower bound). Local-timezone-safe — never Date#toISOString(). */
export function periodStartISO(period: Period, today: Date = new Date()): string | null {
  if (period === 'all') return null
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
  return toISODate(start)
}

export type ImprovementResult = { baseline: number; current: number; pct: number }

/**
 * v1 improvement algorithm (docs/Gains_Analytics_Spec.md, "Improvement Calculation"):
 * - baseline: best e1RM across the exercise's first 2-3 ever-logged sessions (all-time)
 * - current: best e1RM among points within the selected period
 * - pct: (current - baseline) / baseline * 100
 * Returns null when there's no baseline (fewer than 2 ever-logged sessions) or
 * no data within the selected period — both mean "not enough data to show a trend".
 */
export function computeImprovement(
  allTimePoints: { date: string; e1rm: number }[],
  periodStart: string | null,
): ImprovementResult | null {
  if (allTimePoints.length < 2) return null

  const ascending = [...allTimePoints].sort((a, b) => (a.date < b.date ? -1 : 1))

  // Reserve at least 1 session beyond the baseline window so "current" can
  // never be computed from the exact same sessions as "baseline" — otherwise
  // an exercise with only 2-3 total sessions (all inside the selected period)
  // trivially shows 0% even when the graph visibly trends upward across them.
  const baselineCount = Math.min(3, ascending.length - 1)
  const baselinePoints = ascending.slice(0, baselineCount)
  const baseline = Math.max(...baselinePoints.map((p) => p.e1rm))
  if (baseline <= 0) return null

  const candidatePoints = ascending.slice(baselineCount)
  const periodPoints = periodStart
    ? candidatePoints.filter((p) => p.date >= periodStart)
    : candidatePoints
  if (periodPoints.length === 0) return null

  const current = Math.max(...periodPoints.map((p) => p.e1rm))
  const pct = ((current - baseline) / baseline) * 100
  return { baseline, current, pct }
}

export type CoverageGroup = { label: string; exerciseNames: string[] }

/** Groups this-period's distinct performed exercises by muscle group label
 *  (already resolved by the caller via muscleGroupFor). Exercises with no
 *  resolved group are dropped, same as elsewhere in the app. */
export function computeCoverage(
  performedExercises: { name: string; muscleGroup: string | null }[],
  trackedGroupLabels: string[],
): CoverageGroup[] {
  const namesByGroup = new Map<string, Set<string>>()
  for (const label of trackedGroupLabels) namesByGroup.set(label, new Set())

  for (const ex of performedExercises) {
    if (!ex.muscleGroup) continue
    const set = namesByGroup.get(ex.muscleGroup)
    if (set) set.add(ex.name)
  }

  return trackedGroupLabels.map((label) => ({
    label,
    exerciseNames: [...(namesByGroup.get(label) ?? [])].sort(),
  }))
}

export type ExerciseSummary = {
  dbId: string
  name: string
  /** Ascending by date, all-time. */
  bestSets: BestSetPoint[]
  muscleGroup: string | null
}

type SessionForSummary = {
  date: string
  exercises:
    | {
        exercise_db_id: string | null
        name: string
        sets: { weight: number; reps: number }[] | null
      }[]
    | null
}

/** Groups a user's full session history into one summary per distinct
 *  exercise_db_id, sorted most-recently-performed first. Shared by Analytics,
 *  StrengthAnalytics and StrengthExerciseDetail — each still runs its own
 *  Supabase fetch (per this codebase's no-shared-data-layer convention), but
 *  the aggregation itself isn't worth re-deriving three times. */
export function buildExerciseSummaries(
  sessions: SessionForSummary[],
  primaryMuscleByDbId: Map<string, string | null>,
): ExerciseSummary[] {
  const rowsByDbId = new Map<
    string,
    { date: string; sets: { weight: number; reps: number }[] }[]
  >()
  const nameByDbId = new Map<string, string>()
  for (const session of sessions) {
    for (const e of session.exercises ?? []) {
      if (!e.exercise_db_id) continue
      const rows = rowsByDbId.get(e.exercise_db_id) ?? []
      rows.push({ date: session.date, sets: e.sets ?? [] })
      rowsByDbId.set(e.exercise_db_id, rows)
      nameByDbId.set(e.exercise_db_id, e.name) // sessions ascending by date → last write = most recent name
    }
  }

  const summaries: ExerciseSummary[] = []
  for (const [dbId, rows] of rowsByDbId) {
    summaries.push({
      dbId,
      name: nameByDbId.get(dbId) ?? 'Exercise',
      bestSets: bestSetPerDate(rows),
      muscleGroup: muscleGroupFor(primaryMuscleByDbId.get(dbId)),
    })
  }

  return summaries.sort((a, b) => {
    const aLast = a.bestSets[a.bestSets.length - 1]?.date ?? ''
    const bLast = b.bestSets[b.bestSets.length - 1]?.date ?? ''
    return bLast.localeCompare(aLast)
  })
}
