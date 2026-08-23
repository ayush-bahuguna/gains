import { Button } from './Button'
import { Card } from './Card'
import { IconButton } from './IconButton'
import { IconMore, IconPlus } from './icons'
import { SetTable, type SetRowData } from './SetTable'

type ExerciseBlockProps = {
  title: string
  sets: SetRowData[]
  onAddSet?: () => void
  onMenuClick?: () => void
}

export function ExerciseBlock({ title, sets, onAddSet, onMenuClick }: ExerciseBlockProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <IconButton icon={<IconMore className="h-4 w-4" />} onClick={onMenuClick} aria-label="More options" />
      </div>
      <div className="mt-2">
        <SetTable sets={sets} />
      </div>
      <Button
        variant="tertiary"
        onClick={onAddSet}
        leftIcon={<IconPlus className="h-4 w-4" />}
        className="mt-3"
      >
        Add set
      </Button>
    </Card>
  )
}
