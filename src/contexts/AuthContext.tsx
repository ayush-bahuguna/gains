'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface AuthUser {
  name?: string
  email?: string
  avatarUrl?: string
}

interface AuthContextValue {
  userId: string | null
  loading: boolean
  user: AuthUser | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  loading: true,
  user: null,
  signOut: async () => {},
})

function sessionToUser(s: { user: { user_metadata?: Record<string, string>; email?: string } } | null): AuthUser | null {
  if (!s?.user) return null
  return {
    name:      s.user.user_metadata?.full_name,
    email:     s.user.email,
    avatarUrl: s.user.user_metadata?.avatar_url,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [user,   setUser]   = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = createClient()

    db.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setUser(sessionToUser(session))
      setLoading(false)
    })

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setUser(sessionToUser(session))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const db = createClient()
    await db.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ userId, loading, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
