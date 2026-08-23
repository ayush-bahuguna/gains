import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
}

export function IconButton({ icon, className = '', disabled, ...rest }: IconButtonProps) {
  const [ref, size] = useMeasure<HTMLButtonElement>()
  const [pressed, setPressed] = useState(false)

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
        fill={pressed ? '#eee9dc' : 'var(--color-paper)'}
        stroke="var(--color-ink)"
      />
      <span className="relative z-10 inline-flex items-center justify-center">{icon}</span>
    </button>
  )
}
