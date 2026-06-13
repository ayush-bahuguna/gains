'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getExercises, getFavoriteIds, getRecentExerciseIds, toggleFavorite } from '@/lib/db/exercises'
import { getTemplates, createTemplate, deleteTemplate } from '@/lib/db/templates'
import type { Database } from '@/types/database.types'
import type { UserTemplate } from '@/lib/db/templates'

type ExRow = Database['public']['Tables']['exercises']['Row']

const DEFAULT_TEMPLATES = [
  {
    name: 'Push',
    gradient: 'linear-gradient(135deg,#8a1d44 0%,#c83020 100%)',
    exercises: ['Bench Press','Incline DB Press','Cable Fly','Overhead Press','Lateral Raise','Tricep Pushdown','Dip','Incline Press'],
  },
  {
    name: 'Pull',
    gradient: 'linear-gradient(135deg,#5a2208 0%,#a04018 100%)',
    exercises: ['Pull-up','Barbell Row','Lat Pulldown','Bicep Curl','Hammer Curl','Seated Row','Face Pull','Romanian DL'],
  },
  {
    name: 'Legs',
    gradient: 'linear-gradient(135deg,#3a0d60 0%,#6a1845 100%)',
    exercises: ['Squat','Romanian DL','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Calf Raise','Hip Thrust','Lunges'],
  },
  {
    name: 'Upper',
    gradient: 'linear-gradient(135deg,#1a1545 0%,#3a2468 100%)',
    exercises: ['Bench Press','Overhead Press','Barbell Row','Bicep Curl','Tricep Pushdown','Lateral Raise','Incline DB Press','Cable Fly','Face Pull','Seated Row'],
  },
  {
    name: 'Lower',
    gradient: 'linear-gradient(135deg,#082418 0%,#184828 100%)',
    exercises: ['Squat','Romanian DL','Leg Press','Leg Curl','Leg Extension','Calf Raise','Hip Thrust','Lunges'],
  },
  {
    name: 'Full Body',
    gradient: 'linear-gradient(135deg,#5a1a10 0%,#b84020 100%)',
    exercises: ['Squat','Bench Press','Pull-up','Overhead Press','Romanian DL','Bicep Curl','Barbell Row','Deadlift','Lateral Raise','Tricep Pushdown','Face Pull','Leg Press'],
  },
]

const FILTERS  = ['All','Chest','Back','Shoulders','Legs','Arms']
const SECTIONS = [{ id: 'recent', label: 'Recent' }, { id: 'favorites', label: 'Favourites' }, { id: 'all', label: 'Browse All' }]

const MUSCLE_COLORS: Record<string, string> = {
  Chest:      'linear-gradient(135deg,#8a1d44,#c83020)',
  Back:       'linear-gradient(135deg,#5a2208,#a04018)',
  Shoulders:  'linear-gradient(135deg,#1a1545,#3a2468)',
  Legs:       'linear-gradient(135deg,#3a0d60,#6a1845)',
  Quads:      'linear-gradient(135deg,#3a0d60,#6a1845)',
  Hamstrings: 'linear-gradient(135deg,#082418,#184828)',
  Arms:       'linear-gradient(135deg,#5a1a10,#b84020)',
  Biceps:     'linear-gradient(135deg,#5a1a10,#b84020)',
  Triceps:    'linear-gradient(135deg,#5a1a10,#b84020)',
  default:    'linear-gradient(135deg,#2a1a10,#4a2a18)',
}

function muscleGradient(muscle: string | null) {
  if (!muscle) return MUSCLE_COLORS.default
  for (const [k, v] of Object.entries(MUSCLE_COLORS)) {
    if (muscle.toLowerCase().includes(k.toLowerCase())) return v
  }
  return MUSCLE_COLORS.default
}

function fmt(s: number) {
  s = Math.max(0, Math.floor(s))
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function startWorkout(exerciseNames: string[], templateName: string, router: ReturnType<typeof useRouter>) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gains_session_state')
    localStorage.setItem('gains_pending_workout', JSON.stringify({ templateName, exerciseNames }))
  }
  router.push('/active-workout')
}

