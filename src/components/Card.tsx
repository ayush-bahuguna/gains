import type { HTMLAttributes, ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  /** 'filled' = a soft grey tint with no outline (matches NotesBox's
   *  unbordered variant, e.g. session notes) — for content that should read
   *  as a quiet, recessed panel rather than a bordered card. */
  variant?: 'paper' | 'filled'
}

export function Card({
  className = '',
  children,
  variant = 'paper',
  ...rest
}: CardProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative p-4" {...rest}>
      <Sketchy
        width={size.width}
        height={size.height}
        radius={20}
        fill={variant === 'filled' ? 'rgba(30, 30, 30, 0.05)' : 'var(--color-paper)'}
        showStroke={variant === 'paper'}
      />
      <div className={`relative z-10 ${className}`}>{children}</div>
    </div>
  )
}
