import { Alert } from '../../components/Alert'

export function AlertsCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Alerts / Toasts (§14)</h1>

      <Alert variant="success" message="Set added" onClose={() => {}} />
      <Alert variant="warning" message="Exercise not found. Tap to create." onClose={() => {}} />
      <Alert variant="error" message="Couldn't hear that. Try again." onClose={() => {}} />
    </div>
  )
}
