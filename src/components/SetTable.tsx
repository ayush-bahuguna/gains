import type { WheelEvent } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconTrash } from './icons'
import { Sketchy } from './Sketchy'

export type SetRowData = {
  id?: string
  setNumber: number
  weight: number
  reps: number
}

type SetTableProps = {
  sets: SetRowData[]
  onUpdateSet?: (index: number, field: 'weight' | 'reps', value: number) => void
  onCommitSet?: (index: number, field: 'weight' | 'reps', value: number) => void
  onDeleteSet?: (index: number) => void
}

function blurOnWheel(e: WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur()
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

export function SetTable({ sets, onUpdateSet, onCommitSet, onDeleteSet }: SetTableProps) {
  const editable = Boolean(onUpdateSet)

  return (
    <div className="w-full text-base">
      <div
        className={`grid gap-2 pb-2 text-sm text-graphite ${editable ? 'grid-cols-[1fr_2fr_2fr_auto]' : 'grid-cols-3'}`}
      >
        <span>SET</span>
        <span>WEIGHT</span>
        <span>REPS</span>
        {editable && <span />}
      </div>
      {sets.map((s, i) => (
        <div key={s.id ?? i}>
          <RowDivider seed={i * 17 + 3} />
          <div
            className={`grid items-center gap-2 py-1.5 text-ink ${editable ? 'grid-cols-[1fr_2fr_2fr_auto]' : 'grid-cols-3'}`}
          >
            <span className="text-lg">{i + 1}</span>
            {editable ? (
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={s.weight === 0 ? '' : s.weight}
                onChange={(e) => onUpdateSet?.(i, 'weight', e.target.value === '' ? 0 : Number(e.target.value))}
                onBlur={(e) => onCommitSet?.(i, 'weight', e.target.value === '' ? 0 : Number(e.target.value))}
                onWheel={blurOnWheel}
                className="w-full min-w-0 rounded-lg bg-ink/5 px-2 py-1 text-ink placeholder:text-graphite/50 focus:outline-none"
              />
            ) : (
              <span>{s.weight} kg</span>
            )}
            {editable ? (
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={s.reps === 0 ? '' : s.reps}
                onChange={(e) => onUpdateSet?.(i, 'reps', e.target.value === '' ? 0 : Number(e.target.value))}
                onBlur={(e) => onCommitSet?.(i, 'reps', e.target.value === '' ? 0 : Number(e.target.value))}
                onWheel={blurOnWheel}
                className="w-full min-w-0 rounded-lg bg-ink/5 px-2 py-1 text-ink placeholder:text-graphite/50 focus:outline-none"
              />
            ) : (
              <span>{s.reps}</span>
            )}
            {editable && (
              <button
                type="button"
                onClick={() => onDeleteSet?.(i)}
                aria-label="Delete set"
                className="text-graphite"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
