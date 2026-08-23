import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Card } from './Card'
import { IconButton } from './IconButton'
import { IconMore, IconPlus } from './icons'
import { Modal } from './Modal'
import { SetTable, type SetRowData } from './SetTable'
import { TextInput } from './TextInput'

type ExerciseBlockProps = {
  title: string
  sets: SetRowData[]
  onAddSet?: () => void
  onUpdateSet?: (index: number, field: 'weight' | 'reps', value: number) => void
  onDeleteSet?: (index: number) => void
  onRename?: (newTitle: string) => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export function ExerciseBlock({
  title,
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: ExerciseBlockProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(title)
  const [confirmDelete, setConfirmDelete] = useState(false)

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
          <h3 className="truncate text-lg font-bold text-ink">{title}</h3>
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

      <BottomSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={title}>
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
            disabled={!canMoveUp}
            className="py-3 text-left text-sm text-ink disabled:opacity-30"
            onClick={() => {
              onMoveUp?.()
              setMenuOpen(false)
            }}
          >
            Move up
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            className="py-3 text-left text-sm text-ink disabled:opacity-30"
            onClick={() => {
              onMoveDown?.()
              setMenuOpen(false)
            }}
          >
            Move down
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
      </BottomSheet>

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
