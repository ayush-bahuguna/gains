import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

// Hand-drawn divider for the bottom edge of a sticky screen header —
// same color/thickness as the plain `border-b border-ink/10` it replaces,
// rendered as a wobbly rough.js line instead of a straight CSS border.
export function HeaderDivider() {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="relative h-2 w-full">
      <Sketchy
        width={size.width}
        height={size.height}
        shape="line"
        stroke="rgba(30, 30, 30, 0.1)"
        strokeWidth={1}
        roughness={1.6}
        bowing={0.9}
        multiStroke
      />
    </div>
  )
}
