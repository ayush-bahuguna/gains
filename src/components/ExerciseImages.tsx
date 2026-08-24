type ExerciseImagesProps = {
  start: string | null
  peak: string | null
  alt: string
}

// Alternating tilt + tape angle per photo so a pair doesn't look perfectly
// mirrored — mimics photos hand-taped into a notebook at slightly different
// angles.
const PHOTO_STYLES = [
  { tilt: '-rotate-[3deg]', tape: 'rotate-[-8deg]' },
  { tilt: 'rotate-[4deg]', tape: 'rotate-[6deg]' },
]

export function ExerciseImages({ start, peak, alt }: ExerciseImagesProps) {
  const images = [start, peak].filter((url): url is string => !!url)
  if (images.length === 0) return null

  return (
    <div className="flex gap-4 px-1 pt-3">
      {images.map((url, i) => {
        const style = PHOTO_STYLES[i % PHOTO_STYLES.length]
        return (
          <div key={url} className={`relative min-w-0 flex-1 ${style.tilt}`}>
            <span
              className={`absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 rounded-[2px] bg-highlight/80 shadow-sm ${style.tape}`}
            />
            <img
              src={url}
              alt={alt}
              className="aspect-square w-full rounded-sm border border-ink/10 object-cover shadow-md"
            />
          </div>
        )
      })}
    </div>
  )
}
