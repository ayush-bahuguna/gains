'use client'
import { useState } from 'react'
import { BottomNav } from '@/components/BottomNav'

const WORKOUTS = [
  { id:1,  date:'Today',        name:'Push Day',     duration:'42m',   sets:24, volume:'6,840',  exercises:['Bench Press','Overhead Press','Cable Fly'], tag:'chest' },
  { id:2,  date:'Yesterday',    name:'Pull Day',     duration:'38m',   sets:21, volume:'5,220',  exercises:['Pull-up','Barbell Row','Bicep Curl'],       tag:'back' },
  { id:3,  date:'Jun 10',       name:'Leg Day',      duration:'51m',   sets:27, volume:'12,600', exercises:['Squat','Romanian DL','Leg Press'],          tag:'legs' },
  { id:4,  date:'Jun 8',        name:'Upper Body',   duration:'46m',   sets:22, volume:'7,100',  exercises:['Bench Press','Overhead Press','Barbell Row'], tag:'upper' },
  { id:5,  date:'Jun 6',        name:'Full Body',    duration:'1h 4m', sets:30, volume:'9,800',  exercises:['Squat','Bench Press','Pull-up'],            tag:'full' },
  { id:6,  date:'Jun 4',        name:'Push Day',     duration:'39m',   sets:23, volume:'6,540',  exercises:['Incline DB Press','Lateral Raise','Dip'],   tag:'chest' },
  { id:7,  date:'Jun 2',        name:'Pull Day',     duration:'35m',   sets:19, volume:'4,900',  exercises:['Lat Pulldown','Barbell Row','Bicep Curl'],  tag:'back' },
  { id:8,  date:'May 31',       name:'Leg Day',      duration:'54m',   sets:28, volume:'13,200', exercises:['Squat','Leg Press','Romanian DL'],         tag:'legs' },
  { id:9,  date:'May 29',       name:'Push Day',     duration:'41m',   sets:24, volume:'6,780',  exercises:['Bench Press','Cable Fly','Overhead Press'], tag:'chest' },
  { id:10, date:'May 27',       name:'Full Body',    duration:'58m',   sets:29, volume:'9,400',  exercises:['Squat','Bench Press','Pull-up'],            tag:'full' },
]

const TAG_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  chest: { bg: 'rgba(200,50,20,.13)', border: 'rgba(220,80,40,.28)', dot: '#d85030' },
  back:  { bg: 'rgba(50,120,200,.12)', border: 'rgba(80,140,220,.28)', dot: '#4882d0' },
  legs:  { bg: 'rgba(100,50,200,.12)', border: 'rgba(130,80,220,.28)', dot: '#8848e0' },
  upper: { bg: 'rgba(200,160,20,.12)', border: 'rgba(220,180,40,.28)', dot: '#d8a820' },
  full:  { bg: 'rgba(20,160,100,.12)', border: 'rgba(40,180,120,.28)', dot: '#20b870' },
}

const PERIODS = ['All','Week','Month']

export default function HistoryPage() {
  const [period, setPeriod] = useState('All')
  const [expanded, setExpanded] = useState<number | null>(null)

  const now = new Date()
  const list = WORKOUTS.filter(w => {
    if (period === 'All') return true
    if (period === 'Week') return ['Today','Yesterday','Jun 10','Jun 8','Jun 6'].includes(w.date)
    if (period === 'Month') return !['May 27','May 29','May 31'].includes(w.date)
    return true
  })

  const totalSets    = list.reduce((a, w) => a + w.sets, 0)
  const totalVolume  = list.reduce((a, w) => a + parseInt(w.volume.replace(/,/g, '')), 0)
  const totalWorkouts = list.length

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between px-[22px] pt-[14px] pb-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] m-0">History</h1>
        <div className="flex gap-1 rounded-[16px] p-[3px]" style={{ background: 'rgba(255,255,255,.07)' }}>
          {PERIODS.map(p => {
            const on = period === p
            return (
              <div
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-[5px] rounded-[13px] text-[12px] font-bold cursor-pointer"
                style={{ background: on ? 'rgba(255,120,60,.85)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)' }}
              >{p}</div>
            )
          })}
        </div>
      </div>

      {/* Scroll */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ padding: '14px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Summary strip */}
        <div className="grid gap-[9px] mb-5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label:'Sessions', value:String(totalWorkouts) },
            { label:'Total Sets', value:String(totalSets) },
            { label:'Volume (kg)', value:(totalVolume/1000).toFixed(1)+'k' },
          ].map(s => (
            <div key={s.label} className="rounded-[18px] px-2 py-[11px] text-center" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="font-doto text-[22px] font-bold leading-none" style={{ letterSpacing: 2 }}>{s.value}</div>
              <div className="text-[9px] font-semibold mt-[5px] uppercase tracking-[.6px]" style={{ color: 'rgba(255,255,255,.32)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Workout list */}
        <div className="flex flex-col gap-[10px]">
          {list.map(w => {
            const c = TAG_COLORS[w.tag] ?? TAG_COLORS.full
            const open = expanded === w.id
            return (
              <div
                key={w.id}
                className="rounded-[22px] overflow-hidden cursor-pointer"
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

                  {/* Expanded detail */}
                  {open && (
                    <div className="mt-[12px] pt-[12px]" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                      <div className="flex gap-[14px] mb-[10px]">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[3px]" style={{ color: 'rgba(255,255,255,.32)' }}>Volume</div>
                          <div className="font-doto text-[18px] font-bold" style={{ letterSpacing: 1 }}>{w.volume} <span className="text-[10px] font-normal" style={{ color: 'rgba(255,255,255,.35)', fontFamily: 'inherit' }}>kg</span></div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[3px]" style={{ color: 'rgba(255,255,255,.32)' }}>Sets Done</div>
                          <div className="font-doto text-[18px] font-bold" style={{ letterSpacing: 1 }}>{w.sets}</div>
                        </div>
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[.8px] mb-[7px]" style={{ color: 'rgba(255,255,255,.32)' }}>Exercises</div>
                      <div className="flex flex-col gap-[5px]">
                        {w.exercises.map(ex => (
                          <div key={ex} className="flex items-center gap-[7px]">
                            <div className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: c.dot, opacity: .7 }} />
                            <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,.75)' }}>{ex}</span>
                          </div>
                        ))}
                      </div>
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
