import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

type AuthState = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {
    // Without an explicit redirectTo, Supabase falls back to the "Site URL"
    // configured in the dashboard — which can point somewhere stale (an old
    // deployment) instead of wherever this app is actually running.
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  },
  signOut: async () => {
    await supabase.auth.signOut()
  },
}))

supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, loading: false })
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
})
