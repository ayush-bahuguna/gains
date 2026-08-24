type ExerciseImagesProps = {
  start: string | null
  peak: string | null
  alt: string
}

export function ExerciseImages({ start, peak, alt }: ExerciseImagesProps) {
  const images = [start, peak].filter((url): url is string => !!url)
  if (images.length === 0) return null

  return (
    <div className="flex gap-2">
      {images.map((url) => (
        <img
          key={url}
          src={url}
          alt={alt}
          className="aspect-square flex-1 rounded-2xl object-cover"
        />
      ))}
    </div>
  )
}
