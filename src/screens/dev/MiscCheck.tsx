import { useState } from 'react'
import { PaginationDots } from '../../components/PaginationDots'
import { RadioButton } from '../../components/RadioButton'
import { Slider } from '../../components/Slider'

export function MiscCheck() {
  const [weight, setWeight] = useState(80)
  const [reps, setReps] = useState(8)
  const [option, setOption] = useState('three')

  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Misc (§17)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Weight Slider</p>
        <Slider value={weight} onChange={setWeight} min={0} max={200} unit="kg" />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Reps Slider</p>
        <Slider value={reps} onChange={setReps} min={1} max={20} unit="reps" />
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Checkbox Style (Radio)</p>
        <div className="flex flex-col gap-2">
          <RadioButton checked={option === 'one'} onChange={() => setOption('one')} label="Option one" />
          <RadioButton checked={option === 'two'} onChange={() => setOption('two')} label="Option two" />
          <RadioButton checked={option === 'three'} onChange={() => setOption('three')} label="Option three" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Pagination Dots</p>
        <PaginationDots count={4} active={1} />
      </div>
    </div>
  )
}