interface ActiveSession { startedAt: string; name: string }

export default function WorkoutPage() {
  const router    = useRouter()
  const { userId } = useAuth()

  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState('All')
  const [section,  setSection]  = useState('recent')
  const [todayLabel, setTodayLabel] = useState('')

  const [allExercises,  setAllExercises]  = useState<ExRow[]>([])
  const [favoriteIds,   setFavoriteIds]   = useState<Set<string>>(new Set())
  const [recentIds,     setRecentIds]     = useState<string[]>([])
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([])

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [elapsedSecs,   setElapsedSecs]   = useState(0)

  // Exercise detail bottom sheet
  const [selectedEx,     setSelectedEx]     = useState<ExRow | null>(null)
  const [addedToSession, setAddedToSession] = useState(false)

  // Create template flow
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [createStep,      setCreateStep]      = useState<1 | 2>(1)
  const [tplName,         setTplName]         = useState('')
  const [tplSelected,     setTplSelected]     = useState<Set<string>>(new Set())
  const [creating,        setCreating]        = useState(false)

  useEffect(() => {
    const d = new Date()
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    setTodayLabel(`${days[d.getDay()]} ${d.getDate()}`)
  }, [])

  useEffect(() => { getExercises().then(setAllExercises) }, [])

  useEffect(() => {
    if (!userId) return
    getFavoriteIds(userId).then(ids => setFavoriteIds(new Set(ids)))
    getRecentExerciseIds(userId, 5).then(setRecentIds)
    getTemplates(userId).then(setUserTemplates)
  }, [userId])

  // Detect active session from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('gains_active_session')
    if (raw) {
      try { setActiveSession(JSON.parse(raw)) } catch {}
    }
  }, [])

  // Live elapsed timer for active session banner
  useEffect(() => {
    if (!activeSession) return
    const tick = () => setElapsedSecs(Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeSession])

  const handleToggleFav = async (ex: ExRow, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) return
    const isFav = favoriteIds.has(ex.id)
    const next  = new Set(favoriteIds)
    isFav ? next.delete(ex.id) : next.add(ex.id)
    setFavoriteIds(next)
    await toggleFavorite(userId, ex.id, isFav)
  }

  const handleAddToSession = (ex: ExRow) => {
    const raw      = localStorage.getItem('gains_session_additions')
    const existing: string[] = raw ? JSON.parse(raw) : []
    if (!existing.includes(ex.name)) {
      localStorage.setItem('gains_session_additions', JSON.stringify([...existing, ex.name]))
    }
    setAddedToSession(true)
    setTimeout(() => setAddedToSession(false), 1500)
  }

  const handleCreateTemplate = async () => {
    if (!userId || !tplName.trim() || tplSelected.size === 0) return
    setCreating(true)
    try {
      const orderedIds = allExercises.filter(e => tplSelected.has(e.id)).map(e => e.id)
      await createTemplate(userId, tplName.trim(), orderedIds)
      const fresh = await getTemplates(userId)
      setUserTemplates(fresh)
      setShowCreateSheet(false)
      setTplName(''); setTplSelected(new Set()); setCreateStep(1)
    } finally { setCreating(false) }
  }

  const handleDeleteTemplate = async (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteTemplate(tplId)
    setUserTemplates(prev => prev.filter(t => t.id !== tplId))
  }

  const q = query.toLowerCase().trim()
  let list: ExRow[]
  if (q) {
    list = allExercises.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.muscle ?? '').toLowerCase().includes(q) ||
      (e.equipment ?? '').toLowerCase().includes(q)
    )
    if (filter !== 'All') list = list.filter(e => e.category === filter)
  } else if (section === 'recent') {
    const byId = new Map(allExercises.map(e => [e.id, e]))
    list = recentIds.map(id => byId.get(id)).filter(Boolean) as ExRow[]
    if (!list.length) list = allExercises.slice(0, 5)
  } else if (section === 'favorites') {
    list = allExercises.filter(e => favoriteIds.has(e.id))
  } else {
    list = filter === 'All' ? allExercises : allExercises.filter(e => e.category === filter)
  }

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* ── Sticky top ── */}
      <div className="relative z-10 flex-none">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-[10px]">
          <button
            onClick={() => router.back()}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,.08)', WebkitTapHighlightColor: 'transparent', border: 'none' }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="text-[17px] font-extrabold tracking-[-0.3px] m-0">Workouts</h1>
          <span className="text-[12px] font-semibold min-w-[38px] text-right" style={{ color: 'rgba(255,150,80,.7)' }}>{todayLabel}</span>
        </div>

        {/* Active session banner */}
        {activeSession && (
          <div className="mx-4 mb-3 rounded-[18px] flex items-center gap-3 px-4 py-[11px]"
            style={{ background: 'linear-gradient(90deg,rgba(255,100,30,.18),rgba(255,80,20,.1))', border: '1px solid rgba(255,130,50,.3)' }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff7a35', boxShadow: '0 0 6px rgba(255,120,50,.7)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold truncate">{activeSession.name}</div>
              <div className="font-doto text-[11px] font-bold tracking-[2px] mt-[2px]" style={{ color: 'rgba(255,160,80,.8)' }}>{fmt(elapsedSecs)}</div>
            </div>
            <button
              onClick={() => router.push('/active-workout')}
              className="px-4 py-[7px] rounded-[14px] text-[12px] font-bold border-none cursor-pointer whitespace-nowrap"
              style={{ background: 'linear-gradient(90deg,#f96d45,#d83523)', color: '#fff', fontFamily: 'inherit' }}
            >Resume →</button>
          </div>
        )}

        <div style={{ padding: '0 18px' }}>
          <div className="text-[11px] font-bold tracking-[1.2px] uppercase mb-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>Quick Start</div>

          {/* Horizontal template scroll */}
          <div className="flex gap-[11px] overflow-x-auto pb-[6px] mb-[22px]" style={{ marginLeft: -2, paddingLeft: 2 }}>
            {/* Empty start tile */}
            <div
              onClick={() => startWorkout([], 'My Workout', router)}
              className="flex-none w-[80px] h-[152px] rounded-[20px] p-3 flex flex-col justify-between cursor-pointer"
              style={{ background: 'rgba(255,255,255,.06)', border: '1.5px dashed rgba(255,255,255,.2)' }}
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
              <div>
                <div className="text-[13px] font-bold text-white leading-[1.2]">Empty</div>
                <div className="text-[10px] font-medium mt-[4px]" style={{ color: 'rgba(255,255,255,.32)' }}>Custom</div>
              </div>
            </div>

            {DEFAULT_TEMPLATES.map(t => (
              <div
                key={t.name}
                onClick={() => startWorkout(t.exercises, t.name, router)}
                className="flex-none w-[116px] h-[152px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer"
                style={{ background: t.gradient, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 8px 20px -6px rgba(0,0,0,.4)' }}
              >
                <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="rgba(255,255,255,.65)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
                <div>
                  <div className="text-[16px] font-extrabold tracking-[-0.3px] text-white leading-[1.1]">{t.name}</div>
                  <div className="text-[11px] font-medium mt-[5px]" style={{ color: 'rgba(255,255,255,.42)' }}>{t.exercises.length} exercises</div>
                </div>
              </div>
            ))}

            {userTemplates.map(t => (
              <div
                key={t.id}
                onClick={() => startWorkout(t.exercises.map(e => e.name), t.name, router)}
                className="flex-none w-[116px] h-[152px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer relative"
                style={{ background: 'linear-gradient(135deg,#2a3a5a,#1a2a4a)', border: '1px solid rgba(120,160,255,.25)', boxShadow: '0 8px 20px -6px rgba(0,0,0,.4)' }}
              >
                <div className="flex items-start justify-between">
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(140,180,255,.6)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
                  <button
                    onClick={e => handleDeleteTemplate(t.id, e)}
                    className="w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer"
                    style={{ background: 'rgba(0,0,0,.3)' }}
                  >
                    <svg viewBox="0 0 24 24" width={9} height={9} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div>
                  <div className="text-[15px] font-extrabold tracking-[-0.2px] text-white leading-[1.2]">{t.name}</div>
                  <div className="text-[11px] font-medium mt-[5px]" style={{ color: 'rgba(140,180,255,.5)' }}>{t.exercises.length} exercises</div>
                </div>
              </div>
            ))}
          </div>

          {/* Library header */}
          <div className="flex items-center justify-between mb-[11px]">
            <div className="text-[11px] font-bold tracking-[1.2px] uppercase" style={{ color: 'rgba(255,255,255,.35)' }}>Exercise Library</div>
            <div className="text-[11px] font-semibold" style={{ color: 'rgba(255,150,80,.7)' }}>{allExercises.length} exercises</div>
          </div>

          {/* Search */}
          <div className="relative mb-[11px]">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={2} strokeLinecap="round" className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ display: 'block' }}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full h-[42px] rounded-[14px] text-white text-[14px] font-medium pl-[40px] pr-[14px]"
              style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-[7px] overflow-x-auto pb-1 mb-[11px]">
            {FILTERS.map(f => {
              const on = filter === f
              return (
                <div key={f} onClick={() => setFilter(f)}
                  className="flex-none px-[14px] py-[6px] rounded-[20px] text-[12px] font-semibold cursor-pointer whitespace-nowrap"
                  style={{ background: on ? 'rgba(255,120,60,.85)' : 'rgba(255,255,255,.06)', color: on ? '#fff' : 'rgba(255,255,255,.45)', border: on ? '1px solid rgba(255,150,80,.5)' : '1px solid rgba(255,255,255,.08)' }}
                >{f}</div>
              )
            })}
          </div>

          {/* Section tabs */}
          {!q && (
            <div className="flex gap-1 rounded-[16px] p-[3px] mb-[10px]" style={{ background: 'rgba(255,255,255,.05)' }}>
              {SECTIONS.map(s => {
                const on = section === s.id
                return (
                  <div key={s.id} onClick={() => setSection(s.id)}
                    className="flex-1 h-8 rounded-[13px] flex items-center justify-center text-[12px] cursor-pointer"
                    style={{ background: on ? 'rgba(255,255,255,.12)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.38)', fontWeight: on ? 700 : 500 }}
                  >{s.label}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable exercise list ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ padding: '0 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          {list.length === 0 && (
            <div className="px-[14px] py-[22px] text-center text-[14px]" style={{ color: 'rgba(255,255,255,.3)' }}>
              {allExercises.length === 0 ? 'Loading exercises…' : 'No exercises found'}
            </div>
          )}
          {list.map((ex, i) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 px-[14px] py-[11px] cursor-pointer"
              style={{ borderBottom: i < list.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
              onClick={() => { setSelectedEx(ex); setAddedToSession(false) }}
            >
              <div className="w-[46px] h-[46px] rounded-[14px] flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,.07)' }}>
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(255,140,80,.55)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold tracking-[-0.15px] truncate">{ex.name}</div>
                <div className="flex gap-[5px] mt-[5px] flex-wrap">
                  {ex.muscle && <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,100,45,.15)', color: 'rgba(255,160,100,.9)' }}>{ex.muscle}</span>}
                  {ex.equipment && <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.42)' }}>{ex.equipment}</span>}
                </div>
              </div>
              <button
                onClick={e => handleToggleFav(ex, e)}
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-none cursor-pointer"
                style={{ background: favoriteIds.has(ex.id) ? 'rgba(255,110,45,.2)' : 'rgba(255,255,255,.07)', border: `1px solid ${favoriteIds.has(ex.id) ? 'rgba(255,140,60,.4)' : 'rgba(255,255,255,.1)'}` }}
              >
                <svg viewBox="0 0 24 24" width={13} height={13} fill={favoriteIds.has(ex.id) ? '#ff7a35' : 'none'} stroke={favoriteIds.has(ex.id) ? '#ff7a35' : 'rgba(255,255,255,.5)'} strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="workout" />

      {/* ── Create template FAB ── */}
      <button
        onClick={() => { setShowCreateSheet(true); setCreateStep(1); setTplName(''); setTplSelected(new Set()) }}
        className="absolute z-20 w-[52px] h-[52px] rounded-full flex items-center justify-center border-none cursor-pointer"
        style={{
          bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          background: 'linear-gradient(135deg,#f96d45,#d83523)',
          boxShadow: '0 6px 20px -4px rgba(200,50,20,.55)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={2.8} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {/* ── Exercise detail bottom sheet ── */}
      {selectedEx && (
        <>
          <div
            className="absolute inset-0 z-[30]"
            style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedEx(null)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-[31] rounded-[28px_28px_0_0]"
            style={{ background: 'linear-gradient(170deg,#241510,#160d0a)', borderTop: '1px solid rgba(255,255,255,.1)', boxShadow: '0 -12px 40px -4px rgba(0,0,0,.6)' }}
          >
            <div className="w-8 h-[3px] rounded-[2px] mx-auto mt-3 mb-4" style={{ background: 'rgba(255,255,255,.15)' }} />

            {/* Illustration */}
            <div className="mx-4 mb-4 h-[130px] rounded-[20px] flex items-center justify-center" style={{ background: muscleGradient(selectedEx.muscle) }}>
              <svg viewBox="0 0 24 24" width={52} height={52} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={1.5} strokeLinecap="round" style={{ display: 'block' }}>
                <path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" />
              </svg>
            </div>

            <div className="px-4 pb-[max(32px,env(safe-area-inset-bottom,32px))]">
              <div className="text-[22px] font-extrabold tracking-[-0.4px] mb-3">{selectedEx.name}</div>

              {/* Tags */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {selectedEx.muscle && (
                  <span className="text-[12px] font-semibold px-[12px] py-[5px] rounded-[20px]" style={{ background: 'rgba(255,100,45,.2)', color: 'rgba(255,170,100,.95)', border: '1px solid rgba(255,130,60,.25)' }}>
                    {selectedEx.muscle}
                  </span>
                )}
                {selectedEx.equipment && (
                  <span className="text-[12px] font-semibold px-[12px] py-[5px] rounded-[20px]" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.1)' }}>
                    {selectedEx.equipment}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-[14px] leading-[1.6] mb-5" style={{ color: 'rgba(255,255,255,.5)' }}>
                Builds strength in the {selectedEx.muscle ?? 'target muscles'} using {selectedEx.equipment ?? 'equipment'}. Focus on controlled movement through the full range of motion and proper form on every rep.
              </div>

              {/* Add to session (only when active) */}
              {activeSession && (
                <button
                  onClick={() => handleAddToSession(selectedEx)}
                  className="w-full h-[52px] rounded-[26px] border-none cursor-pointer text-[15px] font-bold tracking-[.5px] text-white mb-3 flex items-center justify-center gap-2"
                  style={{
                    background: addedToSession ? 'rgba(60,200,100,.2)' : 'linear-gradient(90deg,#f96d45,#d83523)',
                    boxShadow: addedToSession ? 'none' : '0 6px 18px -6px rgba(200,50,20,.5)',
                    border: addedToSession ? '1px solid rgba(80,220,120,.4)' : 'none',
                    fontFamily: 'inherit',
                    transition: 'background .25s',
                  }}
                >
                  {addedToSession ? (
                    <>
                      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="rgba(80,220,120,.9)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 12l5 5L20 7" /></svg>
                      <span style={{ color: 'rgba(120,240,160,.9)' }}>Added to Session</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
                      Add to Session
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => { setSelectedEx(null); startWorkout([selectedEx.name], selectedEx.name, router) }}
                className="w-full h-[48px] rounded-[24px] cursor-pointer text-[14px] font-semibold mb-3"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)', fontFamily: 'inherit' }}
              >
                Start Workout with This
              </button>

              <button
                onClick={e => handleToggleFav(selectedEx, e)}
                className="w-full h-[44px] rounded-[22px] cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-2 border-none"
                style={{ background: 'transparent', color: favoriteIds.has(selectedEx.id) ? 'rgba(255,130,60,.9)' : 'rgba(255,255,255,.35)', fontFamily: 'inherit' }}
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill={favoriteIds.has(selectedEx.id) ? 'rgba(255,120,50,.9)' : 'none'} stroke={favoriteIds.has(selectedEx.id) ? 'rgba(255,120,50,.9)' : 'rgba(255,255,255,.35)'} strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {favoriteIds.has(selectedEx.id) ? 'Remove from Favourites' : 'Add to Favourites'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create template bottom sheet ── */}
      {showCreateSheet && (
        <>
          <div
            className="absolute inset-0 z-[30]"
            style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            onClick={() => setShowCreateSheet(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-[31] rounded-[28px_28px_0_0]"
            style={{ background: 'linear-gradient(170deg,#241510,#160d0a)', borderTop: '1px solid rgba(255,255,255,.1)', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="w-8 h-[3px] rounded-[2px] mx-auto mt-3 mb-4" style={{ background: 'rgba(255,255,255,.15)' }} />

            <div className="flex items-center justify-between px-4 mb-4">
              <div className="text-[19px] font-bold tracking-[-0.3px]">
                {createStep === 1 ? 'New Template' : `Select Exercises (${tplSelected.size})`}
              </div>
              <button
                onClick={() => setShowCreateSheet(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,.07)' }}
              >
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {createStep === 1 ? (
              <div className="px-4 pb-8">
                <div className="text-[11px] font-bold uppercase tracking-[.9px] mb-2" style={{ color: 'rgba(255,255,255,.38)' }}>Template Name</div>
                <input
                  type="text"
                  value={tplName}
                  onChange={e => setTplName(e.target.value)}
                  placeholder="e.g. Back & Bi Day"
                  autoFocus
                  className="w-full h-[48px] rounded-[14px] text-white text-[15px] font-medium px-[14px] mb-5"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', fontFamily: 'inherit' }}
                  onKeyDown={e => { if (e.key === 'Enter' && tplName.trim()) setCreateStep(2) }}
                />
                <button
                  onClick={() => { if (tplName.trim()) setCreateStep(2) }}
                  className="cta-gradient w-full h-[52px] rounded-[26px] border-none cursor-pointer text-[15px] font-bold tracking-[.5px] text-white"
                  style={{ fontFamily: 'inherit', opacity: tplName.trim() ? 1 : 0.4 }}
                >Next →</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 pb-2">
                  {allExercises.map(ex => {
                    const on = tplSelected.has(ex.id)
                    return (
                      <div
                        key={ex.id}
                        onClick={() => {
                          const next = new Set(tplSelected)
                          on ? next.delete(ex.id) : next.add(ex.id)
                          setTplSelected(next)
                        }}
                        className="flex items-center gap-3 px-3 py-[10px] rounded-[14px] mb-[5px] cursor-pointer"
                        style={{ background: on ? 'rgba(255,110,45,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${on ? 'rgba(255,140,60,.35)' : 'rgba(255,255,255,.07)'}` }}
                      >
                        <div className="w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0"
                          style={{ background: on ? '#ff7a35' : 'rgba(255,255,255,.08)', border: on ? '2px solid #ff7a35' : '2px solid rgba(255,255,255,.15)' }}>
                          {on && <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 12l5 5L20 7" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold truncate">{ex.name}</div>
                          <div className="flex gap-1 mt-[3px]">
                            {ex.muscle && <span className="text-[10px] px-[6px] py-[1px] rounded-[10px]" style={{ background: 'rgba(255,100,45,.15)', color: 'rgba(255,160,100,.85)' }}>{ex.muscle}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 pb-[max(28px,env(safe-area-inset-bottom,28px))] pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <button
                    onClick={handleCreateTemplate}
                    disabled={tplSelected.size === 0 || creating}
                    className="cta-gradient w-full h-[52px] rounded-[26px] border-none cursor-pointer text-[15px] font-bold tracking-[.5px] text-white"
                    style={{ fontFamily: 'inherit', opacity: tplSelected.size > 0 && !creating ? 1 : 0.4 }}
                  >
                    {creating ? 'Creating…' : `Create Template (${tplSelected.size} exercises)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
