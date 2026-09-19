import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatDuration } from '../lib/duration'
import { formatWeekdayOrdinal } from '../lib/date'
import { useClickOutside } from '../lib/useClickOutside'
import { useMeasure } from '../lib/useMeasure'
import { IconChevronRight } from './icons'
import { Marquee } from './Marquee'
import { Sketchy } from './Sketchy'
import { TextInput } from './TextInput'

type DaySession = {
  sessionId: string
  exerciseCount: number
  durationMs: number
  prCount: number
}

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
const SESSION_HEIGHT = 76
const SKIP_EDIT_HEIGHT = 124
const SKIP_VIEW_HEIGHT = 92
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
  // A saved (non-empty) reason starts in read-only marquee form; tapping it
  // switches to the editable input. Component is remounted per-day (see the
  // `key` on <DayTooltip> in Me.tsx), so this initial value is only ever
  // computed once per day shown, from that day's own saved reason.
  const [editingReason, setEditingReason] = useState(reason.trim() === '')
  const [autoFocusReason, setAutoFocusReason] = useState(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useClickOutside(containerRef, onClose, open)

  // Combines the two refs into one stable callback identity — an inline
  // (unmemoized) function here would give the `ref` prop a new reference on
  // every render, which makes React detach+reattach the node every render,
  // re-triggering useMeasure's ResizeObserver setup (and its setState) in a
  // tight loop ("Maximum update depth exceeded").
  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el
      measureRef(el)
    },
    [measureRef],
  )

  useEffect(() => {
    if (!open) return
    if (session === null && reasonFocused) return
    const timer = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [open, session, reasonFocused])

  if (!open || !anchorRect || !date) return null

  const height = session
    ? SESSION_HEIGHT
    : editingReason
      ? SKIP_EDIT_HEIGHT
      : SKIP_VIEW_HEIGHT

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
      <Sketchy
        width={size.width}
        height={size.height}
        radius={16}
        fill="var(--color-paper)"
      />
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
              {session.prCount > 0 &&
                ` · ${session.prCount} PR${session.prCount === 1 ? '' : 's'}`}
            </span>
            <IconChevronRight className="h-4 w-4 shrink-0 text-ink" />
          </button>
        ) : editingReason ? (
          <div className="mt-2">
            <TextInput
              placeholder="Reason for skipping..."
              value={reason}
              autoFocus={autoFocusReason}
              onChange={(e) => onReasonChange(e.target.value)}
              onFocus={() => {
                setReasonFocused(true)
                onReasonFocus()
              }}
              onBlur={() => {
                setReasonFocused(false)
                onReasonBlur()
                if (reason.trim() !== '') setEditingReason(false)
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingReason(true)
              setAutoFocusReason(true)
            }}
            className="mt-2 w-full text-left"
          >
            <Marquee text={reason} className="text-sm text-ink" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
