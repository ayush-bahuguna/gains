import type { InputHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export function TextInput({ className = '', ...rest }: TextInputProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative">
      <Sketchy width={size.width} height={size.height} radius={16} fill="var(--color-paper)" />
      <input
        className={`relative z-10 w-full bg-transparent px-4 py-3 text-sm text-ink placeholder:text-graphite/70 focus:outline-none ${className}`}
        {...rest}
      />
    </div>
  )
}
