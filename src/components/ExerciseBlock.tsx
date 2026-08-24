import { useState } from 'react'
import { splitDescription } from '../lib/exerciseInfo'
import { Button } from './Button'
import { Card } from './Card'
import { ExerciseImages } from './ExerciseImages'
import { IconButton } from './IconButton'
import { IconMore, IconPlus } from './icons'
import { Modal } from './Modal'
import { SetTable, type SetRowData } from './SetTable'
import { TextInput } from './TextInput'

export type ExerciseDefinitionInfo = {
  placeholder_image_url: string | null
  placeholder_image_url_peak: string | null
  description: string | null
}

type ExerciseBlockProps = {
  title: string
  sets: SetRowData[]
  definition?: ExerciseDefinitionInfo | null
  onAddSet?: () => void
  onUpdateSet?: (index: number, field: 'weight' | 'reps', value: number) => void
  onDeleteSet?: (index: number) => void
  onRename?: (newTitle: string) => void
  onDelete?: () => void
}

export function ExerciseBlock({
  title,
  sets,
  definition,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRename,
  onDelete,
}: ExerciseBlockProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(title)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const description = splitDescription(definition?.description)
  const hasInfo = !!definition?.placeholder_image_url || !!definition?.placeholder_image_url_peak || !!description

  function submitRename() {
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed !== title) onRename?.(trimmed)
    else setNameDraft(title)
    setRenaming(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        {renaming ? (
          <TextInput
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
          />
        ) : (
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="min-w-0 flex-1 truncate text-left text-lg font-bold text-ink"
          >
            {title}
          </button>
        )}
        <IconButton
          icon={<IconMore className="h-4 w-4" />}
          onClick={() => setMenuOpen(true)}
          aria-label="More options"
        />
      </div>

      <div className="mt-2">
        <SetTable sets={sets} onUpdateSet={onUpdateSet} onDeleteSet={onDeleteSet} />
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1.5 text-sm text-ink active:bg-ink/10"
      >
        <IconPlus className="h-4 w-4" />
        Add set
      </button>

      <Modal isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={title}>
        <div className="flex flex-col divide-y divide-ink/10">
          <button
            type="button"
            className="py-3 text-left text-sm text-ink"
            onClick={() => {
              setNameDraft(title)
              setRenaming(true)
              setMenuOpen(false)
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className="py-3 text-left text-sm text-coral"
            onClick={() => {
              setMenuOpen(false)
              setConfirmDelete(true)
            }}
          >
            Delete exercise
          </button>
        </div>
      </Modal>

      <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title={title} showCloseButton>
        {hasInfo ? (
          <div className="space-y-3">
            <ExerciseImages
              start={definition?.placeholder_image_url ?? null}
              peak={definition?.placeholder_image_url_peak ?? null}
              alt={title}
            />
            {description && (
              <div className="space-y-2 text-sm text-ink">
                <p>{description.howTo}</p>
                {description.targets && <p className="text-graphite">{description.targets}</p>}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-graphite">No info available for this exercise.</p>
        )}
      </Modal>

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete exercise?">
        <p>This removes {title} and all its sets from this session.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setConfirmDelete(false)
              onDelete?.()
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
