import { useState } from 'react'
import { Button } from '../../components/Button'
import { DayTooltip } from '../../components/DayTooltip'

type Variant = 'session' | 'skip' | null

const MOCK_ANCHOR = new DOMRect(40, 160, 40, 40)
const MOCK_DATE = new Date(2026, 8, 13)

export function DayTooltipCheck() {
  const [variant, setVariant] = useState<Variant>(null)
  const [reason, setReason] = useState('Felt sick')

  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Day Tooltip (§22)</h1>
      <p className="text-sm text-graphite">
        Tap a day in the Me screen's calendar to see this anchored near the tapped cell. Below
        triggers each variant directly against a fixed mock position.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setVariant('session')}>
          Show session tooltip
        </Button>
        <Button variant="secondary" onClick={() => setVariant('skip')}>
          Show skip tooltip
        </Button>
      </div>
      <DayTooltip
        open={variant !== null}
        anchorRect={MOCK_ANCHOR}
        date={MOCK_DATE}
        session={variant === 'session' ? { sessionId: 'mock', exerciseCount: 5, durationMs: 52 * 60000 } : null}
        reason={reason}
        onReasonChange={setReason}
        onReasonFocus={() => {}}
        onReasonBlur={() => {}}
        onNavigate={() => {}}
        onClose={() => setVariant(null)}
      />
    </div>
  )
}
