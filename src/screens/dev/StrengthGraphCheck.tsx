import { StrengthGraph } from '../../components/StrengthGraph'

const gapped = [
  { date: '2026-06-02', e1rm: 80 },
  { date: '2026-06-16', e1rm: 84 },
  { date: '2026-09-10', e1rm: 82 },
  { date: '2026-09-21', e1rm: 90 },
]

export function StrengthGraphCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-8 bg-paper p-6">
      <h1 className="text-2xl font-bold">Strength Graph (§23)</h1>

      <div className="space-y-2">
        <p className="text-sm text-graphite">Empty</p>
        <StrengthGraph points={[]} />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-graphite">Single point</p>
        <StrengthGraph points={[{ date: '2026-09-21', e1rm: 90 }]} />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-graphite">
          Multiple points with a long real-world gap (Jun 16 → Sep 10) — drawn evenly
          spaced, not scaled by elapsed time, and nothing is interpolated across the gap.
        </p>
        <StrengthGraph points={gapped} />
      </div>
    </div>
  )
}
