export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: _create } = require('@supabase/supabase-js')
  return _create(url, key)
}
