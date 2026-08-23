import type { HTMLAttributes, ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'category' | 'type' | 'filter'
  color?: 'sage' | 'sky' | 'sun' | 'lavender'
  selected?: boolean
  children: ReactNode
}

const categoryColors = {
  sage: 'var(--color-sage)',
  sky: 'var(--color-sky)',
  sun: 'var(--color-sun)',
  lavender: 'var(--color-lavender)',
}

export function Chip({
  variant = 'type',
  color = 'sage',
  selected = false,
  className = '',
  children,
  ...rest
}: ChipProps) {
  const [ref, size] = useMeasure<HTMLSpanElement>()

  let fill: string
  let stroke: string
  let textClass: string

  if (variant === 'category') {
    fill = categoryColors[color]
    stroke = categoryColors[color]
    textClass = 'text-ink'
  } else if (variant === 'filter' && selected) {
    fill = 'var(--color-ink)'
    stroke = 'var(--color-ink)'
    textClass = 'text-paper'
  } else {
    fill = 'var(--color-paper)'
    stroke = 'var(--color-ink)'
    textClass = 'text-ink'
  }

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center px-4 py-1.5 text-xs ${textClass} ${className}`}
      {...rest}
    >
      <Sketchy width={size.width} height={size.height} radius={999} fill={fill} stroke={stroke} />
      <span className="relative z-10">{children}</span>
    </span>
  )
}
