export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}

export function bestEpley(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((max, s) => Math.max(max, epley1RM(s.weight, s.reps)), 0)
}
