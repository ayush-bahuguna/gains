import type { ReactNode } from 'react'
import { Card } from './Card'
import { IconBox } from './IconBox'
import { IconButton } from './IconButton'
import { IconMore } from './icons'

type TemplateCardProps = {
  icon: ReactNode
  title: string
  description: string
  exerciseCount: number
  onMenuClick?: () => void
  onClick?: () => void
}

export function TemplateCard({
  icon,
  title,
  description,
  exerciseCount,
  onMenuClick,
  onClick,
}: TemplateCardProps) {
  return (
    <Card onClick={onClick} className={onClick ? 'cursor-pointer text-left' : ''}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <IconBox icon={icon} size="sm" />
          <p className="truncate text-sm font-medium text-ink">{title}</p>
        </div>
        {onMenuClick && (
          <IconButton
            icon={<IconMore className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation()
              onMenuClick()
            }}
            aria-label="More options"
          />
        )}
      </div>
      <p className="mt-2 text-xs text-graphite">{description || 'No description yet'}</p>
      <p className="mt-1 text-xs text-graphite">{exerciseCount} exercises</p>
    </Card>
  )
}
