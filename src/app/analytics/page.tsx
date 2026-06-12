'use client'
import { useState } from 'react'
import { StatusBar } from '@/components/StatusBar'
import { BottomNav } from '@/components/BottomNav'

type Period = 'week' | 'month' | 'year'
type ExName = 'Bench Press' | 'Squat' | 'Overhead Press' | 'Deadlift' | 'Pull-up'

const DATA: Record<Period, { workouts: string; hours: string; avg: string; streak: string; vol: string; cW: string; cR: string; cS: string; cA: string }> = {
  week:  { workouts:'4',   hours:'4.8',  avg:'1:12', streak:'12', vol:'4,820',  cW:'4',   cR:'3',  cS:'0',  cA:'0'  },
  month: { workouts:'16',  hours:'19.4', avg:'1:13', streak:'12', vol:'18,200', cW:'16',  cR:'8',  cS:'3',  cA:'1'  },
  year:  { workouts:'187', hours:'228',  avg:'1:11', streak:'12', vol:'214k',   cW:'187', cR:'96', cS:'24', cA:'11' },
}

const EXERCISE_DATA: Record<ExName, { data: number[]; min: number; max: number; pr: string; pct: string; start: string }> = {
  'Bench Press':    { data:[72.5,75,75,77.5,80,80,82.5,85],         min:68,  max:90,  pr:'85 kg',   pct:'+17.2%', start:'72.5 kg' },
  'Squat':          { data:[100,102.5,105,107.5,110,112.5,115,120], min:95,  max:125, pr:'120 kg',  pct:'+20%',   start:'100 kg'  },
  'Overhead Press': { data:[55,55,57.5,57.5,60,60,62.5,65],         min:50,  max:70,  pr:'65 kg',   pct:'+18.2%', start:'55 kg'   },
  'Deadlift':       { data:[130,135,137.5,140,145,147.5,150,155],   min:125, max:160, pr:'155 kg',  pct:'+19.2%', start:'130 kg'  },
  'Pull-up':        { data:[5,6,6,7,7,8,9,10],                      min:3,   max:12,  pr:'10 reps', pct:'+100%',  start:'5 reps'  },
}

const EXERCISES = Object.keys(EXERCISE_DATA) as ExName[]

