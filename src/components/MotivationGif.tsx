import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { refreshDailyMotivation, type DailyMotivation } from '../lib/dailyMotivation'

const HOLD_MS = 5000
const CANCEL_MS = 300
const RECEDE_MS = 700

type Phase = 'idle' | 'placed' | 'growing' | 'cancelling' | 'reloading' | 'receding'

type SpillBlob = {
  x: number
  y: number
  size: number
  radii: string
  offsetX: number
  offsetY: number
  radii2: string
}

function randomRadii() {
  const r = () => 30 + Math.round(Math.random() * 40) // 30-70, keeps it blob-like not spiky
  return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`
}

// Long-press (5s) on the daily motivation gif spills ink from the press
// point until it fully covers the gif, swaps in a freshly-rolled gif/quote
// underneath, then recedes to reveal it. Releasing early cancels the spill.
export function MotivationGif({
  motivation,
  onChange,
}: {
  motivation: DailyMotivation
  onChange: (next: DailyMotivation) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [blob, setBlob] = useState<SpillBlob | null>(null)
  const phaseRef = useRef<Phase>('idle')

  function setPhaseBoth(p: Phase) {
    phaseRef.current = p
    setPhase(p)
  }

  function startPress(e: PointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'idle') return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const corners: [number, number][] = [
      [0, 0],
      [rect.width, 0],
      [0, rect.height],
      [rect.width, rect.height],
    ]
    const maxDist = Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)))
    const size = maxDist * 2.3 // guarantees full coverage even with an irregular blob edge

    setBlob({
      x,
      y,
      size,
      radii: randomRadii(),
      offsetX: (Math.random() - 0.5) * size * 0.15,
      offsetY: (Math.random() - 0.5) * size * 0.15,
      radii2: randomRadii(),
    })
    setPhaseBoth('placed')
    requestAnimationFrame(() => requestAnimationFrame(() => setPhaseBoth('growing')))
  }

  function cancelPress() {
    if (phaseRef.current !== 'growing' && phaseRef.current !== 'placed') return
    setPhaseBoth('cancelling')
  }

  async function commitReload() {
    setPhaseBoth('reloading')
    const next = await refreshDailyMotivation()
    if (next) {
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = next.gifUrl
      })
      onChange(next)
    }
    setPhaseBoth('receding')
  }

  function handleTransitionEnd() {
    if (phaseRef.current === 'growing') {
      commitReload()
    } else if (phaseRef.current === 'cancelling' || phaseRef.current === 'receding') {
      setPhaseBoth('idle')
      setBlob(null)
    }
  }

  const covering = phase === 'growing' || phase === 'reloading'
  const scale = covering ? 1 : 0
  const duration =
    phase === 'growing' ? HOLD_MS : phase === 'cancelling' ? CANCEL_MS : phase === 'receding' ? RECEDE_MS : 0
  const easing = phase === 'growing' ? 'linear' : 'ease-in-out'

  return (
    <div
      ref={containerRef}
      className="relative touch-none select-none overflow-hidden rounded-2xl [-webkit-touch-callout:none]"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={motivation.gifUrl}
        alt=""
        draggable={false}
        className="w-full rounded-2xl border border-ink/10 object-cover"
      />
      {blob && (
        <>
          <div
            className="pointer-events-none absolute bg-ink"
            style={{
              left: blob.x,
              top: blob.y,
              width: blob.size,
              height: blob.size,
              marginLeft: -blob.size / 2,
              marginTop: -blob.size / 2,
              borderRadius: blob.radii,
              transform: `scale(${scale})`,
              transition: `transform ${duration}ms ${easing}`,
            }}
            onTransitionEnd={handleTransitionEnd}
          />
          <div
            className="pointer-events-none absolute bg-ink"
            style={{
              left: blob.x + blob.offsetX,
              top: blob.y + blob.offsetY,
              width: blob.size * 0.85,
              height: blob.size * 0.85,
              marginLeft: (-blob.size * 0.85) / 2,
              marginTop: (-blob.size * 0.85) / 2,
              borderRadius: blob.radii2,
              transform: `scale(${scale})`,
              transition: `transform ${duration}ms ${easing}`,
            }}
          />
        </>
      )}
    </div>
  )
}
