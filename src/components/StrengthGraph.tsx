import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatWeekdayOrdinal, fromISODate } from '../lib/date'
import type { BestSetPoint } from '../lib/personalRecord'
import { useClickOutside } from '../lib/useClickOutside'
import { useMeasure } from '../lib/useMeasure'
import { Card } from './Card'
import { Sketchy } from './Sketchy'

type StrengthGraphProps = {
  /** Ascending by date, one best-e1RM point per date actually logged — no
   *  fabricated/interpolated points, so consecutive points may be far apart
   *  in real time even though they're drawn evenly spaced. */
  points: BestSetPoint[]
  height?: number
}

const PADDING_LEFT = 30
const PADDING_RIGHT = 8
const PADDING_TOP = 14
const PADDING_BOTTOM = 22
const HIT_RADIUS = 12
const DOT_RADIUS = 4
const ACTIVE_DOT_RADIUS = 5.5
const Y_TICK_COUNT = 4
const X_TICK_COUNT = 5

function formatShortDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/** `count` indices spread evenly across `[0, length-1]`, deduped and sorted
 *  — used to pick a handful of x-axis tick positions from the plotted points
 *  without labeling every single one. */
function evenlySpacedIndices(length: number, count: number): number[] {
  if (length <= count) return Array.from({ length }, (_, i) => i)
  const indices = new Set<number>()
  for (let i = 0; i < count; i++) {
    indices.add(Math.round((i * (length - 1)) / (count - 1)))
  }
  return [...indices].sort((a, b) => a - b)
}

// Same anchored/auto-dismiss/tap-outside mechanics as DayTooltip.tsx (the
// calendar's day tooltip) — kept file-local rather than shared, since that
// component's editable skip-reason concepts don't apply here.
const TOOLTIP_WIDTH = 180
const TOOLTIP_HEIGHT = 68
const TOOLTIP_MARGIN = 8
const TOOLTIP_GAP = 8
const AUTO_DISMISS_MS = 3000

