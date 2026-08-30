import { ChipLegend } from '../../components/ChipLegend'

export function ChipLegendCheck() {
  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <div className="flex items-center gap-2">
        <h1 className="min-w-0 flex-1 text-2xl font-bold">Chip Legend (§21)</h1>
        <ChipLegend />
      </div>
      <p className="text-sm text-graphite">Tap the "?" to open the chip-color legend modal.</p>
    </div>
  )
}
