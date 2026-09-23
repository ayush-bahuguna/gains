import { useState } from 'react'
import { IconChevronDown } from './icons'
import { Sketchy } from './Sketchy'

type CoverageGroup = { label: string; exerciseNames: string[] }

const DOT_SIZE = 10

function CoverageDot({ covered }: { covered: boolean }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: DOT_SIZE, height: DOT_SIZE }}>
      <Sketchy
        width={DOT_SIZE}
        height={DOT_SIZE}
        shape="ellipse"
        strokeWidth={1.25}
        stroke={covered ? 'var(--color-sage)' : 'var(--color-graphite)'}
        fill={covered ? 'var(--color-sage)' : 'var(--color-paper)'}
        fillStyle="solid"
      />
    </span>
  )
}

export function CoverageList({ groups }: { groups: CoverageGroup[] }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null)

  return (
    <div className="space-y-1">
      {groups.map((g) => {
        const covered = g.exerciseNames.length > 0
        const open = openLabel === g.label
        return (
          <div key={g.label}>
            <button
              type="button"
              onClick={() => covered && setOpenLabel(open ? null : g.label)}
              className="flex w-full items-center justify-between gap-2 py-1.5 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-ink">
                <CoverageDot covered={covered} />
                {g.label}
              </span>
              <span className="flex items-center gap-1 text-sm text-graphite">
                {g.exerciseNames.length} exercise{g.exerciseNames.length === 1 ? '' : 's'}
                {covered && (
                  <IconChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                )}
              </span>
            </button>
            {open && (
              <div className="ml-6 space-y-1 pb-2">
                {g.exerciseNames.map((name) => (
                  <p key={name} className="text-sm text-graphite">
                    {name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
