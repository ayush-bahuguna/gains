import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

const LIVE_GREEN = '#34c759'

export function LiveDot() {
  const [ref, size] = useMeasure<HTMLSpanElement>()

  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full" style={{ backgroundColor: LIVE_GREEN, opacity: 0.6 }} />
      <span ref={ref} className="relative h-2 w-2">
        <Sketchy
          width={size.width}
          height={size.height}
          shape="ellipse"
          fill={LIVE_GREEN}
          stroke="#2ea44f"
          roughness={2}
        />
      </span>
    </span>
  )
}
