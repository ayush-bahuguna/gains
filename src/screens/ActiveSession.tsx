import { useEffect, useMemo, useRef, useState } from 'react'
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
import { VoicePanel, type VoicePanelState } from '../components/VoiceListeningPanel'
import { useSpeechRecognition } from '../lib/useSpeechRecognition'
import { supabase } from '../lib/supabase'
import { matchExerciseName, parseVoiceCommand, type VoiceAction } from '../lib/voiceParser'

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

  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null)
  const [voiceState, setVoiceState] = useState<VoicePanelState>('idle')
  const [voiceMessage, setVoiceMessage] = useState<string | undefined>(undefined)
  const undoStackRef = useRef<Array<() => Promise<void> | void>>([])

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

  async function insertExercise(name: string, exerciseDbId: string | null): Promise<ExerciseData | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('exercises')
      .insert({ session_id: id, exercise_db_id: exerciseDbId, name, position: exercises.length })
      .select()
      .single()
    if (error || !data) return null
    const newEx: ExerciseData = { id: data.id, name: data.name, position: data.position, sets: [] }
    setExercises((prev) => [...prev, newEx])
    return newEx
  }

  async function insertSetAndAttach(exerciseId: string, weight: number, reps: number): Promise<SetRowData | null> {
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return null
    const setNumber = exercise.sets.length + 1
    const { data, error } = await supabase
      .from('sets')
      .insert({ exercise_id: exerciseId, set_number: setNumber, weight, reps })
      .select()
      .single()
    if (error || !data) return null
    const newSet: SetRowData = { id: data.id, setNumber: data.set_number, weight: data.weight, reps: data.reps }
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex)))
    return newSet
  }

  function updateSetById(exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) } : ex,
      ),
    )
    supabase
      .from('sets')
      .update({ [field]: value })
      .eq('id', setId)
      .then()
  }

  async function deleteSetById(exerciseId: string, setId: string) {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex)))
    await supabase.from('sets').delete().eq('id', setId)
  }

  async function deleteExerciseById(exerciseId: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
    await supabase.from('exercises').delete().eq('id', exerciseId)
  }

  async function addExercise(def: ExerciseDefinition) {
    await insertExercise(def.name, def.id)
    setQuery('')
  }

  async function addSet(exerciseIndex: number) {
    await insertSetAndAttach(exercises[exerciseIndex].id, 0, 0)
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) {
    const exercise = exercises[exerciseIndex]
    const set = exercise.sets[setIndex]
    if (set.id) updateSetById(exercise.id, set.id, field, value)
  }

  async function deleteSet(exerciseIndex: number, setIndex: number) {
    const exercise = exercises[exerciseIndex]
    const set = exercise.sets[setIndex]
    if (set.id) await deleteSetById(exercise.id, set.id)
  }

  async function renameExercise(exerciseIndex: number, newName: string) {
    const exercise = exercises[exerciseIndex]
    setExercises((prev) => prev.map((ex, i) => (i === exerciseIndex ? { ...ex, name: newName } : ex)))
    await supabase.from('exercises').update({ name: newName }).eq('id', exercise.id)
  }

  async function deleteExercise(exerciseIndex: number) {
    await deleteExerciseById(exercises[exerciseIndex].id)
  }

  async function resolveExercise(name: string): Promise<{ exercise: ExerciseData; created: boolean } | null> {
    const existing = matchExerciseName(name, exercises, 0.6)
    if (existing) return { exercise: existing, created: false }
    const def = matchExerciseName(name, definitions, 0.55)
    const created = await insertExercise(
      def ? def.name : name.replace(/\b\w/g, (c) => c.toUpperCase()),
      def ? def.id : null,
    )
    if (!created) return null
    return { exercise: created, created: true }
  }

  async function runVoiceCommand(action: VoiceAction): Promise<{ ok: boolean; message?: string }> {
    switch (action.type) {
      case 'undo': {
        const undo = undoStackRef.current.pop()
        if (!undo) return { ok: false, message: 'Nothing to undo' }
        await undo()
        return { ok: true, message: 'Undone' }
      }

      case 'finishWorkout': {
        finishSession()
        return { ok: true, message: 'Finishing...' }
      }

      case 'deleteLastSet': {
        const exercise = exercises.find((e) => e.id === currentExerciseId)
        if (!exercise || exercise.sets.length === 0) return { ok: false, message: 'No set to delete' }
        const removed = exercise.sets[exercise.sets.length - 1]
        if (!removed.id) return { ok: false, message: 'No set to delete' }
        await deleteSetById(exercise.id, removed.id)
        undoStackRef.current.push(async () => {
          await insertSetAndAttach(exercise.id, removed.weight, removed.reps)
        })
        return { ok: true, message: 'Set deleted' }
      }

      case 'deleteExercise': {
        const match = matchExerciseName(action.name, exercises)
        if (!match) return { ok: false, message: `Couldn't find "${action.name}"` }
        await deleteExerciseById(match.id)
        if (currentExerciseId === match.id) setCurrentExerciseId(null)
        undoStackRef.current.push(async () => {
          const restored = await insertExercise(match.name, null)
          if (!restored) return
          for (const s of match.sets) {
            await insertSetAndAttach(restored.id, s.weight, s.reps)
          }
        })
        return { ok: true, message: `Deleted ${match.name}` }
      }

      case 'increaseWeight': {
        const exercise = exercises.find((e) => e.id === currentExerciseId)
        if (!exercise || exercise.sets.length === 0) return { ok: false, message: 'No set yet' }
        const last = exercise.sets[exercise.sets.length - 1]
        if (!last.id) return { ok: false, message: 'No set yet' }
        const prevWeight = last.weight
        updateSetById(exercise.id, last.id, 'weight', prevWeight + action.amount)
        undoStackRef.current.push(() => updateSetById(exercise.id, last.id!, 'weight', prevWeight))
        return { ok: true, message: `+${action.amount}` }
      }

      case 'duplicateSet': {
        const exercise = exercises.find((e) => e.id === currentExerciseId)
        const last = exercise?.sets[exercise.sets.length - 1]
        if (!exercise || !last) return { ok: false, message: 'No previous set' }
        const newSet = await insertSetAndAttach(exercise.id, last.weight, last.reps)
        if (!newSet?.id) return { ok: false, message: 'Could not add set' }
        undoStackRef.current.push(async () => deleteSetById(exercise.id, newSet.id!))
        return { ok: true, message: 'Set added' }
      }

      case 'sameWeightReps': {
        const exercise = exercises.find((e) => e.id === currentExerciseId)
        const last = exercise?.sets[exercise.sets.length - 1]
        if (!exercise || !last) return { ok: false, message: 'No previous set' }
        const newSet = await insertSetAndAttach(exercise.id, last.weight, action.reps)
        if (!newSet?.id) return { ok: false, message: 'Could not add set' }
        undoStackRef.current.push(async () => deleteSetById(exercise.id, newSet.id!))
        return { ok: true, message: 'Set added' }
      }

      case 'appendSet': {
        const exercise = exercises.find((e) => e.id === currentExerciseId)
        if (!exercise) return { ok: false, message: 'No exercise selected' }
        const newSet = await insertSetAndAttach(exercise.id, action.weight, action.reps)
        if (!newSet?.id) return { ok: false, message: 'Could not add set' }
        undoStackRef.current.push(async () => deleteSetById(exercise.id, newSet.id!))
        return { ok: true, message: 'Set added' }
      }

      case 'selectExercise': {
        const resolved = await resolveExercise(action.name)
        if (!resolved) return { ok: false, message: 'Could not add exercise' }
        setCurrentExerciseId(resolved.exercise.id)
        if (resolved.created) {
          undoStackRef.current.push(async () => {
            await deleteExerciseById(resolved.exercise.id)
            setCurrentExerciseId(null)
          })
        }
        return { ok: true, message: resolved.exercise.name }
      }

      case 'createOrSelectExerciseWithSet': {
        const resolved = await resolveExercise(action.name)
        if (!resolved) return { ok: false, message: 'Could not add exercise' }
        setCurrentExerciseId(resolved.exercise.id)
        const newSet = await insertSetAndAttach(resolved.exercise.id, action.weight, action.reps)
        if (resolved.created) {
          undoStackRef.current.push(async () => {
            await deleteExerciseById(resolved.exercise.id)
            setCurrentExerciseId(null)
          })
        } else if (newSet?.id) {
          undoStackRef.current.push(async () => deleteSetById(resolved.exercise.id, newSet.id!))
        }
        return { ok: true, message: `${resolved.exercise.name} logged` }
      }

      default:
        return { ok: false, message: "Didn't understand that" }
    }
  }

  const { start: startListening, stop: stopListening, supported: voiceSupported } = useSpeechRecognition({
    onResult: async (transcript) => {
      setVoiceState('processing')
      const action = parseVoiceCommand(transcript)
      if (!action) {
        setVoiceState('error')
        setVoiceMessage("Didn't catch that")
        return
      }
      const result = await runVoiceCommand(action)
      setVoiceState(result.ok ? 'success' : 'error')
      setVoiceMessage(result.message)
    },
    onError: (message) => {
      setVoiceState('error')
      setVoiceMessage(message)
    },
    onEnd: () => {
      // Recognition ended with no result and no error (e.g. the user tapped
      // to stop before saying anything) — fall back to idle instead of
      // getting stuck showing "Listening...".
      setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev))
    },
  })

  function handleMicClick() {
    if (voiceState === 'idle' || voiceState === 'error' || voiceState === 'success') {
      setVoiceState('listening')
      setVoiceMessage(undefined)
      startListening()
    } else if (voiceState === 'listening') {
      stopListening()
    }
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

      {!session.end_time &&
        (voiceSupported ? (
          <VoicePanel state={voiceState} onMicClick={handleMicClick} message={voiceMessage} />
        ) : (
          <p className="text-center text-xs text-graphite">
            Voice input isn't supported in this browser.
          </p>
        ))}

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
