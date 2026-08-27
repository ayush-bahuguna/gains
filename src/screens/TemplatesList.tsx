import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { IconButton } from '../components/IconButton'
import { IconDumbbell, IconPlus } from '../components/icons'
import { TemplateCard } from '../components/TemplateCard'
import { supabase } from '../lib/supabase'

type TemplateRow = {
  id: string
  name: string
  exerciseNames: string[]
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
        .select('id, name, template_exercises(position, exercise_definitions(name))')
        .order('created_at', { ascending: false })

      if (cancelled) return

      setTemplates(
        (data ?? []).map((t) => {
          const rows = (
            (t.template_exercises ?? []) as unknown as {
              position: number
              exercise_definitions: { name: string }[] | { name: string } | null
            }[]
          )
            .sort((a, b) => a.position - b.position)
            .map((te) =>
              Array.isArray(te.exercise_definitions)
                ? te.exercise_definitions[0]?.name
                : te.exercise_definitions?.name,
            )
            .filter((n): n is string => Boolean(n))
          return { id: t.id, name: t.name, exerciseNames: rows }
        }),
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
    const { data, error } = await supabase.from('templates').insert({ name: 'New Template' }).select().single()
    setCreating(false)
    if (error || !data) return
    navigate(`/templates/${data.id}`)
  }

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 flex items-center justify-between border-b border-ink/10 bg-paper px-6 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-ink">Templates</h1>
        <IconButton
          icon={<IconPlus className="h-4 w-4" />}
          onClick={createTemplate}
          disabled={creating}
          aria-label="New template"
        />
      </div>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {loading ? (
          <p className="text-sm text-graphite">Loading...</p>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<IconDumbbell className="h-6 w-6" />}
            title="No templates yet"
            subtitle="Create one to speed up logging"
            actionLabel="New Template"
            onAction={createTemplate}
          />
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                icon={<IconDumbbell className="h-4 w-4" />}
                title={t.name}
                exercisePreview={t.exerciseNames.length > 0 ? t.exerciseNames.join(', ') : 'No exercises yet'}
                exerciseCount={t.exerciseNames.length}
                onClick={() => navigate(`/templates/${t.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
