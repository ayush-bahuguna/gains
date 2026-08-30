import { BottomNav } from '../../components/BottomNav'
import {
  IconCalendar,
  IconCalendarFilled,
  IconDumbbell,
  IconDumbbellFilled,
  IconNotebookFilled,
  IconUser,
  IconUserFilled,
} from '../../components/icons'

export function BottomNavCheck() {
  return (
    <div className="mx-auto max-w-[480px] bg-paper p-6">
      <h1 className="mb-4 text-2xl font-bold">Bottom Navigation (§09)</h1>

      <p className="mb-2 text-xs text-graphite">
        Default (current URL doesn't match any tab)
      </p>
      <div className="rounded border border-dashed border-ink/20">
        <BottomNav />
      </div>

      <p className="mt-6 mb-2 text-xs text-graphite">
        Active-state reference (manually styled per tab, not real routing) — shows each
        tab's outline icon inactive vs. its filled counterpart when active
      </p>
      <div className="rounded border border-dashed border-ink/20">
        <nav className="flex pb-1 pt-2">
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconNotebookFilled className="h-5 w-5" />
            <span>Log</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconDumbbell className="h-5 w-5" />
            <span>Workouts</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconCalendar className="h-5 w-5" />
            <span>History</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-graphite">
            <IconUser className="h-5 w-5" />
            <span>Me</span>
          </div>
        </nav>
      </div>

      <p className="mt-4 mb-2 text-xs text-graphite">
        All four filled icons, active state
      </p>
      <div className="rounded border border-dashed border-ink/20">
        <nav className="flex pb-1 pt-2">
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconNotebookFilled className="h-5 w-5" />
            <span>Log</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconDumbbellFilled className="h-5 w-5" />
            <span>Workouts</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconCalendarFilled className="h-5 w-5" />
            <span>History</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-ink">
            <IconUserFilled className="h-5 w-5" />
            <span>Me</span>
          </div>
        </nav>
      </div>
    </div>
  )
}
