import { fromISODate } from '../lib/date'
import type { BestSetPoint } from '../lib/personalRecord'
import { Card } from './Card'

type RecentPRsListProps = {
  /** Ascending by date, all-time — this component takes the last 3 itself. */
  bestSets: BestSetPoint[]
}

export function RecentPRsList({ bestSets }: RecentPRsListProps) {
  if (bestSets.length === 0) {
    return <p className="text-sm text-graphite">No sets logged yet for this exercise.</p>
  }

  const recent = [...bestSets].reverse().slice(0, 3)
  const currentBest = bestSets.reduce(
    (best, p) => (p.e1rm > best.e1rm ? p : best),
    bestSets[0],
  )

  return (
    <Card>
      <div className="space-y-2">
        {recent.map((p) => (
          <div key={p.date} className="flex items-center justify-between gap-2">
            <p className="text-sm text-ink">
              {Math.round(p.weight * 100) / 100} kg × {p.reps}
            </p>
            <p className="text-xs text-graphite">
              {fromISODate(p.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-ink/10 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-graphite">
          Current Best
        </p>
        <p className="mt-1 text-sm font-medium text-ink">
          {Math.round(currentBest.weight * 100) / 100} kg × {currentBest.reps}
        </p>
      </div>
    </Card>
  )
}
