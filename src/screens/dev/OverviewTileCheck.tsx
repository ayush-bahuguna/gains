import { useState } from 'react'
import { OverviewTile } from '../../components/OverviewTile'

export function OverviewTileCheck() {
  const [expanded, setExpanded] = useState<
    'workouts' | 'improvements' | 'coverage' | null
  >(null)

  return (
    <div className="mx-auto max-w-[480px] space-y-4 bg-paper p-6">
      <h1 className="text-2xl font-bold">Overview Tiles (§24)</h1>

      <div className="grid grid-cols-3 gap-3">
        <OverviewTile value={42} label="Workouts" />
        <OverviewTile
          value="6 / 7"
          label="Improvements"
          expanded={expanded === 'improvements'}
          onToggle={() =>
            setExpanded((v) => (v === 'improvements' ? null : 'improvements'))
          }
        />
        <OverviewTile
          value="7 / 8"
          label="Coverage"
          expanded={expanded === 'coverage'}
          onToggle={() => setExpanded((v) => (v === 'coverage' ? null : 'coverage'))}
        />
      </div>

      {expanded === 'improvements' && (
        <p className="text-sm text-graphite">Improvements detail would render here.</p>
      )}
      {expanded === 'coverage' && (
        <p className="text-sm text-graphite">Coverage detail would render here.</p>
      )}
    </div>
  )
}
