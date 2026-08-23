import type { SelectHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconChevronDown } from './icons'
import { Sketchy } from './Sketchy'

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement>

export function Dropdown({ className = '', children, ...rest }: DropdownProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative flex items-center px-4 py-3">
      <Sketchy width={size.width} height={size.height} radius={16} fill="var(--color-paper)" />
      <select
        className={`relative z-10 w-full appearance-none bg-transparent text-sm text-ink focus:outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
      <IconChevronDown className="relative z-10 h-4 w-4 shrink-0 text-ink" />
    </div>
  )
}
