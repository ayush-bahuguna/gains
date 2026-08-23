import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type RadioButtonProps = {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
}

export function RadioButton({ checked, onChange, disabled, label }: RadioButtonProps) {
  const [ref, size] = useMeasure<HTMLSpanElement>()

  return (
    <label
      className={`inline-flex items-center gap-2 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
    >
      <span ref={ref} className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <Sketchy width={size.width} height={size.height} shape="ellipse" fill="var(--color-paper)" />
        <input
          type="radio"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {checked && <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-ink" />}
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  )
}
