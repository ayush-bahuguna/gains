import { Card } from '../../components/Card'
import { RecentPRsList } from '../../components/RecentPRsList'
import { StrengthGraph } from '../../components/StrengthGraph'

const gapped = [
  { date: '2026-06-02', weight: 80, reps: 6, e1rm: 96 },
  { date: '2026-06-16', weight: 82.5, reps: 6, e1rm: 99 },
  { date: '2026-09-10', weight: 80, reps: 8, e1rm: 101 },
  { date: '2026-09-21', weight: 90, reps: 6, e1rm: 108 },
]

export function StrengthGraphCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-8 bg-paper p-6">
      <h1 className="text-2xl font-bold">Strength Graph (§23)</h1>

      <div className="space-y-2">
        <p className="text-sm text-graphite">Empty</p>
        <Card variant="filled">
          <StrengthGraph points={[]} />
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-graphite">Single point</p>
        <Card variant="filled">
          <StrengthGraph
            points={[{ date: '2026-09-21', weight: 90, reps: 6, e1rm: 108 }]}
          />
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-graphite">
          Multiple points with a long real-world gap (Jun 16 → Sep 10) — drawn evenly
          spaced, not scaled by elapsed time, nothing interpolated across the gap. Tap a
          point to open its tooltip. Graph and Recent PRs share one container.
        </p>
        <Card variant="filled">
          <StrengthGraph points={gapped} />
          <RecentPRsList bestSets={gapped} />
        </Card>
      </div>
    </div>
  )
}
