import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type ProgressBarProps = {
  current: number
  total: number
  label: string
  unit?: string
  color?: 'sage' | 'sky'
}

const colors = {
  sage: 'var(--color-sage)',
  sky: 'var(--color-sky)',
}

function ProgressFill({ pct, color }: { pct: number; color: 'sage' | 'sky' }) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative h-full transition-[width] duration-200" style={{ width: `${pct}%` }}>
      <Sketchy
        width={size.width}
        height={size.height}
        radius={999}
        fill={colors[color]}
        fillStyle="hachure"
        stroke={colors[color]}
        roughness={1.8}
        strokeWidth={1.25}
      />
    </div>
  )
}

export function ProgressBar({ current, total, label, unit, color = 'sage' }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-graphite">
        <span>{label}</span>
        <span>
          {current}/{total}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
        <ProgressFill pct={pct} color={color} />
      </div>
    </div>
  )
}
