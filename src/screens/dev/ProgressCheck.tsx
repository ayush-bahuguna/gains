import { ProgressBar } from '../../components/ProgressBar'

export function ProgressCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-6 bg-paper p-6">
      <h1 className="text-2xl font-bold">Progress Indicators (§12)</h1>

      <ProgressBar label="Session Progress" current={4} total={6} unit="exercises" color="sage" />
      <ProgressBar label="Exercise Progress" current={3} total={5} unit="sets" color="sky" />
    </div>
  )
}