function LineChart({ name }: { name: ExName }) {
  const ex = EXERCISE_DATA[name]
  const pts = ex.data.map((v, i) => ({
    x: 10 + i * 40,
    y: +(93 - ((v - ex.min) / (ex.max - ex.min)) * 55).toFixed(1),
  }))
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `M${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length-1].x},93 L10,93 Z`
  const lp = pts[pts.length - 1]
  const bx = Math.max(0, Math.min(lp.x - 23, 252))

  return (
    <svg viewBox="0 0 300 108" className="w-full block" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cgrd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,110,45,.28)" />
          <stop offset="100%" stopColor="rgba(255,110,45,0)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#cgrd)" />
      <polyline points={polyline} fill="none" stroke="#ff7a35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length-1 ? 5 : 3.5} fill="#ff7a35"
          {...(i === pts.length-1 ? { stroke: 'rgba(255,255,255,.3)', strokeWidth: 2 } : {})} />
      ))}
      <rect x={bx} y={lp.y - 20} width={46} height={16} rx={8} fill="rgba(255,100,40,.92)" />
      <text x={bx + 23} y={lp.y - 8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>PR {ex.pr}</text>
      <line x1={10} y1={93} x2={290} y2={93} stroke="rgba(255,255,255,.07)" strokeWidth={1} />
      <text x={4} y={93} fontSize={8} fill="rgba(255,255,255,.22)">{ex.min}</text>
      <text x={4} y={38} fontSize={8} fill="rgba(255,255,255,.22)">{ex.max}</text>
      <text x={10}  y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">W1</text>
      <text x={290} y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">W8</text>
    </svg>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod]               = useState<Period>('month')
  const [selectedEx, setSelectedEx]       = useState<ExName>('Bench Press')
  const [showPicker, setShowPicker]       = useState(false)

  const d  = DATA[period]
  const ex = EXERCISE_DATA[selectedEx]

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      <StatusBar />

      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between px-[22px] pt-[14px] pb-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] m-0">Analytics</h1>
        <div className="flex gap-[3px] rounded-[18px] p-[3px]" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
          {(['W','M','Y'] as const).map((p, i) => {
            const id = (['week','month','year'] as Period[])[i]
            const on = period === id
            return (
              <div
                key={p}
                onClick={() => setPeriod(id)}
                className="w-[34px] h-7 rounded-[14px] flex items-center justify-center text-[12px] font-bold cursor-pointer tracking-[.5px]"
                style={{ background: on ? 'rgba(255,120,60,.9)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)' }}
              >{p}</div>
            )
          })}
        </div>
      </div>

      {/* Scroll */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ padding: '16px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Summary cards */}
        <div className="grid gap-[10px] mb-[18px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label:'Workouts', value: d.workouts, sub:'total sessions', warm:false },
            { label:'Training',  value: d.hours,    sub:'total hours',    warm:false },
            { label:'Avg Duration', value: d.avg,   sub:'per session',    warm:false },
            { label:'Streak',    value: d.streak,   sub:'day streak',     warm:true  },
          ].map(card => (
            <div key={card.label} className="rounded-[20px] p-4" style={{ background: card.warm ? 'linear-gradient(157deg,rgba(255,150,60,.14),rgba(200,80,20,.05))' : 'linear-gradient(157deg,rgba(255,238,224,.12),rgba(255,210,180,.04))', border: card.warm ? '1px solid rgba(255,140,60,.2)' : '1px solid rgba(255,255,255,.09)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[.9px] mb-2" style={{ color: card.warm ? 'rgba(255,160,80,.5)' : 'rgba(255,255,255,.32)' }}>{card.label}</div>
              <div className="font-doto text-[36px] font-bold leading-none" style={{ letterSpacing: 3, color: card.warm ? 'rgba(255,200,120,.95)' : '#fff' }}>{card.value}</div>
              <div className="text-[11px] font-medium mt-[5px]" style={{ color: card.warm ? 'rgba(255,160,80,.4)' : 'rgba(255,255,255,.32)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Volume chart */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="text-[14px] font-bold tracking-[-0.2px]">Volume</div>
            <div className="text-[11px] font-bold" style={{ color: 'rgba(255,150,80,.8)' }}>
              {d.vol} kg <span className="font-normal" style={{ color: 'rgba(255,255,255,.3)' }}>this period</span>
            </div>
          </div>
          <svg viewBox="0 0 300 95" className="w-full block">
            <defs>
              <linearGradient id="bG1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff8050" /><stop offset="100%" stopColor="#e04020" />
              </linearGradient>
            </defs>
            {[{x:5,h:44},{x:43,h:54},{x:81,h:42},{x:119,h:59},{x:157,h:65},{x:195,h:53},{x:233,h:63},{x:271,h:65}].map((b, i) => (
              <rect key={i} x={b.x} y={85-b.h} width={24} height={b.h} rx={5} fill={i===7 ? 'url(#bG1)' : 'rgba(255,255,255,.1)'} />
            ))}
            {['W1','W2','W3','W4','W5','W6','W7','W8 ★'].map((l, i) => (
              <text key={l} x={17+i*38} y={91} textAnchor="middle" fontSize={8} fill={i===7 ? 'rgba(255,150,80,.9)' : 'rgba(255,255,255,.28)'}>{l}</text>
            ))}
          </svg>
        </div>

        {/* Exercise progress */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-center justify-between mb-[5px]">
            <div className="text-[14px] font-bold tracking-[-0.2px]">Exercise Progress</div>
            <div
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-[5px] text-[11px] font-semibold cursor-pointer px-[10px] py-1 rounded-[10px]"
              style={{ color: 'rgba(255,160,80,.9)', background: 'rgba(255,110,45,.1)', border: '1px solid rgba(255,110,45,.22)' }}
            >
              {selectedEx}
              <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M6 9l6 6 6-6" /></svg>
            </div>
          </div>
          <div className="text-[11px] mb-[14px]" style={{ color: 'rgba(255,255,255,.32)' }}>
            {ex.start} → {ex.pr} ({ex.pct})
          </div>
          <LineChart name={selectedEx} />
        </div>

        {/* Frequency */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="text-[14px] font-bold tracking-[-0.2px]">Frequency</div>
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,.35)' }}>sessions / week</div>
          </div>
          <svg viewBox="0 0 300 70" className="w-full block">
            <defs>
              <linearGradient id="bG2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff8050" /><stop offset="100%" stopColor="#e04020" />
              </linearGradient>
            </defs>
            {[{x:5,h:33},{x:43,h:44},{x:81,h:22},{x:119,h:55},{x:157,h:44},{x:195,h:33},{x:233,h:44},{x:271,h:44}].map((b, i) => (
              <rect key={i} x={b.x} y={65-b.h} width={24} height={b.h} rx={4} fill={i===7 ? 'url(#bG2)' : 'rgba(255,255,255,.1)'} />
            ))}
          </svg>
        </div>

        {/* Consistency */}
        <div className="glass rounded-[22px] p-4">
          <div className="text-[14px] font-bold tracking-[-0.2px] mb-[14px]">Consistency</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { label:'Workout', value: d.cW, warm:true },
              { label:'Rest',    value: d.cR, warm:false },
              { label:'Skipped', value: d.cS, faint:true },
              { label:'Away',    value: d.cA, faint:true },
            ].map(c => (
              <div key={c.label} className="text-center rounded-[14px] px-[6px] py-3" style={{ background: c.warm ? 'rgba(255,110,45,.1)' : c.faint ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.05)', border: c.warm ? '1px solid rgba(255,110,45,.18)' : c.faint ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(255,255,255,.07)' }}>
                <div className="font-doto text-[22px] font-bold leading-none" style={{ letterSpacing: 2, color: c.warm ? 'rgba(255,180,100,.95)' : c.faint ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.7)' }}>{c.value}</div>
                <div className="text-[9px] font-semibold uppercase tracking-[.4px] mt-1" style={{ color: c.warm ? 'rgba(255,160,80,.5)' : c.faint ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.28)' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="analytics" />

      {/* Exercise picker sheet */}
      {showPicker && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowPicker(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[30px_30px_0_0] px-5 pb-12 pt-4" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-8 h-1 rounded-[2px] mx-auto mb-[18px]" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[17px] font-extrabold tracking-[-0.3px] mb-[14px]">Select Exercise</div>
            {EXERCISES.map(name => {
              const on = name === selectedEx
              return (
                <div
                  key={name}
                  onClick={() => { setSelectedEx(name); setShowPicker(false) }}
                  className="flex items-center justify-between px-4 py-[13px] rounded-[16px] mb-2 cursor-pointer"
                  style={{ background: on ? 'rgba(255,110,45,.14)' : 'rgba(255,255,255,.04)', border: on ? '1px solid rgba(255,110,45,.3)' : '1px solid rgba(255,255,255,.06)' }}
                >
                  <div>
                    <div className="text-[15px] font-semibold tracking-[-0.1px]">{name}</div>
                    <div className="text-[11px] mt-[3px]" style={{ color: 'rgba(255,255,255,.38)' }}>Best: {EXERCISE_DATA[name].pr} ({EXERCISE_DATA[name].pct})</div>
                  </div>
                  {on && <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#ff7a35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M5 12l5 5L20 7" /></svg>}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
