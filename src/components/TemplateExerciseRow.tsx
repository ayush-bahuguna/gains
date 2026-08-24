import { useState } from 'react'
import { splitDescription } from '../lib/exerciseInfo'
import { Card } from './Card'
import { ExerciseImages } from './ExerciseImages'
import { IconChevronDown, IconTrash } from './icons'
import type { ExerciseDefinitionInfo } from './ExerciseBlock'

type TemplateExerciseRowProps = {
  name: string
  definition: ExerciseDefinitionInfo | null
  onRemove: () => void
}

export function TemplateExerciseRow({ name, definition, onRemove }: TemplateExerciseRowProps) {
  const [expanded, setExpanded] = useState(false)

  const description = splitDescription(definition?.description)
  const hasInfo = !!definition?.placeholder_image_url || !!definition?.placeholder_image_url_peak || !!description

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <p className="truncate text-sm text-ink">{name}</p>
          <IconChevronDown
            className={`h-4 w-4 shrink-0 text-graphite transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove exercise"
          className="shrink-0 text-graphite"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {hasInfo ? (
            <>
              <ExerciseImages
                start={definition?.placeholder_image_url ?? null}
                peak={definition?.placeholder_image_url_peak ?? null}
                alt={name}
              />
              {description && (
                <div className="space-y-2 text-sm text-ink">
                  <p>{description.howTo}</p>
                  {description.targets && <p className="text-graphite">{description.targets}</p>}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-graphite">No info available for this exercise.</p>
          )}
        </div>
      )}
    </Card>
  )
}
