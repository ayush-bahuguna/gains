import type { InputHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconCheck } from './icons'
import { Sketchy } from './Sketchy'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Checkbox({ className = '', disabled, checked, ...rest }: CheckboxProps) {
  const [ref, size] = useMeasure<HTMLSpanElement>()

  return (
    <label
      className={`inline-flex items-center ${disabled ? 'opacity-40' : 'cursor-pointer'} ${className}`}
    >
      <span ref={ref} className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <Sketchy width={size.width} height={size.height} radius={5} fill="var(--color-paper)" />
        <input
          type="checkbox"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          disabled={disabled}
          checked={checked}
          {...rest}
        />
        {checked && <IconCheck className="relative z-10 h-3 w-3 text-ink" strokeWidth={2.5} />}
      </span>
    </label>
  )
}
