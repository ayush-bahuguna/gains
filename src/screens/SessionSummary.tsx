import { useParams } from 'react-router-dom'

export function SessionSummary() {
  const { id } = useParams()

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-ink">Session Completed</h1>
      <p className="mt-2 text-sm text-graphite">Coming in Phase 6.</p>
      <p className="mt-4 text-xs text-graphite">Session ID: {id}</p>
    </div>
  )
}
