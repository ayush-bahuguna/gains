import { useEffect, useRef, useState } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

const TRACK_WIDTH = 8
const MIN_THUMB_HEIGHT = 32
const EDGE_GAP = 4
const HIDE_DELAY_MS = 900

// Decorative, hand-drawn stand-in for the native scrollbar (hidden globally
// in index.css) — the app scrolls at the <html> level (see Layout.tsx), so
// this tracks document.documentElement directly rather than any per-screen
// container. Just the thumb, no full-length track — it fades in while
// actively scrolling and fades back out shortly after, like a native
// overlay scrollbar. Not draggable: this app is touch/wheel-scroll-first,
// and a draggable thumb needs pointer-capture/drag math this purely-visual
// ask doesn't call for.
export function ScrollIndicator() {
  const [trackRef, track] = useMeasure<HTMLDivElement>()
  const [scroll, setScroll] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 })
  const [active, setActive] = useState(false)
  const rafRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const read = () => {
      const el = document.documentElement
      setScroll({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      })
    }
    const scheduleRead = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        read()
      })
    }
    const onScroll = () => {
      scheduleRead()
      setActive(true)
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = window.setTimeout(() => setActive(false), HIDE_DELAY_MS)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', scheduleRead, { passive: true })
    // html/body/#root all have height:100% pinned in index.css, so their own
    // box never resizes from overflowing content — a ResizeObserver reports
    // the observed element's own box changing, not a descendant's
    // scrollHeight. Layout.tsx's wrapper div (#root's only child) is the one
    // element that actually grows, so it's the one worth observing for
    // async-content-driven height changes (e.g. data finishing loading).
    const growthTarget =
      document.getElementById('root')?.firstElementChild ?? document.body
    const observer = new ResizeObserver(scheduleRead)
    observer.observe(growthTarget)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', scheduleRead)
      observer.disconnect()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current)
    }
  }, [])

  const { scrollTop, scrollHeight, clientHeight } = scroll
  const canScroll = scrollHeight - clientHeight > EDGE_GAP && track.height > 0

  let thumbHeight = 0
  let thumbTop = 0
  if (canScroll) {
    thumbHeight = Math.max(MIN_THUMB_HEIGHT, (track.height * clientHeight) / scrollHeight)
    const scrollFrac = scrollTop / (scrollHeight - clientHeight)
    thumbTop = scrollFrac * (track.height - thumbHeight)
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 bottom-0 z-40 mx-auto max-w-[480px]"
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="absolute right-1"
        style={{
          top: 'calc(env(safe-area-inset-top) + 4px)',
          bottom: 'calc(var(--bottom-nav-height, 72px) + 4px)',
          width: TRACK_WIDTH,
        }}
      >
        {canScroll && (
          <div
            className="absolute left-0 transition-opacity duration-300"
            style={{
              top: thumbTop,
              width: TRACK_WIDTH,
              height: thumbHeight,
              opacity: active ? 1 : 0,
            }}
          >
            <Sketchy
              width={TRACK_WIDTH}
              height={thumbHeight}
              radius={999}
              fill="var(--color-graphite)"
              stroke="var(--color-graphite)"
              strokeWidth={1}
            />
          </div>
        )}
      </div>
    </div>
  )
}
