import { useState } from 'react'
import { Checkbox } from '../../components/Checkbox'
import { Toggle } from '../../components/Toggle'

export function SmallElementsCheck() {
  const [completedChecked, setCompletedChecked] = useState(true)
  const [pendingChecked, setPendingChecked] = useState(false)
  const [on, setOn] = useState(true)
  const [off, setOff] = useState(false)

  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Small Elements (§11)</h1>

      <div>
        <p className="mb-2 text-xs text-graphite">Checkbox</p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <Checkbox checked={completedChecked} onChange={(e) => setCompletedChecked(e.target.checked)} />
            Completed set
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <Checkbox checked={pendingChecked} onChange={(e) => setPendingChecked(e.target.checked)} />
            Pending set
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-graphite">Toggle</p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <Toggle checked={on} onChange={setOn} />
            On
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <Toggle checked={off} onChange={setOff} />
            Off
          </label>
        </div>
      </div>
    </div>
  )
}
