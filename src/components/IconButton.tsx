import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  tone?: 'neutral' | 'danger'
}

const toneFill: Record<'neutral' | 'danger', { fill: string; pressed: string }> = {
  neutral: { fill: 'var(--color-mist)', pressed: '#c9c4b5' },
  danger: { fill: 'var(--color-coral)', pressed: '#c04a38' },
}

export function IconButton({ icon, tone = 'neutral', className = '', disabled, ...rest }: IconButtonProps) {
  const [ref, size] = useMeasure<HTMLButtonElement>()
  const [pressed, setPressed] = useState(false)
  const colors = toneFill[tone]

  return (
    <button
      ref={ref}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={`relative inline-flex h-11 w-11 items-center justify-center text-ink disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...rest}
    >
      <Sketchy
        width={size.width}
        height={size.height}
        radius={16}
        fill={pressed ? colors.pressed : colors.fill}
        fillStyle="hachure"
        hachureGap={2.2}
        fillWeight={2}
        stroke="var(--color-ink)"
      />
      <span className="relative z-10 inline-flex items-center justify-center">{icon}</span>
    </button>
  )
}
