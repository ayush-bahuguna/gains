export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}

/** Algebraic inverse of epley1RM — the weight needed at a given rep count to
 *  hit a target e1RM (used to show "lift X kg for Y reps to reach +10%"). */
export function weightForE1RM(targetE1RM: number, atReps: number): number {
  return targetE1RM / (1 + atReps / 30)
}

export function bestEpley(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((max, s) => Math.max(max, epley1RM(s.weight, s.reps)), 0)
}

type SetRow = { weight: number; reps: number }

/** Flat best-e1RM-ever per exercise_db_id, across whatever rows are passed in. */
export function bestEpleyByExercise(
  rows: { exercise_db_id: string | null; sets: SetRow[] | null }[],
): Map<string, number> {
  const max = new Map<string, number>()
  for (const row of rows) {
    if (!row.exercise_db_id) continue
    const best = bestEpley(row.sets ?? [])
    max.set(row.exercise_db_id, Math.max(max.get(row.exercise_db_id) ?? 0, best))
  }
  return max
}

/** Best e1RM per exercise_db_id, broken down per session — lets a caller
 *  exclude one specific session (e.g. "today") when computing the historical
 *  max for that same session, which a flat max can't do. */
export function bestEpleyByExerciseAndSession(
  rows: { session_id: string; exercise_db_id: string | null; sets: SetRow[] | null }[],
): Map<string, Map<string, number>> {
  const bySession = new Map<string, Map<string, number>>()
  for (const row of rows) {
    if (!row.exercise_db_id) continue
    const best = bestEpley(row.sets ?? [])
    const sessions = bySession.get(row.exercise_db_id) ?? new Map<string, number>()
    sessions.set(row.session_id, Math.max(sessions.get(row.session_id) ?? 0, best))
    bySession.set(row.exercise_db_id, sessions)
  }
  return bySession
}

export type BestSetPoint = { date: string; weight: number; reps: number; e1rm: number }

/** The single best set (by e1RM) per calendar date for a single exercise
 *  (multiple sets/instances on the same date collapse to that date's best),
 *  sorted ascending — feeds StrengthGraph (via .e1rm), Recent PRs (weight/reps)
 *  and the improvement calculation, all from one shared reduction. */
export function bestSetPerDate(
  rows: { date: string; sets: SetRow[] | null }[],
): BestSetPoint[] {
  const byDate = new Map<string, BestSetPoint>()
  for (const row of rows) {
    for (const s of row.sets ?? []) {
      const e1rm = epley1RM(s.weight, s.reps)
      if (e1rm <= 0) continue
      const existing = byDate.get(row.date)
      if (!existing || e1rm > existing.e1rm) {
        byDate.set(row.date, { date: row.date, weight: s.weight, reps: s.reps, e1rm })
      }
    }
  }
  return [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
}
