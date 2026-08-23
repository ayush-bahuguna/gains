import { useState } from 'react'
import { Dropdown } from '../../components/Dropdown'
import { NumberStepper } from '../../components/NumberStepper'
import { SearchInput } from '../../components/SearchInput'
import { TextInput } from '../../components/TextInput'

export function InputsCheck() {
  const [weight, setWeight] = useState(80)

  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Inputs (§04)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Text Input</p>
        <TextInput placeholder="Exercise name..." />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Search Input</p>
        <SearchInput placeholder="Search exercises..." />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Number Input</p>
        <NumberStepper value={weight} onChange={setWeight} className="w-40" />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Dropdown</p>
        <Dropdown defaultValue="kg" className="w-24">
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </Dropdown>
      </div>
    </div>
  )
}
