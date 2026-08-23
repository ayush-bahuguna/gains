import type { InputHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconSearch } from './icons'
import { Sketchy } from './Sketchy'

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>

export function SearchInput({ className = '', ...rest }: SearchInputProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative flex items-center gap-2 px-4 py-3">
      <Sketchy width={size.width} height={size.height} radius={16} fill="var(--color-paper)" />
      <IconSearch className="relative z-10 h-4 w-4 shrink-0 text-graphite" />
      <input
        className={`relative z-10 w-full bg-transparent text-sm text-ink placeholder:text-graphite/70 focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  )
}
