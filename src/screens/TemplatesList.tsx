import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconButton } from '../components/IconButton'
import { IconDumbbell, IconPlus } from '../components/icons'
import { TemplateCard } from '../components/TemplateCard'
import { supabase } from '../lib/supabase'

type TemplateRow = {
  id: string
  name: string
  description: string
  exerciseCount: number
}

export function TemplatesList() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('templates')
        .select('id, name, description, template_exercises(id)')
        .order('created_at', { ascending: false })

      if (cancelled) return

      setTemplates(
        (data ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          exerciseCount: (t.template_exercises ?? []).length,
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function createTemplate() {
    if (creating) return
    setCreating(true)
    const { data, error } = await supabase
      .from('templates')
      .insert({ name: 'New Workout' })
      .select()
      .single()
    setCreating(false)
    if (error || !data) return
    navigate(`/templates/${data.id}`)
  }

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Workouts</h1>
          <IconButton
            icon={<IconPlus className="h-3.5 w-3.5" />}
            size="sm"
            onClick={createTemplate}
            disabled={creating}
            aria-label="New template"
          />
        </div>
        <HeaderDivider />
      </div>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {loading ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<IconDumbbell className="h-6 w-6" />}
            title="No workouts yet"
            subtitle="Create one to speed up logging"
            actionLabel="New Workout"
            onAction={createTemplate}
          />
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                icon={<IconDumbbell className="h-4 w-4" />}
                title={t.name}
                description={t.description}
                exerciseCount={t.exerciseCount}
                onClick={() => navigate(`/templates/${t.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
