import { BottomNav } from '../../components/BottomNav'
import { IconDumbbell } from '../../components/icons'

export function BottomNavCheck() {
  return (
    <div className="mx-auto max-w-[480px] bg-paper p-6">
      <h1 className="mb-4 text-2xl font-bold">Bottom Navigation (§09)</h1>

      <p className="mb-2 text-xs text-graphite">Default (current URL doesn't match any tab)</p>
      <div className="rounded border border-dashed border-ink/20">
        <BottomNav />
      </div>

      <p className="mt-6 mb-2 text-xs text-graphite">
        Active-state reference (manually styled, not real routing)
      </p>
      <div className="rounded border border-dashed border-ink/20">
        <nav className="flex pb-1 pt-2">
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconDumbbell className="h-5 w-5" />
            <span>Log</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconDumbbell className="h-5 w-5" />
            <span>Templates</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconDumbbell className="h-5 w-5" />
            <span>History</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconDumbbell className="h-5 w-5" />
            <span>Me</span>
          </div>
        </nav>
      </div>
    </div>
  )
}
