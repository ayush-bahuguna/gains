import { Card } from './Card'
import { Chip } from './Chip'
import { IconBox } from './IconBox'
import { IconDumbbell } from './icons'

type ExerciseCardProps = {
  name: string
  imageUrl: string | null
  primaryMuscle: string | null
  equipment: string | null
  onClick?: () => void
}

export function ExerciseCard({ name, imageUrl, primaryMuscle, equipment, onClick }: ExerciseCardProps) {
  return (
    <Card onClick={onClick} className={onClick ? 'cursor-pointer text-left' : ''}>
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        ) : (
          <IconBox icon={<IconDumbbell className="h-4 w-4" />} size="sm" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{name}</p>
          {(primaryMuscle || equipment) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {primaryMuscle && (
                <Chip variant="category" color="sage" className="capitalize">
                  {primaryMuscle}
                </Chip>
              )}
              {equipment && (
                <Chip variant="category" color="sky" className="capitalize">
                  {equipment}
                </Chip>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
