'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface AuthContextValue {
  userId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ userId: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = createClient()

    db.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setLoading(false)
      } else {
        const { data, error } = await db.auth.signInAnonymously()
        if (!error && data.user) setUserId(data.user.id)
        setLoading(false)
      }
    })

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ userId, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
