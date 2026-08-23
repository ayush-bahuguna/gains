import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

export type SetRowData = {
  setNumber: number
  weight: number
  reps: number
}

type SetTableProps = {
  sets: SetRowData[]
}

function RowDivider({ seed }: { seed: number }) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="relative h-2 w-full">
      <Sketchy
        width={size.width}
        height={size.height}
        shape="line"
        stroke="rgba(92, 92, 92, 0.45)"
        strokeWidth={0.85}
        roughness={1.6}
        bowing={0.9}
        multiStroke
        seed={seed}
      />
    </div>
  )
}

export function SetTable({ sets }: SetTableProps) {
  return (
    <div className="w-full text-sm">
      <div className="grid grid-cols-3 gap-2 pb-2 text-xs text-graphite">
        <span>SET</span>
        <span>WEIGHT</span>
        <span>REPS</span>
      </div>
      {sets.map((s, i) => (
        <div key={i}>
          <RowDivider seed={i * 17 + 3} />
          <div className="grid grid-cols-3 gap-2 py-2 text-ink">
            <span>{s.setNumber}</span>
            <span>{s.weight} kg</span>
            <span>{s.reps}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
