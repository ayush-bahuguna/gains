import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { ExerciseBlock } from '../components/ExerciseBlock'
import { IconButton } from '../components/IconButton'
import { IconChevronLeft, IconPencil } from '../components/icons'
import { LiveDot } from '../components/LiveDot'
import { Marquee } from '../components/Marquee'
import { NotesBox } from '../components/NotesBox'
import { SearchInput } from '../components/SearchInput'
import type { SetRowData } from '../components/SetTable'
import { TextInput } from '../components/TextInput'
import { supabase } from '../lib/supabase'

type SessionData = {
  id: string
  name: string
  start_time: string
  end_time: string | null
  notes: string
}

type ExerciseData = {
  id: string
  name: string
  position: number
  sets: SetRowData[]
}

type ExerciseDefinition = {
  id: string
  name: string
  aliases: string[]
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function ActiveSession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionData | null>(null)
  const [exercises, setExercises] = useState<ExerciseData[]>([])
  const [definitions, setDefinitions] = useState<ExerciseDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [query, setQuery] = useState('')
  const [renamingSession, setRenamingSession] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [notesDraft, setNotesDraft] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      const [{ data: sessionRow }, { data: exerciseRows }, { data: defRows }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, name, start_time, end_time, notes')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('exercises')
          .select('id, name, position, sets(id, set_number, weight, reps)')
          .eq('session_id', id)
          .order('position', { ascending: true }),
        supabase.from('exercise_definitions').select('id, name, aliases'),
      ])

      if (cancelled) return

      if (!sessionRow) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setSession(sessionRow)
      setNameDraft(sessionRow.name)
      setNotesDraft(sessionRow.notes)
      setDefinitions(defRows ?? [])
      setExercises(
        (exerciseRows ?? []).map((e) => ({
          id: e.id,
          name: e.name,
          position: e.position,
          sets: (e.sets ?? [])
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) => ({ id: s.id, setNumber: s.set_number, weight: s.weight, reps: s.reps })),
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!session || session.end_time) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [session])

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
      .from('exercises')
      .insert({ session_id: id, exercise_db_id: def.id, name: def.name, position: exercises.length })
      .select()
      .single()
    if (error || !data) return
    setExercises((prev) => [...prev, { id: data.id, name: data.name, position: data.position, sets: [] }])
    setQuery('')
  }

  async function addSet(exerciseIndex: number) {
    const exercise = exercises[exerciseIndex]
    const setNumber = exercise.sets.length + 1
    const { data, error } = await supabase
      .from('sets')
      .insert({ exercise_id: exercise.id, set_number: setNumber, weight: 0, reps: 0 })
      .select()
      .single()
    if (error || !data) return
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: [...ex.sets, { id: data.id, setNumber: data.set_number, weight: data.weight, reps: data.reps }] }
          : ex,
      ),
    )
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) {
    const set = exercises[exerciseIndex].sets[setIndex]
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, [field]: value } : s)) }
          : ex,
      ),
    )
    if (set.id) {
      supabase
        .from('sets')
        .update({ [field]: value })
        .eq('id', set.id)
        .then()
    }
  }

  async function deleteSet(exerciseIndex: number, setIndex: number) {
    const set = exercises[exerciseIndex].sets[setIndex]
    setExercises((prev) =>
      prev.map((ex, i) => (i === exerciseIndex ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) } : ex)),
    )
    if (set.id) await supabase.from('sets').delete().eq('id', set.id)
  }

  async function renameExercise(exerciseIndex: number, newName: string) {
    const exercise = exercises[exerciseIndex]
    setExercises((prev) => prev.map((ex, i) => (i === exerciseIndex ? { ...ex, name: newName } : ex)))
    await supabase.from('exercises').update({ name: newName }).eq('id', exercise.id)
  }

  async function deleteExercise(exerciseIndex: number) {
    const exercise = exercises[exerciseIndex]
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex))
    await supabase.from('exercises').delete().eq('id', exercise.id)
  }

  async function moveExercise(exerciseIndex: number, direction: -1 | 1) {
    const targetIndex = exerciseIndex + direction
    if (targetIndex < 0 || targetIndex >= exercises.length) return
    const a = exercises[exerciseIndex]
    const b = exercises[targetIndex]
    const next = [...exercises]
    next[exerciseIndex] = { ...b, position: a.position }
    next[targetIndex] = { ...a, position: b.position }
    ;[next[exerciseIndex], next[targetIndex]] = [next[targetIndex], next[exerciseIndex]]
    setExercises(next)
    await Promise.all([
      supabase.from('exercises').update({ position: b.position }).eq('id', a.id),
      supabase.from('exercises').update({ position: a.position }).eq('id', b.id),
    ])
  }

  function submitSessionRename() {
    const trimmed = nameDraft.trim()
    setRenamingSession(false)
    if (!trimmed || !session || trimmed === session.name) {
      setNameDraft(session?.name ?? '')
      return
    }
    setSession((prev) => (prev ? { ...prev, name: trimmed } : prev))
    supabase.from('workout_sessions').update({ name: trimmed }).eq('id', session.id).then()
  }

  function commitNotes() {
    if (!session) return
    supabase.from('workout_sessions').update({ notes: notesDraft }).eq('id', session.id).then()
  }

  async function finishSession() {
    if (!session || finishing) return
    setFinishing(true)
    await supabase
      .from('workout_sessions')
      .update({ end_time: new Date().toISOString(), name: session.name, notes: notesDraft })
      .eq('id', session.id)
    navigate(`/session/${session.id}/summary`)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-graphite">Session not found.</p>
        <Button variant="secondary" onClick={() => navigate('/journal')}>
          Back to Journal
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={<IconChevronLeft className="h-4 w-4" />}
            onClick={() => navigate('/journal')}
            aria-label="Back"
          />
          <div className="min-w-0 flex-1">
            {renamingSession ? (
              <TextInput
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={submitSessionRename}
                onKeyDown={(e) => e.key === 'Enter' && submitSessionRename()}
              />
            ) : (
              <button
                type="button"
                className="flex min-w-0 w-full items-center gap-1.5 text-left"
                onClick={() => {
                  setNameDraft(session.name)
                  setRenamingSession(true)
                }}
              >
                <h1 className="sr-only">{session.name}</h1>
                <Marquee text={session.name} className="min-w-0 flex-1 text-2xl font-bold text-ink" />
                <IconPencil className="h-3.5 w-3.5 shrink-0 text-graphite" />
              </button>
            )}
          </div>
          <Button variant="primary" onClick={finishSession} disabled={finishing}>
            {finishing ? 'Finishing...' : 'Finish'}
          </Button>
        </div>
        <p className="mt-1 flex items-center gap-1.5 pl-12 text-xs text-graphite">
          {!session.end_time && <LiveDot />}
          {formatElapsed(now - new Date(session.start_time).getTime())} elapsed
        </p>
      </div>

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

      <div className="space-y-4">
        {exercises.map((ex, i) => (
          <ExerciseBlock
            key={ex.id}
            title={ex.name}
            sets={ex.sets}
            onAddSet={() => addSet(i)}
            onUpdateSet={(setIndex, field, value) => updateSet(i, setIndex, field, value)}
            onDeleteSet={(setIndex) => deleteSet(i, setIndex)}
            onRename={(newName) => renameExercise(i, newName)}
            onDelete={() => deleteExercise(i)}
            onMoveUp={() => moveExercise(i, -1)}
            onMoveDown={() => moveExercise(i, 1)}
            canMoveUp={i > 0}
            canMoveDown={i < exercises.length - 1}
          />
        ))}
      </div>

      <NotesBox
        placeholder="Write a note..."
        value={notesDraft}
        onChange={(e) => setNotesDraft(e.target.value)}
        onBlur={commitNotes}
      />
    </div>
  )
}
