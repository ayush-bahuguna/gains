import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { ChipLegend } from '../components/ChipLegend'
import { Chip } from '../components/Chip'
import { ExerciseImages } from '../components/ExerciseImages'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconButton } from '../components/IconButton'
import { IconChevronLeft } from '../components/icons'
import { Marquee } from '../components/Marquee'
import { splitDescription } from '../lib/exerciseInfo'
import { supabase } from '../lib/supabase'

type ExerciseData = {
  id: string
  name: string
  primary_muscle: string | null
  category: string | null
  equipment: string | null
  placeholder_image_url: string | null
  placeholder_image_url_peak: string | null
  description: string | null
}

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('exercise_definitions')
        .select(
          'id, name, primary_muscle, category, equipment, placeholder_image_url, placeholder_image_url_peak, description',
        )
        .eq('id', id)
        .maybeSingle()

      if (cancelled) return

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setExercise(data)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (notFound || !exercise) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-graphite">Exercise not found.</p>
        <Button variant="secondary" onClick={() => navigate('/exercises')}>
          Back to Exercise Library
        </Button>
      </div>
    )
  }

  const description = splitDescription(exercise.description)
  const hasInfo = !!exercise.placeholder_image_url || !!exercise.placeholder_image_url_peak || !!description

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-center gap-2">
            <IconButton
              icon={<IconChevronLeft className="h-4 w-4" />}
              onClick={() => navigate('/exercises')}
              aria-label="Back"
            />
            <div className="min-w-0 flex-1">
              <h1 className="sr-only">{exercise.name}</h1>
              <Marquee text={exercise.name} className="min-w-0 flex-1 text-2xl font-bold text-ink" />
            </div>
            {(exercise.primary_muscle || exercise.category || exercise.equipment) && <ChipLegend />}
          </div>
        </div>
        <HeaderDivider />
      </div>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {(exercise.primary_muscle || exercise.category || exercise.equipment) && (
          <div className="flex flex-wrap gap-1.5">
            {exercise.primary_muscle && (
              <Chip variant="category" color="sage" className="capitalize">
                {exercise.primary_muscle}
              </Chip>
            )}
            {exercise.category && (
              <Chip variant="category" color="lavender" className="capitalize">
                {exercise.category}
              </Chip>
            )}
            {exercise.equipment && (
              <Chip variant="category" color="sky" className="capitalize">
                {exercise.equipment}
              </Chip>
            )}
          </div>
        )}

        {hasInfo ? (
          <div className="space-y-3">
            <ExerciseImages
              start={exercise.placeholder_image_url}
              peak={exercise.placeholder_image_url_peak}
              alt={exercise.name}
            />
            {description && (
              <div className="space-y-2 text-sm text-ink">
                <p>{description.howTo}</p>
                {description.targets && <p className="text-graphite">{description.targets}</p>}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-graphite">No info available for this exercise.</p>
        )}
      </div>
    </div>
  )
}
