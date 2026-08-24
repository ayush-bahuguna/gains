export function splitDescription(
  description: string | null | undefined,
): { howTo: string; targets: string } | null {
  if (!description) return null
  const marker = ' Targets:'
  const idx = description.indexOf(marker)
  if (idx === -1) return { howTo: description.trim(), targets: '' }
  return {
    howTo: description.slice(0, idx).trim(),
    targets: description.slice(idx + 1).trim(),
  }
}
