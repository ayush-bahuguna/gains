import { EmptyState } from '../../components/EmptyState'
import { IconClock, IconDumbbell, IconNotebook } from '../../components/icons'

export function EmptyStatesCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-10 bg-paper p-6">
      <h1 className="text-2xl font-bold">Empty States (§15)</h1>

      <EmptyState
        icon={<IconNotebook className="h-6 w-6" />}
        title="No session yet"
        subtitle="Start your workout"
        actionLabel="Start Session"
      />
      <EmptyState
        icon={<IconDumbbell className="h-6 w-6" />}
        title="No exercises added"
        subtitle="Tap the mic or add an exercise"
        actionLabel="Add Exercise"
      />
      <EmptyState
        icon={<IconClock className="h-6 w-6" />}
        title="No history yet"
        subtitle="Your past workouts will appear here"
        actionLabel="View Templates"
      />
    </div>
  )
}
