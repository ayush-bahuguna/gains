'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

const TEMPLATES = [
  { name: 'Push',      count: '8 exercises',  gradient: 'linear-gradient(135deg,#8a1d44 0%,#c83020 100%)' },
  { name: 'Pull',      count: '7 exercises',  gradient: 'linear-gradient(135deg,#5a2208 0%,#a04018 100%)' },
  { name: 'Legs',      count: '9 exercises',  gradient: 'linear-gradient(135deg,#3a0d60 0%,#6a1845 100%)' },
  { name: 'Upper',     count: '10 exercises', gradient: 'linear-gradient(135deg,#1a1545 0%,#3a2468 100%)' },
  { name: 'Lower',     count: '8 exercises',  gradient: 'linear-gradient(135deg,#082418 0%,#184828 100%)' },
  { name: 'Full Body', count: '12 exercises', gradient: 'linear-gradient(135deg,#5a1a10 0%,#b84020 100%)' },
]

const ALL_EXERCISES = [
  { name: 'Bench Press',     muscle: 'Chest',      equipment: 'Barbell',    category: 'Chest'     },
  { name: 'Incline DB Press',muscle: 'Chest',      equipment: 'Dumbbells',  category: 'Chest'     },
  { name: 'Cable Fly',       muscle: 'Chest',      equipment: 'Cable',      category: 'Chest'     },
  { name: 'Overhead Press',  muscle: 'Shoulders',  equipment: 'Barbell',    category: 'Shoulders' },
  { name: 'Lateral Raise',   muscle: 'Shoulders',  equipment: 'Dumbbells',  category: 'Shoulders' },
  { name: 'Squat',           muscle: 'Quads',      equipment: 'Barbell',    category: 'Legs'      },
  { name: 'Romanian DL',     muscle: 'Hamstrings', equipment: 'Barbell',    category: 'Legs'      },
  { name: 'Leg Press',       muscle: 'Quads',      equipment: 'Machine',    category: 'Legs'      },
  { name: 'Pull-up',         muscle: 'Back',       equipment: 'Bodyweight', category: 'Back'      },
  { name: 'Barbell Row',     muscle: 'Back',       equipment: 'Barbell',    category: 'Back'      },
  { name: 'Lat Pulldown',    muscle: 'Back',       equipment: 'Cable',      category: 'Back'      },
  { name: 'Bicep Curl',      muscle: 'Biceps',     equipment: 'Dumbbells',  category: 'Arms'      },
  { name: 'Tricep Pushdown', muscle: 'Triceps',    equipment: 'Cable',      category: 'Arms'      },
  { name: 'Dip',             muscle: 'Triceps',    equipment: 'Bodyweight', category: 'Arms'      },
]
const RECENT    = [ALL_EXERCISES[0], ALL_EXERCISES[3], ALL_EXERCISES[5]]
const FAVORITES = [ALL_EXERCISES[8], ALL_EXERCISES[6], ALL_EXERCISES[0]]
const FILTERS   = ['All','Chest','Back','Shoulders','Legs','Arms']
const SECTIONS  = [{ id: 'recent', label: 'Recent' }, { id: 'favorites', label: 'Favourites' }, { id: 'all', label: 'Browse All' }]

