import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { ExerciseCard } from '../components/ExerciseCard'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconSearch } from '../components/icons'
import { SearchInput } from '../components/SearchInput'
import { useMeasure } from '../lib/useMeasure'
import { supabase } from '../lib/supabase'

// Broader filter pills grouping the raw (free-text) primary_muscle values
// stored on exercise_definitions — e.g. selecting "Arms" matches any
// exercise tagged biceps, triceps, or forearms. Cards/detail pages still
// display the exercise's own specific primary_muscle text; this grouping
// only drives the pill filter.
const muscleGroups = [
  { label: 'Chest', type: 'muscle' as const, muscles: ['chest'] },
  { label: 'Back', type: 'muscle' as const, muscles: ['back', 'lower back', 'traps'] },
  { label: 'Shoulders', type: 'muscle' as const, muscles: ['shoulders', 'rear delts'] },
  { label: 'Arms', type: 'muscle' as const, muscles: ['biceps', 'triceps', 'forearms'] },
  { label: 'Legs', type: 'muscle' as const, muscles: ['quads', 'hamstrings', 'legs', 'adductors'] },
  { label: 'Glutes', type: 'muscle' as const, muscles: ['glutes', 'abductors'] },
  { label: 'Calves', type: 'muscle' as const, muscles: ['calves'] },
  { label: 'Core', type: 'muscle' as const, muscles: ['abs', 'core'] },
  { label: 'Full Body', type: 'muscle' as const, muscles: ['full body'] },
]

// Equipment-based filter pills, alongside the muscle-group ones above —
// matches against exercise_definitions.equipment instead of primary_muscle.
const equipmentGroups = [{ label: 'Band', type: 'equipment' as const, equipment: ['resistance band'] }]

const filterGroups = [...muscleGroups, ...equipmentGroups]
const muscleFilters = ['All', ...filterGroups.map((g) => g.label)]

type ExerciseDefRow = {
  id: string
  name: string
  aliases: string[]
  primary_muscle: string | null
  category: string | null
  equipment: string | null
  placeholder_image_url: string | null
  placeholder_image_url_peak: string | null
}

export function ExerciseLibrary() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState<ExerciseDefRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState('All')
  const [headerRef, headerSize] = useMeasure<HTMLDivElement>()

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('exercise_definitions')
        .select(
          'id, name, aliases, primary_muscle, category, equipment, placeholder_image_url, placeholder_image_url_peak',
        )
        .order('name', { ascending: true })
      if (cancelled) return
      setExercises(data ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const group = filterGroups.find((g) => g.label === selectedMuscle)
    return exercises.filter((e) => {
      const matchesFilter =
        selectedMuscle === 'All' ||
        (group?.type === 'muscle'
          ? group.muscles.includes(e.primary_muscle?.toLowerCase() ?? '')
          : (group?.equipment.includes(e.equipment?.toLowerCase() ?? '') ?? false))
      const matchesSearch =
        !q || e.name.toLowerCase().includes(q) || e.aliases.some((a) => a.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [exercises, query, selectedMuscle])

  return (
    <div>
      <div ref={headerRef} className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Exercise Library</h1>
        </div>
        <HeaderDivider />
      </div>

      <div
        className="sticky z-20 space-y-3 bg-paper px-6 py-3"
        style={{ top: `calc(env(safe-area-inset-top) + ${headerSize.height}px)` }}
      >
        <SearchInput placeholder="Search exercises..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto">
          {muscleFilters.map((m) => (
            <Chip
              key={m}
              variant="filter"
              selected={selectedMuscle === m}
              onClick={() => setSelectedMuscle(m)}
              className="cursor-pointer whitespace-nowrap"
            >
              {m}
            </Chip>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 pt-4">
        {loading ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconSearch className="h-6 w-6" />}
            title="No exercises found"
            subtitle="Try a different search or muscle group"
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('')
              setSelectedMuscle('All')
            }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <ExerciseCard
                key={e.id}
                name={e.name}
                imageUrl={e.placeholder_image_url}
                primaryMuscle={e.primary_muscle}
                equipment={e.equipment}
                onClick={() => navigate(`/exercises/${e.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
