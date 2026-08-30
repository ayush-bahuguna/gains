import { useState } from 'react'
import { Chip } from './Chip'
import { IconHelpCircle } from './icons'
import { Modal } from './Modal'

const entries: { color: 'sage' | 'sky' | 'lavender'; label: string; description: string; values: string }[] = [
  {
    color: 'sage',
    label: 'Primary muscle',
    description: 'The main muscle group the exercise targets.',
    values: 'chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, core, full body...',
  },
  {
    color: 'sky',
    label: 'Equipment',
    description: 'What you need to perform it.',
    values: 'barbell, dumbbell, cable, machine, bodyweight, resistance band',
  },
  {
    color: 'lavender',
    label: 'Category',
    description: 'The movement pattern it belongs to.',
    values: 'push, pull, legs, core, hinge, carry, strength, stretch',
  },
]

/** Small "?" trigger that opens a legend explaining what each chip color means. */
export function ChipLegend() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-graphite"
        aria-label="What do the chip colors mean?"
        onClick={() => setOpen(true)}
      >
        <IconHelpCircle className="h-5 w-5" />
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Chip colors" showCloseButton>
        <div className="space-y-4">
          {entries.map((e) => (
            <div key={e.label}>
              <Chip variant="category" color={e.color}>
                {e.label}
              </Chip>
              <p className="mt-1.5 text-sm text-ink">{e.description}</p>
              <p className="text-xs text-graphite">{e.values}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
