import { useMeasure } from '../lib/useMeasure'
import { IconPlus } from './icons'
import { Sketchy } from './Sketchy'

type NumberStepperProps = {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  className?: string
}

export function NumberStepper({ value, onChange, step = 1, min, max, className = '' }: NumberStepperProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const canDecrease = min === undefined || value - step >= min
  const canIncrease = max === undefined || value + step <= max

  return (
    <div ref={ref} className={`relative flex items-stretch ${className}`}>
      <Sketchy width={size.width} height={size.height} radius={16} fill="var(--color-paper)" />
      <button
        type="button"
        onClick={() => canDecrease && onChange(value - step)}
        disabled={!canDecrease}
        aria-label="Decrease"
        className="relative z-10 flex w-11 items-center justify-center border-r border-ink/20 text-lg text-ink disabled:opacity-30"
      >
        −
      </button>
      <span className="relative z-10 flex flex-1 items-center justify-center px-3 text-sm text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => canIncrease && onChange(value + step)}
        disabled={!canIncrease}
        aria-label="Increase"
        className="relative z-10 flex w-11 items-center justify-center border-l border-ink/20 text-ink disabled:opacity-30"
      >
        <IconPlus className="h-4 w-4" />
      </button>
    </div>
  )
}
