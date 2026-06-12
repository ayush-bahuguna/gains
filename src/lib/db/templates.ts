import { createClient } from '@/lib/supabase'

export interface UserTemplate {
  id: string
  name: string
  exercises: Array<{ id: string; name: string; muscle: string | null; equipment: string | null }>
}

export async function getTemplates(userId: string): Promise<UserTemplate[]> {
  const db = createClient()
  const { data } = await db
    .from('workout_templates')
    .select(`
      id, name,
      template_exercises (
        order_index,
        exercises ( id, name, muscle, equipment )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  return (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    exercises: (t.template_exercises ?? [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((te: any) => te.exercises)
      .filter(Boolean),
  }))
}

export async function createTemplate(userId: string, name: string, exerciseIds: string[]): Promise<string> {
  const db = createClient()
  const { data, error } = await db
    .from('workout_templates')
    .insert({ user_id: userId, name })
    .select('id')
    .single()
  if (error || !data) throw error

  const rows = exerciseIds.map((exercise_id, i) => ({
    template_id: data.id,
    exercise_id,
    order_index: i,
  }))
  if (rows.length) await db.from('template_exercises').insert(rows)
  return data.id
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const db = createClient()
  await db.from('workout_templates').delete().eq('id', templateId)
}
