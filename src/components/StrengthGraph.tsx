import { useMemo } from 'react'
import { fromISODate } from '../lib/date'
import { useMeasure } from '../lib/useMeasure'
import { Card } from './Card'

type StrengthGraphProps = {
  /** Ascending by date, one best-e1RM point per date actually logged — no
   *  fabricated/interpolated points, so consecutive points may be far apart
   *  in real time even though they're drawn evenly spaced. */
  points: { date: string; e1rm: number }[]
  height?: number
}

const PADDING_X = 6
const PADDING_TOP = 20
const PADDING_BOTTOM = 8

function formatShortDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function StrengthGraph({ points, height = 160 }: StrengthGraphProps) {
  const [containerRef, size] = useMeasure<HTMLDivElement>()
  const width = size.width

  const plot = useMemo(() => {
    if (points.length < 2 || width <= 0) return null
    const values = points.map((p) => p.e1rm)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const span = maxV - minV || 1
    const plotWidth = Math.max(width - PADDING_X * 2, 1)
    const plotHeight = height - PADDING_TOP - PADDING_BOTTOM
    const stepX = plotWidth / (points.length - 1)
    const coords = points.map((p, i) => ({
      x: PADDING_X + i * stepX,
      y: PADDING_TOP + plotHeight - ((p.e1rm - minV) / span) * plotHeight,
    }))
    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(' ')
    return { coords, linePath, minV, maxV }
  }, [points, width, height])

  if (points.length === 0) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-graphite">
          No sessions logged yet for this exercise.
        </p>
      </Card>
    )
  }

  if (points.length === 1) {
    return (
      <Card>
        <div ref={containerRef} className="relative" style={{ height }}>
          {width > 0 && (
            <svg width={width} height={height} className="absolute inset-0">
              <circle cx={width / 2} cy={height / 2} r={5} fill="var(--color-sage)" />
            </svg>
          )}
        </div>
        <p className="mt-1 text-center text-xs text-graphite">
          Not enough data yet — one more session will start a trend line.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div ref={containerRef} className="relative" style={{ height }}>
        {plot && (
          <>
            <svg width={width} height={height} className="absolute inset-0">
              <path
                d={plot.linePath}
                fill="none"
                stroke="var(--color-sage)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {plot.coords.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r={4} fill="var(--color-sage)" />
              ))}
            </svg>
            <p className="absolute left-0 top-0 text-xs text-graphite">
              {Math.round(plot.maxV)} kg
            </p>
            <p className="absolute bottom-0 left-0 text-xs text-graphite">
              {Math.round(plot.minV)} kg
            </p>
          </>
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-graphite">
        <span>{formatShortDate(points[0].date)}</span>
        <span>{formatShortDate(points[points.length - 1].date)}</span>
      </div>
    </Card>
  )
}
