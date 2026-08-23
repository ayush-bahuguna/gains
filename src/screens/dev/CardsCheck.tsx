import { IconDumbbell } from '../../components/icons'
import { ListCard } from '../../components/ListCard'

export function CardsCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Cards (§06)</h1>

      <ListCard icon={<IconDumbbell className="h-5 w-5" />} title="Push Day" subtitle="6 exercises" />
      <ListCard icon={<IconDumbbell className="h-5 w-5" />} title="Pull Day" subtitle="5 exercises" />
      <ListCard icon={<IconDumbbell className="h-5 w-5" />} title="Leg Day" subtitle="7 exercises" />
    </div>
  )
}
