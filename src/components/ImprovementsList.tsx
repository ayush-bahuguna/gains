import { useState } from 'react'

type ImprovementItem = { name: string; pct: number }

const INITIAL_VISIBLE = 7

export function ImprovementsList({ items }: { items: ImprovementItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...items].sort((a, b) => b.pct - a.pct)
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE)

  if (sorted.length === 0) {
    return <p className="text-sm text-graphite">No exercises with enough history yet.</p>
  }

  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm text-ink">{item.name}</p>
          <span className="shrink-0 text-sm font-medium text-ink">
            {item.pct >= 0 ? '+' : ''}
            {item.pct.toFixed(1)}%
          </span>
        </div>
      ))}
      {!showAll && sorted.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-sm font-medium text-ink"
        >
          View all →
        </button>
      )}
    </div>
  )
}
