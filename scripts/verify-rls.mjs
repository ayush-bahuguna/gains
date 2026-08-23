// One-off check: confirms Row Level Security actually isolates users.
// Creates two throwaway email/password test accounts (Google OAuth can't be
// scripted), has user A create a session, then confirms user B cannot see it.
//
// Requires "Confirm email" turned OFF in Supabase → Authentication → Providers → Email,
// otherwise signUp won't return a usable session immediately.
//
// Requires RLS_TEST_EMAIL_BASE in .env.local (a real email address you own —
// Supabase rejects "@example.com" as an obviously-fake domain). Test accounts
// are created via +tag addressing, e.g. you+rlstestA...@gmail.com, so nothing
// is actually sent and they land in your normal inbox if confirmation were on.
//
// Usage: node scripts/verify-rls.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadEnvLocal() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

async function signUpAndIn(url, anonKey, creds) {
  const client = createClient(url, anonKey)
  const { error: signUpError } = await client.auth.signUp(creds)
  if (signUpError) throw new Error(`signUp failed: ${signUpError.message}`)
  const { data, error: signInError } = await client.auth.signInWithPassword(creds)
  if (signInError) {
    throw new Error(
      `signIn failed: ${signInError.message} — is "Confirm email" disabled in Supabase Auth settings?`,
    )
  }
  return { client, userId: data.user.id }
}

async function main() {
  const env = loadEnvLocal()
  const url = env.VITE_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_ANON_KEY
  const testEmailBase = env.RLS_TEST_EMAIL_BASE

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local')
  }
  if (!testEmailBase) {
    throw new Error(
      'Set RLS_TEST_EMAIL_BASE in .env.local to a real email address you own, e.g.\nRLS_TEST_EMAIL_BASE=you@gmail.com',
    )
  }

  const [local, domain] = testEmailBase.split('@')
  const stamp = Date.now()
  const userA = { email: `${local}+rlstesta${stamp}@${domain}`, password: 'test-password-123' }
  const userB = { email: `${local}+rlstestb${stamp}@${domain}`, password: 'test-password-123' }

  console.log('Creating test user A...')
  const a = await signUpAndIn(url, anonKey, userA)
  console.log('Creating test user B...')
  const b = await signUpAndIn(url, anonKey, userB)

  console.log('User A creating a workout session...')
  const { data: session, error: insertError } = await a.client
    .from('workout_sessions')
    .insert({ name: 'RLS test session' })
    .select()
    .single()
  if (insertError) throw new Error(`insert as user A failed: ${insertError.message}`)
  console.log(`  created session ${session.id}`)

  console.log('User B attempting to read all workout_sessions...')
  const { data: bList, error: listError } = await b.client
    .from('workout_sessions')
    .select('*')
  if (listError) throw new Error(`select as user B failed: ${listError.message}`)

  console.log('User B attempting to read the session by id directly...')
  const { data: bRow } = await b.client
    .from('workout_sessions')
    .select('*')
    .eq('id', session.id)
    .maybeSingle()

  const leaked = bList.some((s) => s.id === session.id) || bRow !== null

  console.log('\nCleaning up test session as user A...')
  await a.client.from('workout_sessions').delete().eq('id', session.id)

  if (leaked) {
    throw new Error("RLS FAILED — user B could see user A's session.")
  }

  console.log('✅ RLS OK — user B cannot see user A\'s session.')
  console.log('(Test auth users rls-test-a/b remain in the project — safe to ignore or delete manually.)')
}

main()
  .then(() => {
    process.exitCode = 0
  })
  .catch((err) => {
    console.error('\n❌', err.message)
    process.exitCode = 1
  })
