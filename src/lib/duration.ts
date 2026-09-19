export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
