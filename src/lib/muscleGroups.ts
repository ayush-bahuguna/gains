// Analytics-specific grouping of exercise_definitions.primary_muscle (a
// freeform text column) into the 8 display groups used by the Analytics
// Coverage tile (docs/Gains_Analytics_Spec.md §1/§6). Deliberately separate
// from ExerciseLibrary.tsx's own 9-group filter-pill grouping — that one
// merges Quads+Hamstrings into "Legs" and adds Calves/Full Body, which suits
// browsing the exercise library but doesn't match this spec's coverage
// table. Keep both; don't unify.

export type MuscleGroupDef = { label: string; muscles: string[] }

export const MUSCLE_GROUPS: MuscleGroupDef[] = [
  { label: 'Chest', muscles: ['chest'] },
  { label: 'Back', muscles: ['back', 'lower back', 'traps'] },
  { label: 'Shoulders', muscles: ['shoulders', 'rear delts'] },
  { label: 'Arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { label: 'Quads', muscles: ['quads'] },
  { label: 'Hamstrings', muscles: ['hamstrings'] },
  { label: 'Glutes', muscles: ['glutes', 'abductors', 'adductors'] },
  { label: 'Core', muscles: ['abs', 'core'] },
]

export type BodyCategory = 'Upper Body' | 'Lower Body' | 'Core' | 'Other'

export const CATEGORY_GROUPS: { label: BodyCategory; muscleGroupLabels: string[] }[] = [
  { label: 'Upper Body', muscleGroupLabels: ['Chest', 'Back', 'Shoulders', 'Arms'] },
  { label: 'Lower Body', muscleGroupLabels: ['Quads', 'Hamstrings', 'Glutes'] },
  { label: 'Core', muscleGroupLabels: ['Core'] },
]

/** Null when primary_muscle doesn't fall into any tracked group (e.g. "calves", "full body") — excluded from Coverage. */
export function muscleGroupFor(primaryMuscle: string | null | undefined): string | null {
  const value = primaryMuscle?.toLowerCase() ?? ''
  return MUSCLE_GROUPS.find((g) => g.muscles.includes(value))?.label ?? null
}

/** "Other" covers any muscle group label not assigned to Upper/Lower/Core (currently: none, reserved for future groups). */
export function categoryFor(muscleGroupLabel: string | null | undefined): BodyCategory {
  if (!muscleGroupLabel) return 'Other'
  return (
    CATEGORY_GROUPS.find((c) => c.muscleGroupLabels.includes(muscleGroupLabel))?.label ??
    'Other'
  )
}
