'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getExercises, getFavoriteIds, getRecentExerciseIds, toggleFavorite } from '@/lib/db/exercises'
import type { Database } from '@/types/database.types'

type ExRow = Database['public']['Tables']['exercises']['Row']

const TEMPLATES = [
  { name: 'Push',      count: '8 exercises',  gradient: 'linear-gradient(135deg,#8a1d44 0%,#c83020 100%)',  exercises: ['Bench Press','Incline DB Press','Cable Fly','Overhead Press','Lateral Raise','Tricep Pushdown','Dip','Incline Press'] },
  { name: 'Pull',      count: '7 exercises',  gradient: 'linear-gradient(135deg,#5a2208 0%,#a04018 100%)',  exercises: ['Pull-up','Barbell Row','Lat Pulldown','Bicep Curl','Hammer Curl','Seated Row','Romanian DL'] },
  { name: 'Legs',      count: '9 exercises',  gradient: 'linear-gradient(135deg,#3a0d60 0%,#6a1845 100%)',  exercises: ['Squat','Romanian DL','Leg Press','Romanian Deadlift'] },
  { name: 'Upper',     count: '10 exercises', gradient: 'linear-gradient(135deg,#1a1545 0%,#3a2468 100%)',  exercises: ['Bench Press','Overhead Press','Barbell Row','Bicep Curl','Tricep Pushdown','Lateral Raise'] },
  { name: 'Lower',     count: '8 exercises',  gradient: 'linear-gradient(135deg,#082418 0%,#184828 100%)',  exercises: ['Squat','Romanian DL','Leg Press'] },
  { name: 'Full Body', count: '12 exercises', gradient: 'linear-gradient(135deg,#5a1a10 0%,#b84020 100%)', exercises: ['Squat','Bench Press','Pull-up','Overhead Press','Romanian DL','Bicep Curl'] },
]

const FILTERS  = ['All','Chest','Back','Shoulders','Legs','Arms']
const SECTIONS = [{ id: 'recent', label: 'Recent' }, { id: 'favorites', label: 'Favourites' }, { id: 'all', label: 'Browse All' }]

function startWorkout(exerciseNames: string[], templateName: string, router: ReturnType<typeof useRouter>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gains_pending_workout', JSON.stringify({ templateName, exerciseNames }))
  }
  router.push('/active-workout')
}

export default function WorkoutPage() {
  const router = useRouter()
  const { userId } = useAuth()

  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState('All')
  const [section,  setSection]  = useState('recent')
  const [todayLabel, setTodayLabel] = useState('')

  const [allExercises, setAllExercises] = useState<ExRow[]>([])
  const [favoriteIds,  setFavoriteIds]  = useState<Set<string>>(new Set())
  const [recentIds,    setRecentIds]    = useState<string[]>([])

  useEffect(() => {
    const d = new Date()
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    setTodayLabel(`${days[d.getDay()]} ${d.getDate()}`)
  }, [])

  useEffect(() => {
    getExercises().then(setAllExercises)
  }, [])

  useEffect(() => {
    if (!userId) return
    getFavoriteIds(userId).then(ids => setFavoriteIds(new Set(ids)))
    getRecentExerciseIds(userId, 5).then(setRecentIds)
  }, [userId])

  const handleToggleFav = async (ex: ExRow) => {
    if (!userId) return
    const isFav = favoriteIds.has(ex.id)
    const next  = new Set(favoriteIds)
    isFav ? next.delete(ex.id) : next.add(ex.id)
    setFavoriteIds(next)
    await toggleFavorite(userId, ex.id, isFav)
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
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="relative z-10 flex-none flex items-center justify-between px-5 py-[10px]">
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

      {/* Scroll */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: '4px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Quick Start */}
        <div className="text-[11px] font-bold tracking-[1.2px] uppercase mb-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>Quick Start</div>
        <div className="flex gap-[11px] overflow-x-auto pb-1 mb-[22px]" style={{ marginLeft: -2, paddingLeft: 2 }}>
          {TEMPLATES.map(t => (
            <div
              key={t.name}
              onClick={() => startWorkout(t.exercises, t.name, router)}
              className="flex-none w-[116px] h-[152px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer"
              style={{ background: t.gradient, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 8px 20px -6px rgba(0,0,0,.4)' }}
            >
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="rgba(255,255,255,.65)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
              <div>
                <div className="text-[16px] font-extrabold tracking-[-0.3px] text-white leading-[1.1]">{t.name}</div>
                <div className="text-[11px] font-medium mt-[5px]" style={{ color: 'rgba(255,255,255,.42)' }}>{t.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Library header */}
        <div className="flex items-center justify-between mb-[11px]">
          <div className="text-[11px] font-bold tracking-[1.2px] uppercase" style={{ color: 'rgba(255,255,255,.35)' }}>Exercise Library</div>
          <div className="text-[11px] font-semibold" style={{ color: 'rgba(255,150,80,.7)' }}>{list.length} exercises</div>
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

        {/* Exercise list */}
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          {list.length === 0 && (
            <div className="px-[14px] py-[22px] text-center text-[14px]" style={{ color: 'rgba(255,255,255,.3)' }}>
              {allExercises.length === 0 ? 'Loading exercises…' : 'No exercises found'}
            </div>
          )}
          {list.map((ex, i) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 px-[14px] py-[11px]"
              style={{ borderBottom: i < list.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
            >
              <div className="w-[46px] h-[46px] rounded-[14px] flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,.07)' }}>
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(255,140,80,.55)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => startWorkout([ex.name], ex.name, router)}
              >
                <div className="text-[14px] font-bold tracking-[-0.15px] truncate">{ex.name}</div>
                <div className="flex gap-[5px] mt-[5px] flex-wrap">
                  {ex.muscle && <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,100,45,.15)', color: 'rgba(255,160,100,.9)' }}>{ex.muscle}</span>}
                  {ex.equipment && <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.42)' }}>{ex.equipment}</span>}
                </div>
              </div>
              {/* Favorite toggle */}
              <button
                onClick={() => handleToggleFav(ex)}
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
    </div>
  )
}
