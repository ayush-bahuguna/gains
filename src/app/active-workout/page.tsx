'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { createSession, addExerciseToSession, saveSet, finishSession } from '@/lib/db/workouts'
import { getExercises } from '@/lib/db/exercises'

type SetData = { type: 'W' | 'N' | 'D'; weight: string; reps: string; done: boolean; prev: string }
type Exercise = { name: string; muscle: string; equipment: string; best: string; sets: SetData[] }

const INITIAL_EXERCISES: Exercise[] = [
  { name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', best: '87.5 × 5',
    sets: [
      { type:'W', weight:'60',   reps:'12', done:false, prev:'60 × 12'  },
      { type:'N', weight:'80',   reps:'8',  done:false, prev:'80 × 8'   },
      { type:'N', weight:'82.5', reps:'8',  done:false, prev:'80 × 8'   },
      { type:'N', weight:'85',   reps:'6',  done:false, prev:'82.5 × 6' },
    ]},
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', best: '62.5 × 5',
    sets: [
      { type:'W', weight:'40',   reps:'12', done:false, prev:'40 × 12'  },
      { type:'N', weight:'60',   reps:'6',  done:false, prev:'57.5 × 6' },
      { type:'N', weight:'60',   reps:'6',  done:false, prev:'57.5 × 6' },
      { type:'N', weight:'62.5', reps:'5',  done:false, prev:'60 × 5'   },
    ]},
  { name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', best: '32.5 × 10',
    sets: [
      { type:'N', weight:'27.5', reps:'12', done:false, prev:'25 × 12'   },
      { type:'N', weight:'27.5', reps:'12', done:false, prev:'25 × 12'   },
      { type:'N', weight:'30',   reps:'10', done:false, prev:'27.5 × 10' },
    ]},
]

