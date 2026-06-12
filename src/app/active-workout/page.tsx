'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBar } from '@/components/StatusBar'
import { BottomNav } from '@/components/BottomNav'

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

function fmt(s: number) {
  s = Math.max(0, Math.floor(s))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES)
  const [sessionSecs, setSessionSecs] = useState(0)
  const [focusedSet, setFocusedSet] = useState<{ ei: number; si: number } | null>(null)
  const [setTimerRunning, setSetTimerRunning] = useState<string | null>(null)
  const [setTimerResults, setSetTimerResults] = useState<Record<string, number>>({})
  const [setElapsedLive, setSetElapsedLive] = useState(0)
  const [restRemaining, setRestRemaining] = useState<Record<string, number>>({})
  const [restTotal, setRestTotal]         = useState<Record<string, number>>({})
  const [restRunning, setRestRunning]     = useState<Record<string, boolean>>({})
  const [showFinish, setShowFinish] = useState(false)
  const [energy, setEnergy]         = useState(3)
  const [notes, setNotes]           = useState('')

  const setElapsedRef   = useRef(0)
  const setRunningRef   = useRef<string | null>(null)
  const restRemRef      = useRef<Record<string, number>>({})
  const restTotRef      = useRef<Record<string, number>>({})
  const restRunningRef  = useRef<Record<string, boolean>>({})

  // Master tick
  useEffect(() => {
    const id = setInterval(() => {
      setSessionSecs(s => s + 1)
      if (setRunningRef.current) {
        setElapsedRef.current++
        setSetElapsedLive(setElapsedRef.current)
      }
      // rest timers
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

  const openSet = (ei: number, si: number) => setFocusedSet({ ei, si })
  const closeSet = () => setFocusedSet(null)
  const navSet  = (dir: number) => {
    if (!focusedSet) return
    const newSi = focusedSet.si + dir
    const ex = exercises[focusedSet.ei]
    if (newSi < 0 || newSi >= ex.sets.length) return
    setFocusedSet({ ei: focusedSet.ei, si: newSi })
  }

  const fs     = focusedSet ? exercises[focusedSet.ei]?.sets[focusedSet.si] : null
  const fsKey  = focusedSet ? `${focusedSet.ei}-${focusedSet.si}` : ''
  const fsRunning = setTimerRunning === fsKey
  const fsResult  = fsKey ? setTimerResults[fsKey] : undefined
  const fsEis     = focusedSet ? String(focusedSet.ei) : ''
  const fsRestRem = focusedSet ? (restRemaining[fsEis] || 0) : 0
  const fsRestTot = focusedSet ? (restTotal[fsEis] || 0) : 0
  const fsRestRun = focusedSet ? !!restRunning[fsEis] : false

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      <StatusBar />

      {/* Workout header */}
      <div className="relative z-10 flex-none px-5 pt-[10px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[19px] font-extrabold tracking-[-0.4px] leading-[1.1]">Push Day</div>
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
            <div key={ei} className="mb-[13px] rounded-[22px] overflow-hidden" style={{ background: 'linear-gradient(157deg,rgba(255,238,224,.1) 0%,rgba(255,210,180,.04) 60%,rgba(255,196,166,.02) 100%)', border: '1px solid rgba(255,255,255,.09)' }}>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[.8px] mb-[3px]" style={{ color: 'rgba(255,255,255,.28)' }}>Best</div>
                  <div className="text-[14px] font-bold tracking-[-0.2px]" style={{ color: 'rgba(255,160,90,.9)' }}>{ex.best}</div>
                  <div className="text-[11px] font-medium mt-[3px]" style={{ color: 'rgba(255,255,255,.28)' }}>{ex.sets.filter(s => s.done).length} / {ex.sets.length} sets</div>
                </div>
              </div>

              {/* Table header */}
              <div className="h-[1px] mx-[14px]" style={{ background: 'rgba(255,255,255,.07)' }} />
              <div className="grid px-[14px] py-[6px] items-center text-[10px] font-bold tracking-[.8px] uppercase" style={{ gridTemplateColumns: '28px 1fr 56px 44px 44px 30px', gap: 4, color: 'rgba(255,255,255,.2)' }}>
                <div className="text-center">SET</div><div className="pl-[2px]">PREV</div><div className="text-center">KG</div><div className="text-center">REPS</div><div className="text-center">TIME</div><div />
              </div>

              {/* Sets */}
              {ex.sets.map((set, si) => {
                const n = set.type === 'W' ? 'W' : set.type === 'D' ? 'D' : String(++setNum)
                const key = `${ei}-${si}`
                const timerRes = setTimerResults[key]
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
                        style={{ background: set.type==='W' ? 'rgba(255,200,60,.15)' : set.type==='D' ? 'rgba(200,100,255,.15)' : 'rgba(255,255,255,.07)', color: set.type==='W' ? '#ffc840' : set.type==='D' ? '#c87bff' : 'rgba(255,255,255,.5)', border: isFocused ? '1.5px solid rgba(255,140,60,.8)' : '1.5px solid transparent' }}>
                        {n}
                      </div>
                      <div className="text-[12px] font-medium pl-[2px] truncate" style={{ color: 'rgba(255,255,255,.27)' }}>{set.prev}</div>
                      <div className="h-[34px] rounded-[10px] flex items-center justify-center text-[14px] font-bold" style={{ border: set.done ? '1px solid rgba(255,110,45,.28)' : '1px solid rgba(255,255,255,.1)', background: set.done ? 'rgba(255,110,45,.08)' : 'rgba(255,255,255,.05)' }}>{set.weight}</div>
                      <div className="h-[34px] rounded-[10px] flex items-center justify-center text-[14px] font-bold" style={{ border: set.done ? '1px solid rgba(255,110,45,.28)' : '1px solid rgba(255,255,255,.1)', background: set.done ? 'rgba(255,110,45,.08)' : 'rgba(255,255,255,.05)' }}>{set.reps}</div>
                      <div className="font-doto text-[11px] font-bold text-center leading-none" style={{ color: 'rgba(255,160,80,.6)', letterSpacing: .8 }}>
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
          )
        })}
      </div>

      {/* FAB */}
      {!focusedSet && (
        <div className="absolute z-10" style={{ bottom: 98, left: '50%', transform: 'translateX(-50%)' }}>
          <button className="cta-gradient flex items-center gap-2 px-7 py-[15px] rounded-[30px] border-none cursor-pointer text-[13px] font-bold tracking-[1.2px] text-white whitespace-nowrap" style={{ fontFamily: 'inherit' }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
            ADD EXERCISE
          </button>
        </div>
      )}

      <BottomNav active="workout" />

      {/* Focused set panel */}
      {focusedSet && fs && (
        <div
          className="absolute bottom-0 left-0 right-0 z-[9] rounded-[26px_26px_0_0]"
          style={{ background: 'linear-gradient(165deg,rgba(38,22,14,0.92) 0%,rgba(22,12,9,0.95) 55%,rgba(14,8,6,0.97) 100%)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderTop: '1px solid rgba(255,120,60,.2)', boxShadow: '0 -12px 40px -4px rgba(0,0,0,.5)' }}
        >
          <div className="px-[18px] pt-[10px]">
            <div className="w-8 h-[3px] rounded-[2px] mx-auto mb-3" style={{ background: 'rgba(255,255,255,.18)' }} />

            {/* Header */}
            <div className="flex items-center gap-[6px] mb-4">
              <div className="flex-1 min-w-0 text-[14px] font-bold tracking-[-0.15px] truncate" style={{ color: 'rgba(255,255,255,.9)' }}>
                {exercises[focusedSet.ei].name}
              </div>
              <button onClick={() => navSet(-1)} className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 border-none" style={{ background: 'rgba(255,255,255,.07)', opacity: focusedSet.si > 0 ? 1 : 0.22 }}>
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="text-[13px] font-bold whitespace-nowrap flex-shrink-0 tracking-[.2px]" style={{ color: 'rgba(255,160,80,.95)' }}>
                SET {focusedSet.si + 1} / {exercises[focusedSet.ei].sets.length}
              </span>
              <button onClick={() => navSet(1)} className="w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 border-none" style={{ background: 'rgba(255,255,255,.07)', opacity: focusedSet.si < exercises[focusedSet.ei].sets.length - 1 ? 1 : 0.22 }}>
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M9 18l6-6-6-6" /></svg>
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
                <div className="text-[10px] font-bold tracking-[.9px] uppercase mt-1" style={{ color: 'rgba(255,255,255,.22)' }}>SET TIMER</div>
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

            {/* Weight / Reps inputs */}
            <div className="flex gap-[10px] mb-[14px]">
              {(['weight','reps'] as const).map(field => (
                <div key={field} className="flex-1">
                  <div className="text-[10px] font-bold tracking-[.9px] uppercase text-center mb-[5px]" style={{ color: 'rgba(255,255,255,.28)' }}>{field === 'weight' ? 'KG' : 'REPS'}</div>
                  <input
                    type="number"
                    value={fs[field]}
                    onChange={e => focusedSet && updateField(focusedSet.ei, focusedSet.si, field, e.target.value)}
                    className="w-full h-[58px] rounded-[14px] text-center font-doto font-bold text-white"
                    style={{ fontSize: 30, letterSpacing: 2, border: '1px solid rgba(255,255,255,.11)', background: 'rgba(255,255,255,.07)', fontFamily: 'var(--font-doto)' }}
                  />
                </div>
              ))}
            </div>

            <div className="h-[1px] mb-3" style={{ background: 'rgba(255,255,255,.07)' }} />

            {/* Rest row */}
            <div className="flex items-center gap-2 mb-[14px]">
              <button
                onClick={() => focusedSet && addRest(focusedSet.ei)}
                className="flex-1 h-[46px] rounded-[14px] cursor-pointer text-[14px] font-bold tracking-[.2px] border-none"
                style={{ fontFamily: 'inherit', color: 'rgba(255,180,100,.92)', background: 'rgba(255,100,30,.09)', border: '1px solid rgba(255,130,40,.22)' }}
              >
                {fsRestRun && fsRestRem > 0 ? `💤  ${fmt(fsRestRem)}` : '💤  REST +45s'}
              </button>
              {fsRestRun && fsRestRem > 0 && (
                <button onClick={() => focusedSet && cancelRest(focusedSet.ei)} className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 border-none cursor-pointer" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                  <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
              <div className="text-[11px] font-medium whitespace-nowrap text-right flex-shrink-0 min-w-[54px]" style={{ color: 'rgba(255,255,255,.3)' }}>
                {fsRestTot > 0 ? `${fmt(fsRestTot)} total` : '—'}
              </div>
            </div>

            <div className="h-[1px] mb-3" style={{ background: 'rgba(255,255,255,.06)' }} />

            {/* Mark done */}
            <div
              onClick={() => focusedSet && toggleDone(focusedSet.ei, focusedSet.si)}
              className="flex items-center gap-[10px] cursor-pointer pb-[100px]"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: fs.done ? '2px solid #ff7a35' : '1.5px solid rgba(255,255,255,.22)', background: fs.done ? '#ff7a35' : 'transparent' }}>
                {fs.done && <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 12l5 5L20 7" /></svg>}
              </div>
              <div className="text-[13px] font-semibold tracking-[.1px]" style={{ color: fs.done ? 'rgba(255,170,90,.9)' : 'rgba(255,255,255,.45)' }}>
                {fs.done ? 'Set Marked Done ✓' : 'Mark Set Done'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish modal */}
      {showFinish && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.68)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowFinish(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[34px_34px_0_0] px-[22px] pb-[46px] pt-[18px]" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-9 h-1 rounded-[2px] mx-auto mb-5" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[21px] font-extrabold tracking-[-0.4px] mb-4">Finish Workout</div>

            <div className="flex gap-[10px] mb-4">
              <div className="flex-1 rounded-[16px] p-[13px]" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="text-[10px] font-semibold uppercase tracking-[.8px] mb-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>Duration</div>
                <div className="font-doto text-[26px] font-bold tracking-[3px]">{fmt(sessionSecs)}</div>
              </div>
              <div className="flex-1 rounded-[16px] p-[13px]" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="text-[10px] font-semibold uppercase tracking-[.8px] mb-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>Sets Done</div>
                <div className="text-[22px] font-bold mt-[2px]">{completedSets} / {totalSets}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-[.8px] mb-[9px]" style={{ color: 'rgba(255,255,255,.35)' }}>Energy Level</div>
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
              <div className="text-[10px] font-bold uppercase tracking-[.8px] mb-2" style={{ color: 'rgba(255,255,255,.35)' }}>Session Notes</div>
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
              onClick={() => router.push('/')}
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
