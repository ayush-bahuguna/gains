import type { ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type IconBoxProps = {
  icon: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-16 w-16' }

export function IconBox({ icon, size = 'md', className = '' }: IconBoxProps) {
  const [ref, measured] = useMeasure<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`relative flex shrink-0 items-center justify-center text-ink ${sizes[size]} ${className}`}
    >
      <Sketchy width={measured.width} height={measured.height} radius={14} fill="var(--color-paper)" />
      <span className="relative z-10">{icon}</span>
    </div>
  )
}
