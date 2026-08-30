import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  tone?: 'neutral' | 'danger'
  size?: 'md' | 'sm'
}

const toneFill: Record<'neutral' | 'danger', { fill: string; pressed: string }> = {
  neutral: { fill: 'var(--color-mist)', pressed: '#c9c4b5' },
  danger: { fill: 'var(--color-coral)', pressed: '#c04a38' },
}

// 'sm' (32px) matches text-2xl's line height, for a header button that
// shouldn't stretch a title row taller than sibling headers without one.
const sizes = { md: { box: 'h-11 w-11', radius: 16 }, sm: { box: 'h-8 w-8', radius: 12 } }

export function IconButton({
  icon,
  tone = 'neutral',
  size = 'md',
  className = '',
  disabled,
  ...rest
}: IconButtonProps) {
  const [ref, measured] = useMeasure<HTMLButtonElement>()
  const [pressed, setPressed] = useState(false)
  const colors = toneFill[tone]
  const { box, radius } = sizes[size]

  return (
    <button
      ref={ref}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={`relative inline-flex ${box} items-center justify-center text-ink disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...rest}
    >
      <Sketchy
        width={measured.width}
        height={measured.height}
        radius={radius}
        fill={pressed ? colors.pressed : colors.fill}
        fillStyle="hachure"
        hachureGap={2.2}
        fillWeight={2}
        stroke="var(--color-ink)"
      />
      <span className="relative z-10 inline-flex items-center justify-center">
        {icon}
      </span>
    </button>
  )
}
