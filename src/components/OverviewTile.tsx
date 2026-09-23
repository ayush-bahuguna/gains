import { Card } from './Card'
import { IconChevronDown } from './icons'

type OverviewTileProps = {
  value: string | number
  label: string
  /** Omit onToggle for a non-expandable tile (e.g. Total Workouts, whose
   *  detail is the calendar right below it) — it renders as a plain, non-interactive Card. */
  expanded?: boolean
  onToggle?: () => void
}

export function OverviewTile({
  value,
  label,
  expanded = false,
  onToggle,
}: OverviewTileProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-1 py-4 text-center">
      <span className="text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs text-graphite">{label}</span>
      {onToggle && (
        <IconChevronDown
          className={`h-4 w-4 text-graphite transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      )}
    </div>
  )

  if (!onToggle) return <Card>{content}</Card>

  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full">
        {content}
      </button>
    </Card>
  )
}
