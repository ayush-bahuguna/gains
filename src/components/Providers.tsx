'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

const PUBLIC_PATHS = ['/login', '/auth/callback']

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userId, loading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!userId && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/login')
    }
  }, [userId, loading, pathname, router])

  if (loading) return <div className="h-screen bg-[#060403]" />
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider>
}