function GraphPointTooltip({
  point,
  anchorRect,
  onClose,
}: {
  point: BestSetPoint
  anchorRect: DOMRect
  onClose: () => void
}) {
  const [measureRef, size] = useMeasure<HTMLDivElement>()
  const containerRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useClickOutside(containerRef, onClose, true)

  // The parent keys this component by point index, so a tap on a different
  // point remounts it fresh — a plain mount-once timer is enough here.
  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [])

  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el
      measureRef(el)
    },
    [measureRef],
  )

  let left = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2
  left = Math.min(
    Math.max(left, TOOLTIP_MARGIN),
    window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN,
  )
  let top = anchorRect.top - TOOLTIP_HEIGHT - TOOLTIP_GAP
  if (top < TOOLTIP_MARGIN) top = anchorRect.bottom + TOOLTIP_GAP

  return createPortal(
    <div
      ref={setContainerRef}
      className="fixed z-[100] rounded-[16px] bg-paper p-3"
      style={{ left, top, width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Sketchy
        width={size.width}
        height={size.height}
        radius={16}
        fill="var(--color-paper)"
      />
      <div className="relative z-10">
        <p className="text-xs font-medium text-ink">
          {formatWeekdayOrdinal(fromISODate(point.date))}
        </p>
        <p className="mt-1 text-sm text-ink">
          {Math.round(point.weight * 100) / 100} kg × {point.reps}
        </p>
        <p className="text-xs text-graphite">Est. 1RM: {Math.round(point.e1rm)} kg</p>
      </div>
    </div>,
    document.body,
  )
}

export function StrengthGraph({ points, height = 180 }: StrengthGraphProps) {
  const [containerRef, size] = useMeasure<HTMLDivElement>()
  const width = size.width
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  const plot = useMemo(() => {
    if (points.length < 2 || width <= 0) return null
    const values = points.map((p) => p.e1rm)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const span = maxV - minV || 1
    const plotWidth = Math.max(width - PADDING_LEFT - PADDING_RIGHT, 1)
    const plotHeight = height - PADDING_TOP - PADDING_BOTTOM
    const stepX = plotWidth / (points.length - 1)
    const yFor = (v: number) =>
      PADDING_TOP + plotHeight - ((v - minV) / span) * plotHeight
    const coords = points.map((p, i) => ({
      x: PADDING_LEFT + i * stepX,
      y: yFor(p.e1rm),
    }))
    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(' ')

    // Tick values are spread across the *real* min-max range, not `span`
    // (which has a `|| 1` divide-by-zero guard for the pixel math below) —
    // otherwise a flat line (minV === maxV) would label fabricated distinct
    // values instead of repeating the one true value.
    const valueRange = maxV - minV
    const yTicks = Array.from({ length: Y_TICK_COUNT }, (_, i) => {
      const value = minV + (valueRange * i) / (Y_TICK_COUNT - 1)
      return { value, y: yFor(value) }
    })
    const xTickIndices = evenlySpacedIndices(points.length, X_TICK_COUNT)
    const xTicks = xTickIndices.map((i) => ({ date: points[i].date, x: coords[i].x }))

    return { coords, linePath, yTicks, xTicks, plotBottom: PADDING_TOP + plotHeight }
  }, [points, width, height])

  if (points.length === 0) {
    return (
      <Card variant="filled">
        <p className="py-6 text-center text-sm text-graphite">
          No sessions logged yet for this exercise.
        </p>
      </Card>
    )
  }

  if (points.length === 1) {
    return (
      <Card variant="filled">
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
    <Card variant="filled">
      <div ref={containerRef} className="relative" style={{ height }}>
        {plot && (
          <>
            <svg width={width} height={height} className="absolute inset-0">
              {plot.yTicks.map((tick, i) => (
                <line
                  key={`y-${i}`}
                  x1={PADDING_LEFT}
                  x2={width - PADDING_RIGHT}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="var(--color-mist)"
                  strokeWidth={1}
                />
              ))}
              {plot.xTicks.map((tick, i) => (
                <line
                  key={`x-${i}`}
                  x1={tick.x}
                  x2={tick.x}
                  y1={PADDING_TOP}
                  y2={plot.plotBottom}
                  stroke="var(--color-mist)"
                  strokeWidth={1}
                />
              ))}
              <path
                d={plot.linePath}
                fill="none"
                stroke="var(--color-sage)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {plot.coords.map((c, i) => (
                <g key={i}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={HIT_RADIUS}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={(e) => {
                      setActiveIndex(i)
                      setAnchorRect(e.currentTarget.getBoundingClientRect())
                    }}
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={activeIndex === i ? ACTIVE_DOT_RADIUS : DOT_RADIUS}
                    fill="var(--color-sage)"
                    pointerEvents="none"
                  />
                </g>
              ))}
            </svg>
            {plot.yTicks.map((tick, i) => (
              <p
                key={`y-label-${i}`}
                className="absolute left-0 text-xs text-graphite"
                style={{ top: tick.y - 7, width: PADDING_LEFT - 4, textAlign: 'right' }}
              >
                {Math.round(tick.value)}
                {i === plot.yTicks.length - 1 ? ' kg' : ''}
              </p>
            ))}
            {plot.xTicks.map((tick, i) => (
              <p
                key={`x-label-${i}`}
                className="absolute whitespace-nowrap text-xs text-graphite"
                style={{
                  top: plot.plotBottom + 4,
                  left: tick.x,
                  transform:
                    i === 0
                      ? undefined
                      : i === plot.xTicks.length - 1
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)',
                }}
              >
                {formatShortDate(tick.date)}
              </p>
            ))}
          </>
        )}
      </div>
      {activeIndex !== null && anchorRect && (
        <GraphPointTooltip
          key={activeIndex}
          point={points[activeIndex]}
          anchorRect={anchorRect}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </Card>
  )
}
