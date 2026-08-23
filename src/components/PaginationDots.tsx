import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type PaginationDotsProps = {
  count: number
  active: number
}

function Dot({ active }: { active: boolean }) {
  const [ref, size] = useMeasure<HTMLSpanElement>()
  const color = active ? 'var(--color-ink)' : 'rgba(30, 30, 30, 0.25)'

  return (
    <span ref={ref} className="relative inline-block h-2 w-2">
      <Sketchy width={size.width} height={size.height} shape="ellipse" fill={color} stroke={color} roughness={2.2} />
    </span>
  )
}

export function PaginationDots({ count, active }: PaginationDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === active} />
      ))}
    </div>
  )
}