export default function WorkoutPage() {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [filter, setFilter]   = useState('All')
  const [section, setSection] = useState('recent')
  const [todayLabel, setTodayLabel] = useState('')

  useEffect(() => {
    const d = new Date()
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    setTodayLabel(`${days[d.getDay()]} ${d.getDate()}`)
  }, [])

  const q = query.toLowerCase().trim()
  let list = ALL_EXERCISES
  if (q) {
    list = ALL_EXERCISES.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.muscle.toLowerCase().includes(q) ||
      e.equipment.toLowerCase().includes(q)
    )
    if (filter !== 'All') list = list.filter(e => e.category === filter)
  } else if (section === 'recent') {
    list = RECENT
  } else if (section === 'favorites') {
    list = FAVORITES
  } else {
    list = filter === 'All' ? ALL_EXERCISES : ALL_EXERCISES.filter(e => e.category === filter)
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
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ padding: '4px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Resume card */}
        <div
          onClick={() => router.push('/active-workout')}
          className="rounded-[22px] px-4 py-[14px] flex items-center justify-between cursor-pointer mb-5"
          style={{ background: 'linear-gradient(135deg, rgba(255,110,45,.14), rgba(200,40,20,.08))', border: '1px solid rgba(255,110,45,.3)' }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-[1.2px] uppercase mb-[5px]" style={{ color: 'rgba(255,160,80,.8)' }}>Active Session</div>
            <div className="text-[16px] font-bold tracking-[-0.2px]">Push Day</div>
            <div className="text-[12px] mt-[3px] font-medium" style={{ color: 'rgba(255,255,255,.4)' }}>18:42 elapsed</div>
          </div>
          <div className="flex items-center gap-2 px-4 py-[10px] rounded-[22px] text-[12px] font-bold tracking-[.5px] text-white" style={{ background: 'linear-gradient(90deg,#f96d45,#d83523)', boxShadow: '0 6px 16px -4px rgba(200,50,20,.55)' }}>
            RESUME
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </div>

        {/* Quick Start */}
        <div className="text-[11px] font-bold tracking-[1.2px] uppercase mb-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>Quick Start</div>
        <div className="flex gap-[11px] overflow-x-auto pb-1 mb-[22px]" style={{ marginLeft: -2, paddingLeft: 2 }}>
          {TEMPLATES.map(t => (
            <div
              key={t.name}
              onClick={() => router.push('/active-workout')}
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
              <div
                key={f}
                onClick={() => setFilter(f)}
                className="flex-none px-[14px] py-[6px] rounded-[20px] text-[12px] font-semibold cursor-pointer whitespace-nowrap"
                style={{ background: on ? 'rgba(255,120,60,.85)' : 'rgba(255,255,255,.06)', color: on ? '#fff' : 'rgba(255,255,255,.45)', border: on ? '1px solid rgba(255,150,80,.5)' : '1px solid rgba(255,255,255,.08)' }}
              >
                {f}
              </div>
            )
          })}
        </div>

        {/* Section tabs */}
        {!q && (
          <div className="flex gap-1 rounded-[16px] p-[3px] mb-[10px]" style={{ background: 'rgba(255,255,255,.05)' }}>
            {SECTIONS.map(s => {
              const on = section === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className="flex-1 h-8 rounded-[13px] flex items-center justify-center text-[12px] cursor-pointer"
                  style={{ background: on ? 'rgba(255,255,255,.12)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.38)', fontWeight: on ? 700 : 500 }}
                >
                  {s.label}
                </div>
              )
            })}
          </div>
        )}

        {/* Exercise list */}
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          {list.map((ex, i) => (
            <div
              key={ex.name + i}
              onClick={() => router.push('/active-workout')}
              className="flex items-center gap-3 px-[14px] py-[11px] cursor-pointer"
              style={{ borderBottom: i < list.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
            >
              <div className="w-[46px] h-[46px] rounded-[14px] flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,.07)' }}>
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="rgba(255,140,80,.55)" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><path d="M8 7.5v9M16 7.5v9M5 10v4M19 10v4M8 12h8" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold tracking-[-0.15px] truncate">{ex.name}</div>
                <div className="flex gap-[5px] mt-[5px] flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,100,45,.15)', color: 'rgba(255,160,100,.9)' }}>{ex.muscle}</span>
                  <span className="text-[10px] font-semibold px-2 py-[2px] rounded-[20px]" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.42)' }}>{ex.equipment}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round" style={{ display: 'block' }}><path d="M12 5v14M5 12h14" /></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="workout" />
    </div>
  )
}
