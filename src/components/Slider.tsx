import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type SliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit?: string
}

function Handle() {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="relative h-full w-full">
      <Sketchy
        width={size.width}
        height={size.height}
        shape="ellipse"
        fill="var(--color-ink)"
        stroke="var(--color-ink)"
      />
    </div>
  )
}

export function Slider({ value, onChange, min, max, unit }: SliderProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-graphite">
        <span>{min}</span>
        <span className="text-sm font-medium text-ink">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>{max}</span>
      </div>
      <div ref={ref} className="relative flex h-6 items-center">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2">
          <Sketchy
            width={size.width}
            height={6}
            shape="line"
            stroke="rgba(30, 30, 30, 0.35)"
            strokeWidth={2}
            roughness={1.4}
            bowing={1}
            multiStroke
          />
        </div>
        <div
          className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <Handle />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="gains-slider relative z-10 w-full"
        />
      </div>
    </div>
  )
}
