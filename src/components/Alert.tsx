import { useMeasure } from '../lib/useMeasure'
import { IconAlertTriangle, IconCheckCircle, IconX, IconXCircle } from './icons'
import { Sketchy } from './Sketchy'

type AlertVariant = 'success' | 'warning' | 'error'

type AlertProps = {
  variant: AlertVariant
  message: string
  onClose?: () => void
}

const config = {
  success: { bg: 'var(--color-sage)', Icon: IconCheckCircle },
  warning: { bg: 'var(--color-sun)', Icon: IconAlertTriangle },
  error: { bg: 'var(--color-coral)', Icon: IconXCircle },
}

export function Alert({ variant, message, onClose }: AlertProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const { bg, Icon } = config[variant]

  return (
    <div ref={ref} className="relative flex items-center gap-2 px-4 py-3">
      <Sketchy width={size.width} height={size.height} radius={16} fill={bg} stroke={bg} />
      <Icon className="relative z-10 h-4 w-4 shrink-0 text-ink" />
      <p className="relative z-10 flex-1 text-sm text-ink">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="relative z-10 shrink-0 text-ink"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
