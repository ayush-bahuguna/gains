import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, disabled, className = '' }: ToggleProps) {
  const [ref, size] = useMeasure<HTMLButtonElement>()

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center disabled:opacity-40 ${className}`}
    >
      <Sketchy
        width={size.width}
        height={size.height}
        radius={999}
        fill={checked ? 'var(--color-ink)' : 'var(--color-paper)'}
      />
      <span
        className={`relative z-10 h-5 w-5 rounded-full border border-ink bg-paper transition-transform duration-150 ${
          checked ? 'translate-x-[24px]' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
