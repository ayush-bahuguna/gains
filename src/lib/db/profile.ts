import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ProfileRow    = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const db = createClient()
  const { data } = await db.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

export async function upsertProfile(userId: string, update: ProfileUpdate): Promise<void> {
  const db = createClient()
  await db.from('profiles').upsert({ id: userId, ...update })
}
