import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { IconButton } from '../components/IconButton'
import { IconChevronLeft, IconPencil, IconTrash } from '../components/icons'
import { Modal } from '../components/Modal'
import { SearchInput } from '../components/SearchInput'
import { TextInput } from '../components/TextInput'
import { supabase } from '../lib/supabase'

type TemplateData = { id: string; name: string }
type TemplateExercise = { id: string; exercise_db_id: string; name: string }
type ExerciseDefinition = { id: string; name: string; aliases: string[] }

export function TemplateDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [exercises, setExercises] = useState<TemplateExercise[]>([])
  const [definitions, setDefinitions] = useState<ExerciseDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [query, setQuery] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [starting, setStarting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      const [{ data: templateRow }, { data: exerciseRows }, { data: defRows }] = await Promise.all([
        supabase.from('templates').select('id, name').eq('id', id).maybeSingle(),
        supabase
          .from('template_exercises')
          .select('id, exercise_db_id, position, exercise_definitions(name)')
          .eq('template_id', id)
          .order('position', { ascending: true }),
        supabase.from('exercise_definitions').select('id, name, aliases'),
      ])

      if (cancelled) return

      if (!templateRow) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setTemplate(templateRow)
      setNameDraft(templateRow.name)
      setDefinitions(defRows ?? [])
      setExercises(
        (
          (exerciseRows ?? []) as unknown as {
            id: string
            exercise_db_id: string
            exercise_definitions: { name: string }[] | { name: string } | null
          }[]
        ).map((e) => {
          const def = Array.isArray(e.exercise_definitions) ? e.exercise_definitions[0] : e.exercise_definitions
          return {
            id: e.id,
            exercise_db_id: e.exercise_db_id,
            name: def?.name ?? 'Unknown exercise',
          }
        }),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return definitions
      .filter((d) => d.name.toLowerCase().includes(q) || d.aliases.some((a) => a.toLowerCase().includes(q)))
      .slice(0, 6)
  }, [query, definitions])

  async function addExercise(def: ExerciseDefinition) {
    if (!id) return
    const { data, error } = await supabase
      .from('template_exercises')
      .insert({ template_id: id, exercise_db_id: def.id, position: exercises.length })
      .select()
      .single()
    if (error || !data) return
    setExercises((prev) => [...prev, { id: data.id, exercise_db_id: def.id, name: def.name }])
    setQuery('')
  }

  async function removeExercise(index: number) {
    const ex = exercises[index]
    setExercises((prev) => prev.filter((_, i) => i !== index))
    await supabase.from('template_exercises').delete().eq('id', ex.id)
  }

  function submitRename() {
    const trimmed = nameDraft.trim()
    setRenaming(false)
    if (!trimmed || !template || trimmed === template.name) {
      setNameDraft(template?.name ?? '')
      return
    }
    setTemplate((prev) => (prev ? { ...prev, name: trimmed } : prev))
    supabase.from('templates').update({ name: trimmed }).eq('id', template.id).then()
  }

  async function startSessionFromTemplate() {
    if (!template || starting) return
    setStarting(true)
    const { data: newSession, error } = await supabase
      .from('workout_sessions')
      .insert({ name: template.name })
      .select()
      .single()
    if (error || !newSession) {
      setStarting(false)
      return
    }
    if (exercises.length > 0) {
      await supabase.from('exercises').insert(
        exercises.map((e, i) => ({
          session_id: newSession.id,
          exercise_db_id: e.exercise_db_id,
          name: e.name,
          position: i,
        })),
      )
    }
    navigate(`/session/${newSession.id}`)
  }

  async function deleteTemplate() {
    if (!template) return
    await supabase.from('templates').delete().eq('id', template.id)
    navigate('/templates')
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (notFound || !template) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-graphite">Template not found.</p>
        <Button variant="secondary" onClick={() => navigate('/templates')}>
          Back to Templates
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <IconButton
          icon={<IconChevronLeft className="h-4 w-4" />}
          onClick={() => navigate('/templates')}
          aria-label="Back"
        />
        <div className="min-w-0 flex-1">
          {renaming ? (
            <TextInput
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            />
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 text-left"
              onClick={() => {
                setNameDraft(template.name)
                setRenaming(true)
              }}
            >
              <h1 className="truncate text-2xl font-bold text-ink">{template.name}</h1>
              <IconPencil className="h-3.5 w-3.5 shrink-0 text-graphite" />
            </button>
          )}
        </div>
        <IconButton
          icon={<IconTrash className="h-4 w-4" />}
          tone="danger"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete template"
        />
      </div>

      <Button variant="primary" className="w-full" onClick={startSessionFromTemplate} disabled={starting}>
        {starting ? 'Starting...' : 'Start Session'}
      </Button>

      <div>
        <p className="mb-2 text-lg font-bold text-ink">Exercises</p>
        <div className="relative">
          <SearchInput
            placeholder="Search to add an exercise"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-ink/15 bg-paper p-2 shadow-lg">
              <div className="flex flex-col divide-y divide-ink/10">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => addExercise(r)}
                    className="rounded-xl px-2 py-2.5 text-left text-sm text-ink active:bg-ink/5"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {exercises.length > 0 && (
          <div className="mt-3 space-y-3">
            {exercises.map((e, i) => (
              <Card key={e.id} className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-ink">{e.name}</p>
                <button
                  type="button"
                  onClick={() => removeExercise(i)}
                  aria-label="Remove exercise"
                  className="shrink-0 text-graphite"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete template?">
        <p>This permanently removes "{template.name}".</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={deleteTemplate}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
