import type { ReactNode } from 'react'
import { Button } from './Button'
import { IconBox } from './IconBox'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  subtitle: string
  actionLabel: string
  onAction?: () => void
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <IconBox icon={icon} size="lg" />
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-graphite">{subtitle}</p>
      </div>
      <Button variant="primary" onClick={onAction} className="mt-1">
        {actionLabel}
      </Button>
    </div>
  )
}
