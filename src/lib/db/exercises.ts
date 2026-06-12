import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ExerciseRow = Database['public']['Tables']['exercises']['Row']

export async function getExercises(): Promise<ExerciseRow[]> {
  const db = createClient()
  const { data } = await db
    .from('exercises')
    .select('*')
    .order('name', { ascending: true })
  return data ?? []
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const db = createClient()
  const { data } = await db
    .from('favorite_exercises')
    .select('exercise_id')
    .eq('user_id', userId)
  return (data ?? []).map(r => r.exercise_id)
}

export async function toggleFavorite(userId: string, exerciseId: string, isFav: boolean): Promise<void> {
  const db = createClient()
  if (isFav) {
    await db.from('favorite_exercises').delete().eq('user_id', userId).eq('exercise_id', exerciseId)
  } else {
    await db.from('favorite_exercises').insert({ user_id: userId, exercise_id: exerciseId })
  }
}

export async function getRecentExerciseIds(userId: string, limit = 5): Promise<string[]> {
  const db = createClient()
  const { data: sessions } = await db
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', false)
    .order('started_at', { ascending: false })
    .limit(10)
  if (!sessions?.length) return []

  const { data: seData } = await db
    .from('session_exercises')
    .select('exercise_id')
    .in('session_id', sessions.map(s => s.id))
    .limit(limit * 3)

  const seen = new Set<string>(), ids: string[] = []
  for (const se of seData ?? []) {
    if (!seen.has(se.exercise_id) && ids.length < limit) {
      seen.add(se.exercise_id); ids.push(se.exercise_id)
    }
  }
  return ids
}
