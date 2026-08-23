import type { ReactNode } from 'react'
import { Card } from './Card'
import { IconBox } from './IconBox'

type ListCardProps = {
  icon: ReactNode
  title: string
  subtitle?: string
  onClick?: () => void
}

export function ListCard({ icon, title, subtitle, onClick }: ListCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer text-left' : ''}`}
    >
      <IconBox icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        {subtitle && <p className="truncate text-xs text-graphite">{subtitle}</p>}
      </div>
    </Card>
  )
}
