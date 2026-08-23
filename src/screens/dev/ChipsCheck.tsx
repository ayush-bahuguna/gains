import { Chip } from '../../components/Chip'

export function ChipsCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Chips / Tags (§05)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Category</p>
        <div className="flex flex-wrap gap-2">
          <Chip variant="category" color="sage">
            Chest
          </Chip>
          <Chip variant="category" color="sky">
            Back
          </Chip>
          <Chip variant="category" color="sun">
            Legs
          </Chip>
          <Chip variant="category" color="lavender">
            Shoulders
          </Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Type</p>
        <div className="flex flex-wrap gap-2">
          <Chip variant="type">Compound</Chip>
          <Chip variant="type">Isolation</Chip>
          <Chip variant="type">Machine</Chip>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Filter</p>
        <div className="flex flex-wrap gap-2">
          <Chip variant="filter" selected>
            Today
          </Chip>
          <Chip variant="filter">This Week</Chip>
          <Chip variant="filter">All Time</Chip>
        </div>
      </div>
    </div>
  )
}
