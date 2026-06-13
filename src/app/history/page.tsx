'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getHistory, type HistorySession } from '@/lib/db/workouts'

const TAG_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  chest: { bg: 'rgba(200,50,20,.13)',   border: 'rgba(220,80,40,.28)',   dot: '#d85030' },
  back:  { bg: 'rgba(50,120,200,.12)',  border: 'rgba(80,140,220,.28)',  dot: '#4882d0' },
  legs:  { bg: 'rgba(100,50,200,.12)',  border: 'rgba(130,80,220,.28)',  dot: '#8848e0' },
  upper: { bg: 'rgba(200,160,20,.12)',  border: 'rgba(220,180,40,.28)',  dot: '#d8a820' },
  full:  { bg: 'rgba(20,160,100,.12)',  border: 'rgba(40,180,120,.28)',  dot: '#20b870' },
}

const CATEGORY_TAG: Record<string, string> = {
  Chest: 'chest', Back: 'back', Legs: 'legs', Shoulders: 'upper', Arms: 'upper',
}

const PERIODS = ['All', 'Week', 'Month']

function fmt(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function relativeDate(iso: string): string {
  const d     = new Date(iso)
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day   = new Date(d.getFullYear(),  d.getMonth(),  d.getDate())
  const diff  = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function deriveTag(exercises: string[]): string {
  const counts: Record<string, number> = {}
  exercises.forEach(name => {
    const cat = CATEGORY_TAG[name] // rough heuristic by name won't work — use category
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1
  })
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return dominant?.[0] ?? 'full'
}

function deriveTagFromCategories(categories: (string | null)[]): string {
  const counts: Record<string, number> = {}
  categories.forEach(c => {
    if (!c) return
    const tag = CATEGORY_TAG[c] ?? 'full'
    counts[tag] = (counts[tag] ?? 0) + 1
  })
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return dominant?.[0] ?? 'full'
}

const TAG_NAME: Record<string, string> = {
  chest: 'Push Day', back: 'Pull Day', legs: 'Leg Day', upper: 'Upper Body', full: 'Full Body',
}

type WorkoutItem = {
  id: string
  date: string
  name: string
  duration: string
  sets: number
  volume: number
  exercises: string[]
  tag: string
}

function sessionToItem(s: HistorySession): WorkoutItem {
  const ses = s.session_exercises ?? []
  const exNames  = ses
    .sort((a, b) => a.order_index - b.order_index)
    .map(se => se.exercises?.name ?? '')
    .filter(Boolean)
  const categories = ses.map(se => se.exercises?.category ?? null)
  const tag    = deriveTagFromCategories(categories)
  const volume = ses.flatMap(se => se.sets)
    .filter(set => set.completed)
    .reduce((acc, set) => acc + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)
  const completedSets = ses.flatMap(se => se.sets).filter(set => set.completed).length

  return {
    id:       s.id,
    date:     relativeDate(s.started_at),
    name:     TAG_NAME[tag] ?? 'Workout',
    duration: s.duration_secs ? fmt(s.duration_secs) : '—',
    sets:     completedSets,
    volume:   Math.round(volume),
    exercises: exNames.slice(0, 4),
    tag,
  }
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); mon.setHours(0,0,0,0)
  return d >= mon
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso), now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export default function HistoryPage() {
  const { userId }  = useAuth()
  const [period, setPeriod]     = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [items, setItems]       = useState<WorkoutItem[]>([])

  useEffect(() => {
    if (!userId) return
    getHistory(userId).then(sessions => setItems(sessions.map(sessionToItem)))
  }, [userId])

  const list = items.filter(w => {
    if (period === 'Week')  return w.date === 'Today' || w.date === 'Yesterday' || isThisWeek(w.date)
    if (period === 'Month') return isThisMonth(w.date)
    return true
  })

  const totalSets    = list.reduce((a, w) => a + w.sets, 0)
  const totalVolume  = list.reduce((a, w) => a + w.volume, 0)
  const totalWorkouts = list.length

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between px-[22px] pt-[14px] pb-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] m-0">History</h1>
        <div className="flex gap-1 rounded-[16px] p-[3px]" style={{ background: 'rgba(255,255,255,.07)' }}>
          {PERIODS.map(p => {
            const on = period === p
            return (
              <div key={p} onClick={() => setPeriod(p)}
                className="px-3 py-[5px] rounded-[13px] text-[12px] font-bold cursor-pointer"
                style={{ background: on ? 'rgba(255,120,60,.85)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)' }}
              >{p}</div>
            )
          })}
        </div>
      </div>

      {/* Scroll */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: '14px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Summary strip */}
        <div className="grid gap-[9px] mb-5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label:'Sessions',   value: String(totalWorkouts) },
            { label:'Total Sets', value: String(totalSets) },
            { label:'Volume (kg)',value: totalVolume >= 1000 ? (totalVolume/1000).toFixed(1)+'k' : String(totalVolume) },
          ].map(s => (
            <div key={s.label} className="rounded-[18px] px-2 py-[11px] text-center" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="font-doto text-[22px] font-bold leading-none" style={{ letterSpacing: 2 }}>{s.value}</div>
              <div className="text-[9px] font-semibold mt-[5px] uppercase tracking-[.6px]" style={{ color: 'rgba(255,255,255,.32)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {list.length === 0 && (
          <div className="text-center mt-16" style={{ color: 'rgba(255,255,255,.3)' }}>
            <div className="text-[15px] font-semibold mb-1">No workouts yet</div>
            <div className="text-[13px]">Complete a workout to see it here</div>
          </div>
        )}

        {/* Workout list */}
        <div className="flex flex-col gap-[10px]">
          {list.map(w => {
            const c    = TAG_COLORS[w.tag] ?? TAG_COLORS.full
            const open = expanded === w.id
            return (
              <div key={w.id} className="rounded-[22px] overflow-hidden cursor-pointer"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
                onClick={() => setExpanded(open ? null : w.id)}
              >
                <div className="px-4 py-[13px]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: c.dot }} />
                      <div>
                        <div className="text-[15px] font-extrabold tracking-[-0.3px] leading-tight">{w.name}</div>
                        <div className="text-[12px] mt-[3px] font-medium" style={{ color: 'rgba(255,255,255,.42)' }}>{w.date}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="font-doto text-[15px] font-bold" style={{ letterSpacing: 1 }}>{w.duration}</div>
                      <div className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,.38)' }}>{w.sets} sets</div>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-[12px] pt-[12px]" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                      <div className="flex gap-[14px] mb-[10px]">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[3px]" style={{ color: 'rgba(255,255,255,.32)' }}>Volume</div>
                          <div className="font-doto text-[18px] font-bold" style={{ letterSpacing: 1 }}>
                            {w.volume >= 1000 ? `${(w.volume/1000).toFixed(1)}k` : w.volume}{' '}
                            <span className="text-[10px] font-normal" style={{ color: 'rgba(255,255,255,.35)', fontFamily: 'inherit' }}>kg</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[3px]" style={{ color: 'rgba(255,255,255,.32)' }}>Sets Done</div>
                          <div className="font-doto text-[18px] font-bold" style={{ letterSpacing: 1 }}>{w.sets}</div>
                        </div>
                      </div>
                      {w.exercises.length > 0 && (
                        <>
                          <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[7px]" style={{ color: 'rgba(255,255,255,.32)' }}>Exercises</div>
                          <div className="flex flex-col gap-[5px]">
                            {w.exercises.map(ex => (
                              <div key={ex} className="flex items-center gap-[7px]">
                                <div className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: c.dot, opacity: .7 }} />
                                <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,.75)' }}>{ex}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav active="history" />
    </div>
  )
}
