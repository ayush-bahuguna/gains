import type { HTMLAttributes, ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode }

export function Card({ className = '', children, ...rest }: CardProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative p-4" {...rest}>
      <Sketchy width={size.width} height={size.height} radius={20} fill="var(--color-paper)" />
      <div className={`relative z-10 ${className}`}>{children}</div>
    </div>
  )
}
