import { Button } from '../../components/Button'
import { IconButton } from '../../components/IconButton'
import { IconChevronRight, IconMic, IconMore, IconPencil, IconPlus, IconX } from '../../components/icons'

export function ButtonsCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Buttons (§03)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Primary</p>
        <Button variant="primary" leftIcon={<IconMic className="h-4 w-4" />}>
          Start Session
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Secondary</p>
        <Button variant="secondary" leftIcon={<IconPlus className="h-4 w-4" />}>
          Add Exercise
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Tertiary / Text</p>
        <Button variant="tertiary" rightIcon={<IconChevronRight className="h-4 w-4" />}>
          View all
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Icon Button</p>
        <div className="flex gap-3">
          <IconButton icon={<IconMic className="h-5 w-5" />} aria-label="Mic" />
          <IconButton icon={<IconPencil className="h-5 w-5" />} aria-label="Edit" />
          <IconButton icon={<IconMore className="h-5 w-5" />} aria-label="More" />
          <IconButton icon={<IconX className="h-5 w-5" />} aria-label="Close" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Disabled</p>
        <Button variant="primary" disabled>
          Start Session
        </Button>
      </div>
    </div>
  )
}
