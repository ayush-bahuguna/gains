import { useState } from 'react'
import { ExerciseBlock } from '../../components/ExerciseBlock'
import type { SetRowData } from '../../components/SetTable'
import { SetTable } from '../../components/SetTable'

const initialSets: SetRowData[] = [
  { setNumber: 1, weight: 80, reps: 8 },
  { setNumber: 2, weight: 80, reps: 8 },
  { setNumber: 3, weight: 85, reps: 6 },
]

export function TablesCheck() {
  const [blockSets, setBlockSets] = useState(initialSets)

  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Set Row / Exercise Block (§07–08)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Set Row (standalone)</p>
        <SetTable sets={initialSets} />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Exercise Block</p>
        <ExerciseBlock
          title="Bench Press"
          sets={blockSets}
          onAddSet={() =>
            setBlockSets((prev) => [...prev, { setNumber: prev.length + 1, weight: 0, reps: 0 }])
          }
        />
      </div>
    </div>
  )
}
