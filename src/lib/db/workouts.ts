import { createClient } from '@/lib/supabase'

export async function createSession(userId: string, startedAt: Date): Promise<string> {
  const db = createClient()
  const { data, error } = await db
    .from('workout_sessions')
    .insert({ user_id: userId, started_at: startedAt.toISOString(), is_active: true })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function addExerciseToSession(sessionId: string, exerciseId: string, order: number): Promise<string> {
  const db = createClient()
  const { data, error } = await db
    .from('session_exercises')
    .insert({ session_id: sessionId, exercise_id: exerciseId, order_index: order })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function saveSet(sessionExerciseId: string, set: {
  set_number: number
  set_type: string
  weight_kg: number | null
  reps: number | null
  completed: boolean
}): Promise<void> {
  const db = createClient()
  await db.from('sets').insert({
    session_exercise_id: sessionExerciseId,
    ...set,
    completed_at: set.completed ? new Date().toISOString() : null,
  })
}

export async function finishSession(sessionId: string, opts: {
  durationSecs: number
  energy: number
  notes: string
}): Promise<void> {
  const db = createClient()
  await db.from('workout_sessions').update({
    ended_at: new Date().toISOString(),
    duration_secs: opts.durationSecs,
    energy_level: opts.energy,
    notes: opts.notes || null,
    is_active: false,
  }).eq('id', sessionId)
}

export type HistorySession = {
  id: string
  started_at: string
  duration_secs: number | null
  energy_level: number | null
  notes: string | null
  session_exercises: {
    order_index: number
    exercises: { name: string; category: string | null } | null
    sets: { weight_kg: number | null; reps: number | null; completed: boolean }[]
  }[]
}

export async function getHistory(userId: string): Promise<HistorySession[]> {
  const db = createClient()
  const { data } = await db
    .from('workout_sessions')
    .select(`
      id, started_at, duration_secs, energy_level, notes,
      session_exercises (
        order_index,
        exercises ( name, category ),
        sets ( weight_kg, reps, completed )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', false)
    .order('started_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as HistorySession[]
}
