import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): SupabaseClient<any> {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: _c } = require('@supabase/supabase-js')
  _client = _c(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'gains-auth',
    },
  }) as SupabaseClient<any>
  return _client!
}
