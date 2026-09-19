import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type MarqueeProps = {
  text: string
  className?: string
  /** Which font token to render with. Defaults to the display font (titles). */
  font?: 'display' | 'body'
}

export function Marquee({ text, className = '', font = 'display' }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(0)

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const el = textRef.current
      if (!container || !el) return
      const diff = el.scrollWidth - container.clientWidth
      setOverflow(diff > 0 ? diff : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{ fontFamily: font === 'body' ? 'var(--font-body)' : 'var(--font-display)' }}
    >
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap ${overflow > 0 ? 'marquee-text' : ''}`}
        style={overflow > 0 ? ({ '--marquee-distance': `-${overflow}px` } as CSSProperties) : undefined}
      >
        {text}
      </span>
    </div>
  )
}