const EXERCISE_LIBRARY = [
  { name: 'Squat',            muscle: 'Quads',     equipment: 'Barbell' },
  { name: 'Deadlift',         muscle: 'Back',      equipment: 'Barbell' },
  { name: 'Pull-Up',          muscle: 'Back',      equipment: 'Bodyweight' },
  { name: 'Barbell Row',      muscle: 'Back',      equipment: 'Barbell' },
  { name: 'Incline Press',    muscle: 'Chest',     equipment: 'Barbell' },
  { name: 'Cable Fly',        muscle: 'Chest',     equipment: 'Cable' },
  { name: 'Lat Pulldown',     muscle: 'Back',      equipment: 'Cable' },
  { name: 'Seated Row',       muscle: 'Back',      equipment: 'Cable' },
  { name: 'Bicep Curl',       muscle: 'Biceps',    equipment: 'Dumbbell' },
  { name: 'Hammer Curl',      muscle: 'Biceps',    equipment: 'Dumbbell' },
  { name: 'Skullcrusher',     muscle: 'Triceps',   equipment: 'Barbell' },
  { name: 'Leg Press',        muscle: 'Quads',     equipment: 'Machine' },
  { name: 'Romanian Deadlift',muscle: 'Hamstrings',equipment: 'Barbell' },
  { name: 'Lateral Raise',    muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Face Pull',        muscle: 'Rear Delt', equipment: 'Cable' },
]

const WEIGHT_VALUES = Array.from({ length: 121 }, (_, i) => String(i * 2.5))
const REPS_VALUES   = Array.from({ length: 50  }, (_, i) => String(i + 1))

function fmt(s: number) {
  s = Math.max(0, Math.floor(s))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function ScrollPicker({ values, selected, onChange }: {
  values: string[]
  selected: string
  onChange: (v: string) => void
}) {
  const ref       = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const ITEM_H    = 44

  useEffect(() => {
    if (!ref.current) return
    const idx = Math.max(0, values.indexOf(selected))
    ref.current.scrollTop = idx * ITEM_H
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!ref.current) return
      const idx = Math.max(0, Math.min(values.length - 1, Math.round(ref.current.scrollTop / ITEM_H)))
      onChange(values[idx])
    }, 80)
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * 5, borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,.04)' }}>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          maskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)',
          WebkitMaskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)',
        }}
      >
        <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
        {values.map((v) => (
          <div
            key={v}
            style={{
              height: ITEM_H,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-doto)',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
              color: v === selected ? 'rgba(255,190,100,.95)' : 'rgba(255,255,255,.22)',
            }}
          >
            {v}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
      </div>
      <div style={{
        position: 'absolute', left: 10, right: 10,
        top: ITEM_H * 2, height: ITEM_H,
        borderRadius: 10,
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.1)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const { userId } = useAuth()
  const [workoutName, setWorkoutName]     = useState('Push Day')
  const [exercises, setExercises]         = useState<Exercise[]>(INITIAL_EXERCISES)
  const [sessionSecs, setSessionSecs]     = useState(0)
  const [focusedSet, setFocusedSet]       = useState<{ ei: number; si: number } | null>(null)
  const [setTimerRunning, setSetTimerRunning] = useState<string | null>(null)
  const [setTimerResults, setSetTimerResults] = useState<Record<string, number>>({})
  const [setElapsedLive, setSetElapsedLive]   = useState(0)
  const [restRemaining, setRestRemaining] = useState<Record<string, number>>({})
  const [restTotal, setRestTotal]         = useState<Record<string, number>>({})
  const [restRunning, setRestRunning]     = useState<Record<string, boolean>>({})
  const [showFinish, setShowFinish]       = useState(false)
  const [energy, setEnergy]               = useState(3)
  const [notes, setNotes]                 = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [showAddExercise, setShowAddExercise] = useState(false)

  const setElapsedRef   = useRef(0)
  const setRunningRef   = useRef<string | null>(null)
  const restRemRef      = useRef<Record<string, number>>({})
  const restTotRef      = useRef<Record<string, number>>({})
  const restRunningRef  = useRef<Record<string, boolean>>({})
  const sessionStartRef = useRef<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => {
      setSessionSecs(s => s + 1)
      if (setRunningRef.current) {
        setElapsedRef.current++
        setSetElapsedLive(setElapsedRef.current)
      }
      let changed = false
      const newRem = { ...restRemRef.current }
      const newTot = { ...restTotRef.current }
      const newRun = { ...restRunningRef.current }
      Object.keys(newRun).forEach(ei => {
        if (!newRun[ei] || !(newRem[ei] > 0)) return
        newRem[ei]--
        newTot[ei] = (newTot[ei] || 0) + 1
        if (newRem[ei] <= 0) newRun[ei] = false
        changed = true
      })
      if (changed) {
        restRemRef.current  = newRem
        restTotRef.current  = newTot
        restRunningRef.current = newRun
        setRestRemaining({ ...newRem })
        setRestTotal({ ...newTot })
        setRestRunning({ ...newRun })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Restore session state from localStorage (supports resume after navigating away)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Try resuming a saved session first
    const savedRaw = localStorage.getItem('gains_session_state')
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw) as { name: string; exercises: Exercise[]; sessionSecs: number }
        setWorkoutName(saved.name)
        setExercises(saved.exercises)
        setSessionSecs(saved.sessionSecs)
        sessionStartRef.current = new Date(Date.now() - saved.sessionSecs * 1000)
        return
      } catch {}
    }

    // Fresh start — read pending workout
    const raw = localStorage.getItem('gains_pending_workout')
    if (!raw) return
    try {
      const { templateName, exerciseNames } = JSON.parse(raw) as { templateName: string; exerciseNames: string[] }
      if (templateName) setWorkoutName(templateName)
      if (exerciseNames?.length) {
        const library = [...INITIAL_EXERCISES, ...EXERCISE_LIBRARY.map(e => ({
          name: e.name, muscle: e.muscle, equipment: e.equipment, best: '—',
          sets: [{ type: 'N' as const, weight: '0', reps: '8', done: false, prev: '—' }],
        }))]
        const mapped = exerciseNames.map(n => library.find(e => e.name.toLowerCase() === n.toLowerCase())).filter(Boolean) as Exercise[]
        if (mapped.length) setExercises(mapped)
      }
      // Mark session as active
      localStorage.setItem('gains_active_session', JSON.stringify({ startedAt: new Date().toISOString(), name: templateName || 'My Workout' }))
    } catch {}
  }, [])

  // Persist session state on every exercises change (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = setTimeout(() => {
      localStorage.setItem('gains_session_state', JSON.stringify({ name: workoutName, exercises, sessionSecs }))
    }, 800)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises])

  // Pick up exercises added from the workout page while session is active
  const checkAdditions = () => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('gains_session_additions')
    if (!raw) return
    try {
      const names: string[] = JSON.parse(raw)
      if (!names.length) return
      localStorage.removeItem('gains_session_additions')
      const library = [...INITIAL_EXERCISES, ...EXERCISE_LIBRARY.map(e => ({
        name: e.name, muscle: e.muscle, equipment: e.equipment, best: '—',
        sets: [{ type: 'N' as const, weight: '0', reps: '8', done: false, prev: '—' }],
      }))]
      setExercises(prev => {
        const toAdd = names
          .filter(n => !prev.some(e => e.name.toLowerCase() === n.toLowerCase()))
          .map(n => library.find(e => e.name.toLowerCase() === n.toLowerCase()))
          .filter(Boolean) as Exercise[]
        return toAdd.length ? [...prev, ...toAdd] : prev
      })
    } catch {}
  }

  useEffect(() => {
    checkAdditions()
    const handler = () => { if (document.visibilityState === 'visible') checkAdditions() }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSets     = exercises.reduce((s, e) => s + e.sets.length, 0)
  const completedSets = exercises.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0)
  const progress      = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const toggleDone = (ei: number, si: number) => {
    setExercises(ex => ex.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, done: !s.done }) }))
  }

  const addSet = (ei: number) => {
    setExercises(ex => ex.map((e, i) => {
      if (i !== ei) return e
      const last = e.sets[e.sets.length - 1]
      return { ...e, sets: [...e.sets, { ...last, done: false }] }
    }))
  }

  const removeSet = (ei: number, si: number) => {
    setExercises(ex => ex.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }))
    if (focusedSet?.ei === ei && focusedSet?.si === si) setFocusedSet(null)
  }

  const removeExercise = (ei: number) => {
    setExercises(ex => ex.filter((_, i) => i !== ei))
    if (focusedSet?.ei === ei) setFocusedSet(null)
    setDeleteConfirm(null)
  }

  const addExercise = (ex: typeof EXERCISE_LIBRARY[number]) => {
    setExercises(prev => [...prev, {
      name: ex.name, muscle: ex.muscle, equipment: ex.equipment, best: '—',
      sets: [{ type: 'N', weight: '0', reps: '8', done: false, prev: '—' }],
    }])
    setShowAddExercise(false)
  }

  const updateField = (ei: number, si: number, field: 'weight' | 'reps', val: string) => {
    setExercises(ex => ex.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }) }))
  }

  const startSetTimer = (ei: number, si: number) => {
    const key = `${ei}-${si}`
    setElapsedRef.current = 0
    setSetElapsedLive(0)
    setRunningRef.current = key
    setSetTimerRunning(key)
    setSetTimerResults(r => { const n = { ...r }; delete n[key]; return n })
  }

  const endSetTimer = (ei: number, si: number) => {
    const elapsed = setElapsedRef.current
    const key = `${ei}-${si}`
    setRunningRef.current = null
    setSetTimerRunning(null)
    setSetTimerResults(r => ({ ...r, [key]: elapsed }))
  }

  const addRest = (ei: number) => {
    const eis = String(ei)
    restRemRef.current[eis]  = (restRemRef.current[eis] || 0) + 45
    restRunningRef.current[eis] = true
    setRestRemaining(r => ({ ...r, [eis]: restRemRef.current[eis] }))
    setRestRunning(r => ({ ...r, [eis]: true }))
  }

  const cancelRest = (ei: number) => {
    const eis = String(ei)
    restRemRef.current[eis]    = 0
    restRunningRef.current[eis] = false
    setRestRemaining(r => ({ ...r, [eis]: 0 }))
    setRestRunning(r => ({ ...r, [eis]: false }))
  }

  const openSet  = (ei: number, si: number) => setFocusedSet({ ei, si })
  const closeSet = () => setFocusedSet(null)

  const fs        = focusedSet ? exercises[focusedSet.ei]?.sets[focusedSet.si] : null
  const fsKey     = focusedSet ? `${focusedSet.ei}-${focusedSet.si}` : ''
  const fsRunning = setTimerRunning === fsKey
  const fsResult  = fsKey ? setTimerResults[fsKey] : undefined
  const fsEis     = focusedSet ? String(focusedSet.ei) : ''
  const fsRestRem = focusedSet ? (restRemaining[fsEis] || 0) : 0
  const fsRestTot = focusedSet ? (restTotal[fsEis] || 0) : 0
  const fsRestRun = focusedSet ? !!restRunning[fsEis] : false

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      {/* Workout header */}
      <div className="relative z-10 flex-none px-5 pt-[10px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,.07)' }}
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="rgba(255,255,255,.6)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-bold tracking-[-0.4px] leading-[1.1]">{workoutName}</div>
            <div className="text-[11px] font-medium mt-[3px] tracking-[.2px]" style={{ color: 'rgba(255,150,80,.7)' }}>
              {exercises.length} exercises · {totalSets} sets
            </div>
          </div>
          <div className="font-doto font-bold text-[28px] tracking-[4px] flex-shrink-0" style={{ textShadow: '0 0 18px rgba(255,150,60,.45)' }}>
            {fmt(sessionSecs)}
          </div>
          <button
            onClick={() => setShowFinish(true)}
            className="px-[18px] py-[9px] rounded-[22px] border-none cursor-pointer text-[13px] font-bold tracking-[.8px] text-white flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#f96d45,#d83523)', boxShadow: '0 6px 16px -4px rgba(200,50,20,.55), inset 0 1px 0 rgba(255,255,255,.3)', fontFamily: 'inherit' }}
          >END</button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-[3px] rounded-[2px] overflow-hidden" style={{ background: 'rgba(255,255,255,.07)' }}>
          <div className="h-full rounded-[2px] transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#ff7a35,#e83a22)' }} />
        </div>
      </div>

      {/* Exercise list */}
      <div className="relative z-10 flex-1 overflow-y-auto mt-3" style={{ padding: '0 14px', paddingBottom: focusedSet ? 320 : 180 }}>
        {exercises.map((ex, ei) => {
          let setNum = 0
          return (
            <div key={ei} className="mb-[13px]">
              <div
                className="rounded-[22px] overflow-hidden"
                style={{
                  background: 'linear-gradient(157deg,rgba(255,238,224,.1) 0%,rgba(255,210,180,.04) 60%,rgba(255,196,166,.02) 100%)',
                  border: '1px solid rgba(255,255,255,.09)',
                }}
              >
                {/* Ex header */}
                <div className="px-4 pt-[14px] pb-[10px] flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] font-bold tracking-[-0.2px] truncate">{ex.name}</div>
                    <div className="flex items-center gap-[5px] mt-[6px] flex-wrap">
                      <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-[20px] whitespace-nowrap" style={{ background: 'rgba(255,110,45,.15)', color: 'rgba(255,160,100,.95)' }}>{ex.muscle}</span>
                      <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-[20px] whitespace-nowrap" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)' }}>{ex.equipment}</span>
                      {(restTotal[String(ei)] || 0) > 0 && (
                        <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-[20px] whitespace-nowrap" style={{ background: 'rgba(255,120,40,.1)', color: 'rgba(255,175,90,.8)' }}>
                          💤 {fmt(restTotal[String(ei)])} rest
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-[10px] font-medium tracking-[.5px] mb-[3px]" style={{ color: 'rgba(255,255,255,.28)' }}>Best</div>
                    <div className="text-[14px] font-bold tracking-[-0.2px]" style={{ color: 'rgba(255,160,90,.9)' }}>{ex.best}</div>
                    <div className="text-[11px] font-medium mt-[3px]" style={{ color: 'rgba(255,255,255,.28)' }}>{ex.sets.filter(s => s.done).length} / {ex.sets.length} sets</div>
                  </div>
                </div>

                {/* Table header */}
                <div className="h-[1px] mx-[14px]" style={{ background: 'rgba(255,255,255,.07)' }} />
                <div className="grid px-[14px] py-[6px] items-center text-[10px] font-medium tracking-[.5px]" style={{ gridTemplateColumns: '28px 1fr 56px 44px 44px 30px', gap: 4, color: 'rgba(255,255,255,.2)' }}>
                  <div className="text-center">Set</div><div className="pl-[2px]">Prev</div><div className="text-center">Kg</div><div className="text-center">Reps</div><div className="text-center">Time</div><div />
                </div>

                {/* Sets */}
                {ex.sets.map((set, si) => {
                  const n      = String(++setNum)
                  const key    = `${ei}-${si}`
                  const timerRes  = setTimerResults[key]
                  const isRunning = setTimerRunning === key
                  const isFocused = focusedSet?.ei === ei && focusedSet?.si === si
                  return (
                    <div key={si}>
                      <div
                        className="grid px-[14px] py-[6px] items-center cursor-pointer"
                        style={{ gridTemplateColumns: '28px 1fr 56px 44px 44px 30px', gap: 4, background: set.done ? 'rgba(255,110,45,.09)' : isFocused ? 'rgba(255,100,30,.06)' : '#1a1310' }}
                        onClick={() => openSet(ei, si)}
                      >
                        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-bold"
                          style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: isFocused ? '1.5px solid rgba(255,140,60,.8)' : '1.5px solid transparent' }}>
                          {n}
                        </div>
                        <div className="text-[12px] font-medium pl-[2px] truncate" style={{ color: 'rgba(255,255,255,.27)' }}>{set.prev}</div>
                        <div className="text-[14px] font-bold text-center tabular-nums" style={{ color: set.done ? 'rgba(255,160,90,.9)' : 'rgba(255,255,255,.7)' }}>{set.weight}</div>
                        <div className="text-[14px] font-bold text-center tabular-nums" style={{ color: set.done ? 'rgba(255,160,90,.9)' : 'rgba(255,255,255,.7)' }}>{set.reps}</div>
                        <div className={`font-doto text-[11px] font-bold text-center leading-none${isRunning ? ' set-dot-pulse' : ''}`} style={{ color: 'rgba(255,160,80,.6)', letterSpacing: .8 }}>
                          {timerRes !== undefined ? fmt(timerRes) : isRunning ? '●' : ''}
                        </div>
                        <div
                          onClick={e => { e.stopPropagation(); toggleDone(ei, si) }}
                          className="w-7 h-7 rounded-full flex items-center justify-center mx-auto flex-shrink-0 cursor-pointer"
                          style={{ border: set.done ? '2px solid #ff7a35' : '1.5px solid rgba(255,255,255,.2)', background: set.done ? '#ff7a35' : 'transparent' }}
                        >
                          {set.done && <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 12l5 5L20 7" /></svg>}
                        </div>
                      </div>
                      <div className="h-[1px] mx-3" style={{ background: 'rgba(255,255,255,.04)' }} />
                    </div>
                  )
                })}

                {/* Add set */}
                <div
                  onClick={() => addSet(ei)}
                  className="px-4 py-[10px] pb-[13px] flex items-center gap-[6px] cursor-pointer text-[13px] font-semibold tracking-[.2px]"
                  style={{ color: 'rgba(255,150,80,.6)' }}
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" style={{ display: 'block', flexShrink: 0 }}><path d="M12 5v14M5 12h14" /></svg>
                  Add Set
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAB */}

      {!focusedSet && (
        <div className="absolute z-10" style={{ bottom: 98, left: '50%', transform: 'translateX(-50%)' }}>
          <button
            onClick={() => setShowAddExercise(true)}
            className="cta-gradient flex items-center gap-2 px-7 py-[15px] rounded-[30px] border-none cursor-pointer text-[13px] font-bold tracking-[1.2px] text-white whitespace-nowrap"
            style={{ fontFamily: 'inherit' }}
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
            ADD EXERCISE
          </button>
        </div>
      )}

      <BottomNav active="workout" />

      {/* Focused set panel */}
      {focusedSet && fs && (
        <>
        <div
          className="absolute inset-0 z-[10]"
          style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={closeSet}
        />
        <div
          className="absolute bottom-0 left-0 right-0 z-[11] rounded-[26px_26px_0_0]"
          style={{ background: 'linear-gradient(165deg,#261610 0%,#160c09 55%,#0e0806 100%)', borderTop: '1px solid rgba(255,120,60,.2)', boxShadow: '0 -12px 40px -4px rgba(0,0,0,.5)' }}
        >
          <div className="px-[18px] pt-[10px]">
            <div className="w-8 h-[3px] rounded-[2px] mx-auto mb-3" style={{ background: 'rgba(255,255,255,.18)' }} />

            {/* Header */}
            <div className="flex items-center gap-[6px] mb-4">
              <div className="flex-1 min-w-0 text-[14px] font-bold tracking-[-0.15px] truncate" style={{ color: 'rgba(255,255,255,.9)' }}>
                {exercises[focusedSet.ei].name}
              </div>
              <span className="text-[13px] font-bold whitespace-nowrap flex-shrink-0 tracking-[.2px]" style={{ color: 'rgba(255,160,80,.95)' }}>
                SET {focusedSet.si + 1} / {exercises[focusedSet.ei].sets.length}
              </span>
              <button
                onClick={() => { setDeleteConfirm(focusedSet.ei); closeSet() }}
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 border-none"
                style={{ background: 'rgba(220,50,50,.12)', border: '1px solid rgba(220,60,60,.28)' }}
              >
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="rgba(255,100,100,.8)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
              <button onClick={closeSet} className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 border-none ml-[2px]" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Set timer */}
            <div className="flex items-center justify-between gap-[14px] mb-[14px]">
              <div className="min-w-0">
                <div
                  className="font-doto font-bold leading-none"
                  style={{ fontSize: 44, letterSpacing: 5, color: fsRunning ? 'rgba(255,150,60,.95)' : fsResult !== undefined ? 'rgba(90,215,110,.88)' : 'rgba(255,255,255,.32)', textShadow: fsRunning ? '0 0 28px rgba(255,120,40,.3)' : 'none' }}
                >
                  {fsRunning ? fmt(setElapsedLive) : fsResult !== undefined ? fmt(fsResult) : '00:00'}
                </div>
                <div className="text-[10px] font-medium tracking-[.5px] mt-1" style={{ color: 'rgba(255,255,255,.22)' }}>Set Timer</div>
              </div>
              <button
                onClick={() => focusedSet && (fsRunning ? endSetTimer(focusedSet.ei, focusedSet.si) : startSetTimer(focusedSet.ei, focusedSet.si))}
                className="px-5 py-3 rounded-[22px] border-none cursor-pointer text-[13px] font-bold tracking-[.5px] whitespace-nowrap flex-shrink-0"
                style={{
                  fontFamily: 'inherit',
                  color: fsRunning ? 'rgba(255,255,255,.75)' : '#fff',
                  background: fsRunning ? 'rgba(255,255,255,.1)' : 'linear-gradient(90deg,#f96d45,#d83523)',
                  boxShadow: fsRunning ? 'inset 0 1px 0 rgba(255,255,255,.08)' : '0 6px 18px -6px rgba(200,50,20,.5),inset 0 1px 0 rgba(255,255,255,.28)',
                }}
              >
                {fsRunning ? '■  END SET' : fsResult !== undefined ? '↺  RESTART' : '▶  START'}
              </button>
            </div>

            {/* Scroll pickers */}
            <div className="flex gap-[10px] mb-[14px]">
              {(['weight','reps'] as const).map(field => (
                <div key={field} className="flex-1">
                  <div className="text-[10px] font-medium tracking-[.5px] text-center mb-[5px]" style={{ color: 'rgba(255,255,255,.28)' }}>{field === 'weight' ? 'Kg' : 'Reps'}</div>
                  <ScrollPicker
                    values={field === 'weight' ? WEIGHT_VALUES : REPS_VALUES}
                    selected={fs[field]}
                    onChange={v => focusedSet && updateField(focusedSet.ei, focusedSet.si, field, v)}
                  />
                </div>
              ))}
            </div>

            <div className="h-[1px] mb-3" style={{ background: 'rgba(255,255,255,.07)' }} />

            {/* Rest row */}
            <div className="flex items-center gap-2 mb-[14px]">
              <button
                onClick={() => focusedSet && addRest(focusedSet.ei)}
                className="h-[46px] rounded-[14px] cursor-pointer text-[14px] font-bold tracking-[.2px] border-none"
                style={{ flex: '1 1 0', minWidth: 0, fontFamily: 'inherit', color: 'rgba(255,180,100,.92)', background: 'rgba(255,100,30,.09)', border: '1px solid rgba(255,130,40,.22)' }}
              >
                <span className="tabular-nums">{fsRestRun && fsRestRem > 0 ? `💤  ${fmt(fsRestRem)}` : '💤  REST +45s'}</span>
              </button>
              <button
                onClick={() => focusedSet && cancelRest(focusedSet.ei)}
                className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,40,40,.18), rgba(180,20,20,.08))',
                  border: '1px solid rgba(220,60,60,.45)',
                  opacity: fsRestRun && fsRestRem > 0 ? 1 : 0,
                  pointerEvents: fsRestRun && fsRestRem > 0 ? 'auto' : 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="rgba(255,100,100,.9)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <div className="text-[11px] font-medium whitespace-nowrap text-right flex-shrink-0 min-w-[54px]" style={{ color: 'rgba(255,255,255,.3)' }}>
                <span className="tabular-nums">{fsRestTot > 0 ? `${fmt(fsRestTot)} total` : '—'}</span>
              </div>
            </div>

            <div className="h-[1px] mb-[18px]" style={{ background: 'rgba(255,255,255,.06)' }} />
          </div>
        </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.68)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setDeleteConfirm(null)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[34px_34px_0_0] px-[22px] pb-[40px] pt-[18px]" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-9 h-1 rounded-[2px] mx-auto mb-5" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[17px] font-bold mb-1">Remove Exercise?</div>
            <div className="text-[13px] font-normal mb-6" style={{ color: 'rgba(255,255,255,.45)' }}>
              {exercises[deleteConfirm]?.name} will be removed from this session.
            </div>
            <button
              onClick={() => removeExercise(deleteConfirm)}
              className="w-full h-[52px] rounded-[26px] border-none cursor-pointer text-[14px] font-bold tracking-[.5px] text-white mb-[10px]"
              style={{ background: 'linear-gradient(90deg,#c82020,#9e1414)', boxShadow: '0 6px 18px -6px rgba(180,20,20,.55)', fontFamily: 'inherit' }}
            >Remove</button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="w-full h-[46px] rounded-[26px] cursor-pointer text-[14px] font-semibold bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.42)', fontFamily: 'inherit' }}
            >Cancel</button>
          </div>
        </>
      )}

      {/* Add exercise sheet */}
      {showAddExercise && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.68)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowAddExercise(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[34px_34px_0_0] pt-[18px]" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)', maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}>
            <div className="w-9 h-1 rounded-[2px] mx-auto mb-4" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="flex items-center justify-between px-[22px] mb-3">
              <div className="text-[17px] font-bold">Add Exercise</div>
              <button onClick={() => setShowAddExercise(false)} className="w-[28px] h-[28px] rounded-full flex items-center justify-center border-none cursor-pointer" style={{ background: 'rgba(255,255,255,.07)' }}>
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto pb-10 px-[14px]" style={{ flex: 1 }}>
              {EXERCISE_LIBRARY.map((ex) => (
                <div
                  key={ex.name}
                  onClick={() => addExercise(ex)}
                  className="flex items-center justify-between px-4 py-[13px] rounded-[16px] mb-[6px] cursor-pointer"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}
                >
                  <div>
                    <div className="text-[15px] font-semibold tracking-[-0.1px]">{ex.name}</div>
                    <div className="flex items-center gap-[5px] mt-[4px]">
                      <span className="text-[11px] font-medium px-[8px] py-[2px] rounded-[20px]" style={{ background: 'rgba(255,110,45,.12)', color: 'rgba(255,160,100,.9)' }}>{ex.muscle}</span>
                      <span className="text-[11px] font-medium px-[8px] py-[2px] rounded-[20px]" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.45)' }}>{ex.equipment}</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="rgba(255,150,80,.6)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block', flexShrink: 0 }}><path d="M12 5v14M5 12h14" /></svg>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Finish modal */}
      {showFinish && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.68)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowFinish(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[34px_34px_0_0] px-[22px] pb-[46px] pt-[18px]" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-9 h-1 rounded-[2px] mx-auto mb-5" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[21px] font-bold tracking-[-0.4px] mb-4">Finish Workout</div>

            <div className="flex gap-[10px] mb-4">
              <div className="flex-1 rounded-[16px] p-[13px]" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="text-[10px] font-medium tracking-[.5px] mb-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>Duration</div>
                <div className="font-doto text-[26px] font-bold tracking-[3px]">{fmt(sessionSecs)}</div>
              </div>
              <div className="flex-1 rounded-[16px] p-[13px]" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="text-[10px] font-medium tracking-[.5px] mb-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>Sets Done</div>
                <div className="text-[22px] font-bold mt-[2px]">{completedSets} / {totalSets}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-medium tracking-[.5px] mb-[9px]" style={{ color: 'rgba(255,255,255,.35)' }}>Energy Level</div>
              <div className="flex gap-[7px]">
                {['😴','😑','😊','💪','🔥'].map((emoji, i) => (
                  <div
                    key={i}
                    onClick={() => setEnergy(i + 1)}
                    className="flex-1 h-[42px] rounded-[12px] flex items-center justify-center cursor-pointer text-[18px]"
                    style={{ border: energy === i+1 ? '1.5px solid rgba(255,140,60,.8)' : '1.5px solid rgba(255,255,255,.1)', background: energy === i+1 ? 'rgba(255,110,45,.85)' : 'rgba(255,255,255,.06)' }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] font-medium tracking-[.5px] mb-2" style={{ color: 'rgba(255,255,255,.35)' }}>Session Notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="How did it feel?"
                rows={2}
                className="w-full rounded-[14px] text-white text-[14px] leading-[1.55] p-[11px]"
                style={{ fontFamily: 'inherit', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', resize: 'none' }}
              />
            </div>

            <button
              onClick={async () => {
                if (userId) {
                  try {
                    const dbExercises = await getExercises()
                    const sid = await createSession(userId, sessionStartRef.current)
                    for (let ei = 0; ei < exercises.length; ei++) {
                      const ex    = exercises[ei]
                      const dbEx  = dbExercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())
                      if (!dbEx) continue
                      const seId = await addExerciseToSession(sid, dbEx.id, ei)
                      for (let si = 0; si < ex.sets.length; si++) {
                        const set = ex.sets[si]
                        if (!set.done) continue
                        await saveSet(seId, {
                          set_number: si + 1,
                          set_type:   set.type,
                          weight_kg:  parseFloat(set.weight) || null,
                          reps:       parseInt(set.reps) || null,
                          completed:  true,
                        })
                      }
                    }
                    await finishSession(sid, { durationSecs: sessionSecs, energy, notes })
                  } catch (err) {
                    console.error('Failed to save workout:', err)
                  }
                }
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('gains_pending_workout')
                  localStorage.removeItem('gains_session_state')
                  localStorage.removeItem('gains_active_session')
                  localStorage.removeItem('gains_session_additions')
                }
                router.push('/')
              }}
              className="cta-gradient w-full h-[54px] rounded-[27px] border-none cursor-pointer text-[15px] font-bold tracking-[1.1px] text-white mb-[9px]"
              style={{ fontFamily: 'inherit' }}
            >SAVE WORKOUT</button>
            <button
              onClick={() => setShowFinish(false)}
              className="w-full h-[46px] rounded-[27px] cursor-pointer text-[14px] font-semibold bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.42)', fontFamily: 'inherit' }}
            >Discard</button>
          </div>
        </>
      )}
    </div>
  )
}
