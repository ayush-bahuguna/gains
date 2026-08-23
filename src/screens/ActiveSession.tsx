import { useParams } from 'react-router-dom'

export function ActiveSession() {
  const { id } = useParams()

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-ink">Active Session</h1>
      <p className="mt-2 text-sm text-graphite">Coming in Phase 5.</p>
      <p className="mt-4 text-xs text-graphite">Session ID: {id}</p>
    </div>
  )
}
