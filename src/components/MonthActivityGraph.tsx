import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { addMonths, daysInMonth, formatMonthYear, isSameMonth, toISODate } from '../lib/date'
import { Sketchy } from './Sketchy'
import { useMeasure } from '../lib/useMeasure'

type MonthActivityGraphProps = {
  year: number
  /** 0-indexed (0 = January). */
  month: number
  /** ISO YYYY-MM-DD strings for days a workout happened. */
  attendedDates: Set<string>
  /** Defaults to the real current date — override for testing. */
  today?: Date
  onMonthChange?: (year: number, month: number) => void
}

const SQUARE_SIZE = 40
const GAP = 8
const DRAG_COMMIT_THRESHOLD = 70

function dayColor(dayOfWeek: number, attended: boolean, isFuture: boolean): string {
  if (isFuture) return 'var(--color-mist)'
  if (attended) return 'var(--color-sage)'
  // Sundays read as a neutral rest day (grey) rather than the same
  // "skipped" red as other days.
  return dayOfWeek === 0 ? 'var(--color-graphite)' : 'var(--color-crimson)'
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']

export function MonthActivityGraph({ year, month, attendedDates, today, onMonthChange }: MonthActivityGraphProps) {
  const now = today ?? new Date()
  const atCurrentMonth = isSameMonth({ year, month }, { year: now.getFullYear(), month: now.getMonth() })
  const todayISO = toISODate(now)

  const [containerRef, containerSize] = useMeasure<HTMLDivElement>()
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  // 'idle': following the pointer (dragX) or at rest.
  // 'exit': outgoing month animating fully off-screen.
  // 'enterPrep': content already swapped, instantly snapped to the opposite
  //   off-screen edge with transitions disabled — one frame, never rendered
  //   as a transition (see the effect below).
  // 'enter': incoming month animating from that edge back to center.
  const [stage, setStage] = useState<'idle' | 'exit' | 'enterPrep' | 'enter'>('idle')
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null)
  const [transformX, setTransformX] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const startXRef = useRef(0)
  const width = containerSize.width || 1

  const numDays = daysInMonth(year, month)
  // As many fixed-size squares as fit edge to edge across the container,
  // wrapping to however many rows that takes — not aligned to calendar weeks.
  const columnsPerRow =
    containerSize.width > 0 ? Math.max(1, Math.floor((containerSize.width + GAP) / (SQUARE_SIZE + GAP))) : 0
  const numRows = columnsPerRow > 0 ? Math.ceil(numDays / columnsPerRow) : 0
  const gridHeight = numRows > 0 ? numRows * SQUARE_SIZE + (numRows - 1) * GAP : 0

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (stage !== 'idle') return
    setDragging(true)
    startXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    let delta = e.clientX - startXRef.current
    // Rubber-band: dragging toward "next month" past the real current month
    // is heavily dampened, and can never actually commit (see handlePointerUp).
    if (delta < 0 && atCurrentMonth) delta *= 0.3
    setDragX(delta)
  }

  function handlePointerUp() {
    if (!dragging) return
    setDragging(false)

    if (dragX <= -DRAG_COMMIT_THRESHOLD && !atCurrentMonth) {
      setDirection('next')
      setStage('exit')
      setTransitionEnabled(true)
      setTransformX(-width)
      return
    }
    if (dragX >= DRAG_COMMIT_THRESHOLD) {
      setDirection('prev')
      setStage('exit')
      setTransitionEnabled(true)
      setTransformX(width)
      return
    }
    setDragX(0)
  }

  function handleTransitionEnd() {
    if (stage === 'exit') {
      const delta = direction === 'next' ? 1 : -1
      const { year: ny, month: nm } = addMonths(year, month, delta)
      onMonthChange?.(ny, nm)
      // Content just swapped to the new month — instantly place it off-screen
      // on the entry side (opposite the exit side) with no transition, so the
      // enter animation below has somewhere to slide *from*.
      setTransitionEnabled(false)
      setTransformX(direction === 'next' ? width : -width)
      setStage('enterPrep')
    } else if (stage === 'enter') {
      setStage('idle')
      setDirection(null)
      setDragX(0)
      setTransformX(0)
    }
  }

  // One frame after snapping to the entry position with transitions off, turn
  // transitions back on and animate to center — split across two rAFs so the
  // browser actually paints the "off-screen, no transition" frame first
  // (otherwise the two style changes can collapse into one and never animate).
  useEffect(() => {
    if (stage !== 'enterPrep') return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setTransitionEnabled(true)
        setTransformX(0)
        setStage('enter')
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [stage])

  const translateX = stage === 'idle' ? dragX : transformX

  return (
    <div className="select-none">
      <p className="mb-2 text-center text-sm font-medium text-ink">{formatMonthYear(year, month)}</p>
      <div ref={containerRef} className="overflow-hidden" style={{ height: gridHeight || undefined }}>
        <div
          className="touch-pan-y"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: dragging || !transitionEnabled ? 'none' : 'transform 180ms ease-out',
          }}
          onTransitionEnd={handleTransitionEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {columnsPerRow > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnsPerRow}, ${SQUARE_SIZE}px)`,
                gridAutoRows: `${SQUARE_SIZE}px`,
                gap: GAP,
              }}
            >
              {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
                const date = new Date(year, month, day)
                const dateStr = toISODate(date)
                const attended = attendedDates.has(dateStr)
                const isFuture = dateStr > todayISO
                const color = dayColor(date.getDay(), attended, isFuture)
                return (
                  <div key={dateStr} className="relative" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}>
                    <Sketchy
                      width={SQUARE_SIZE}
                      height={SQUARE_SIZE}
                      radius={4}
                      fill={color}
                      fillStyle="hachure"
                      hachureGap={2.2}
                      fillWeight={2}
                      showStroke={false}
                    />
                    <span
                      className="pointer-events-none relative flex items-center justify-center text-[13px] font-medium leading-none text-white"
                      style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}
                    >
                      {DAY_LETTERS[date.getDay()]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
