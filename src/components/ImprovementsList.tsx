import { useState } from 'react'
import { nextMilestonePct } from '../lib/analytics'
import { weightForE1RM, type BestSetPoint } from '../lib/personalRecord'

type ImprovementItem = {
  name: string
  pct: number
  baselinePoint: BestSetPoint
  currentPoint: BestSetPoint
}

const INITIAL_VISIBLE = 7

function roundWeight(weight: number): number {
  return Math.round(weight * 100) / 100
}

export function ImprovementsList({ items }: { items: ImprovementItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const [openName, setOpenName] = useState<string | null>(null)
  const sorted = [...items].sort((a, b) => b.pct - a.pct)
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_VISIBLE)

  if (sorted.length === 0) {
    return <p className="text-sm text-graphite">No exercises with enough history yet.</p>
  }

  return (
    <div className="space-y-1">
      {visible.map((item) => {
        const open = openName === item.name
        const milestone = nextMilestonePct(item.pct)
        const targetWeight = weightForE1RM(
          item.baselinePoint.e1rm * (1 + milestone / 100),
          item.currentPoint.reps,
        )
        return (
          <div key={item.name}>
            <button
              type="button"
              onClick={() => setOpenName(open ? null : item.name)}
              className="flex w-full items-center justify-between gap-2 py-1 text-left"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden className="shrink-0 text-ink">
                  •
                </span>
                <span className="min-w-0 truncate text-sm text-ink">{item.name}</span>
              </span>
              <span
                className={`shrink-0 text-sm font-medium ${
                  item.pct > 0 ? 'text-sage' : item.pct < 0 ? 'text-coral' : 'text-ink'
                }`}
              >
                {item.pct >= 0 ? '+' : ''}
                {item.pct.toFixed(1)}%
              </span>
            </button>
            {open && (
              <div className="ml-4 space-y-0.5 pb-2 text-xs text-graphite">
                <p>
                  Baseline (first sessions): {roundWeight(item.baselinePoint.weight)} kg ×{' '}
                  {item.baselinePoint.reps}
                </p>
                <p>
                  Current (this period): {roundWeight(item.currentPoint.weight)} kg ×{' '}
                  {item.currentPoint.reps}
                </p>
                <p>
                  Next: {roundWeight(targetWeight)} kg × {item.currentPoint.reps} for +
                  {milestone}%
                </p>
              </div>
            )}
          </div>
        )
      })}
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
