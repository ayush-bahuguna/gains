import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/me" replace />
  }

  return <>{children}</>
}
