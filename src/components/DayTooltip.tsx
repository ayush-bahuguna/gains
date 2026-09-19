import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatDuration } from '../lib/duration'
import { formatWeekdayOrdinal } from '../lib/date'
import { useClickOutside } from '../lib/useClickOutside'
import { useMeasure } from '../lib/useMeasure'
import { IconChevronRight } from './icons'
import { Sketchy } from './Sketchy'
import { TextInput } from './TextInput'

type DaySession = { sessionId: string; exerciseCount: number; durationMs: number }

type DayTooltipProps = {
  open: boolean
  anchorRect: DOMRect | null
  date: Date | null
  /** null = no completed session that day → skip-reason variant. */
  session: DaySession | null
  reason: string
  onReasonChange: (value: string) => void
  onReasonFocus: () => void
  onReasonBlur: () => void
  onNavigate: (sessionId: string) => void
  onClose: () => void
}

const WIDTH = 220
const MARGIN = 8
const GAP = 8
const AUTO_DISMISS_MS = 3000

export function DayTooltip({
  open,
  anchorRect,
  date,
  session,
  reason,
  onReasonChange,
  onReasonFocus,
  onReasonBlur,
  onNavigate,
  onClose,
}: DayTooltipProps) {
  const [measureRef, size] = useMeasure<HTMLDivElement>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [reasonFocused, setReasonFocused] = useState(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useClickOutside(containerRef, onClose, open)

  function setContainerRef(el: HTMLDivElement | null) {
    containerRef.current = el
    measureRef(el)
  }

  useEffect(() => {
    if (!open) return
    if (session === null && reasonFocused) return
    const timer = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [open, session, reasonFocused])

  if (!open || !anchorRect || !date) return null

  const height = session ? 76 : 124

  let left = anchorRect.left + anchorRect.width / 2 - WIDTH / 2
  left = Math.min(Math.max(left, MARGIN), window.innerWidth - WIDTH - MARGIN)
  let top = anchorRect.bottom + GAP
  if (top + height > window.innerHeight - MARGIN) top = anchorRect.top - height - GAP
  top = Math.max(top, MARGIN)

  return createPortal(
    <div
      ref={setContainerRef}
      className="fixed z-[100] rounded-[16px] bg-paper p-3"
      style={{ left, top, width: WIDTH, height }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Sketchy width={size.width} height={size.height} radius={16} fill="var(--color-paper)" />
      <div className="relative z-10">
        <p className="text-xs font-medium text-ink">{formatWeekdayOrdinal(date)}</p>
        {session ? (
          <button
            type="button"
            onClick={() => onNavigate(session.sessionId)}
            className="mt-2 flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="text-xs text-graphite">
              {session.exerciseCount} exercise{session.exerciseCount === 1 ? '' : 's'} ·{' '}
              {formatDuration(session.durationMs)}
            </span>
            <IconChevronRight className="h-4 w-4 shrink-0 text-ink" />
          </button>
        ) : (
          <div className="mt-2">
            <TextInput
              placeholder="Reason for skipping..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              onFocus={() => {
                setReasonFocused(true)
                onReasonFocus()
              }}
              onBlur={() => {
                setReasonFocused(false)
                onReasonBlur()
              }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
