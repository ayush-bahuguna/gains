'use client'
import { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/BottomNav'

type Period = 'week' | 'month' | 'year'
type ExName = 'Bench Press' | 'Squat' | 'Overhead Press' | 'Deadlift' | 'Pull-up'

const DATA: Record<Period, { workouts: string; hours: string; avg: string; streak: string; vol: string; cW: string; cSk: string; cSi: string; cVa: string }> = {
  week:  { workouts:'4',   hours:'4.8',  avg:'1:12', streak:'12', vol:'4,820',  cW:'4',   cSk:'0',  cSi:'1',  cVa:'0' },
  month: { workouts:'16',  hours:'19.4', avg:'1:13', streak:'12', vol:'18,200', cW:'16',  cSk:'3',  cSi:'2',  cVa:'1' },
  year:  { workouts:'187', hours:'228',  avg:'1:11', streak:'12', vol:'214k',   cW:'187', cSk:'24', cSi:'12', cVa:'5' },
}

const BAR_DATA: Record<Period, {
  vol:  { label: string; value: number }[]
  freq: { label: string; value: number }[]
}> = {
  week: {
    vol:  [
      { label: 'Mon', value: 3200 }, { label: 'Tue', value: 0 },
      { label: 'Wed', value: 4800 }, { label: 'Thu', value: 0 },
      { label: 'Fri', value: 5100 }, { label: 'Sat', value: 2900 },
      { label: 'Sun', value: 0 },
    ],
    freq: [
      { label: 'Mon', value: 1 }, { label: 'Tue', value: 0 },
      { label: 'Wed', value: 1 }, { label: 'Thu', value: 0 },
      { label: 'Fri', value: 1 }, { label: 'Sat', value: 1 },
      { label: 'Sun', value: 0 },
    ],
  },
  month: {
    vol:  [
      { label: 'W1', value: 18200 }, { label: 'W2', value: 16800 },
      { label: 'W3', value: 21400 }, { label: 'W4', value: 19600 },
      { label: 'W5', value: 14200 },
    ],
    freq: [
      { label: 'W1', value: 4 }, { label: 'W2', value: 3 },
      { label: 'W3', value: 5 }, { label: 'W4', value: 4 },
      { label: 'W5', value: 2 },
    ],
  },
  year: {
    vol:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            .map((label, i) => ({ label, value: [12000,13500,14200,15800,16400,15200,17800,18200,17400,19200,18800,21400][i] })),
    freq: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            .map((label, i) => ({ label, value: [9,10,11,12,13,10,14,16,14,15,13,17][i] })),
  },
}

const EXERCISE_DATA: Record<ExName, { data: number[]; min: number; max: number; pr: string; pct: string; start: string }> = {
  'Bench Press':    { data:[72.5,75,75,77.5,80,80,82.5,85],         min:68,  max:90,  pr:'85 kg',   pct:'+17.2%', start:'72.5 kg' },
  'Squat':          { data:[100,102.5,105,107.5,110,112.5,115,120], min:95,  max:125, pr:'120 kg',  pct:'+20%',   start:'100 kg'  },
  'Overhead Press': { data:[55,55,57.5,57.5,60,60,62.5,65],         min:50,  max:70,  pr:'65 kg',   pct:'+18.2%', start:'55 kg'   },
  'Deadlift':       { data:[130,135,137.5,140,145,147.5,150,155],   min:125, max:160, pr:'155 kg',  pct:'+19.2%', start:'130 kg'  },
  'Pull-up':        { data:[5,6,6,7,7,8,9,10],                      min:3,   max:12,  pr:'10 reps', pct:'+100%',  start:'5 reps'  },
}

const EX_PERIOD: Record<ExName, Record<Period, { data: number[]; labels: string[] }>> = {
  'Bench Press': {
    week:  { data: [82.5, 0, 85, 0, 85, 87.5, 0],                               labels: ['M','T','W','T','F','S','S'] },
    month: { data: [80, 82.5, 85, 85, 87.5],                                     labels: ['W1','W2','W3','W4','W5']   },
    year:  { data: [70,72.5,74,75,77.5,80,82.5,83,84,85,86,87.5],               labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  },
  'Squat': {
    week:  { data: [115, 0, 117.5, 0, 120, 0, 0],                               labels: ['M','T','W','T','F','S','S'] },
    month: { data: [110, 112.5, 115, 117.5, 120],                               labels: ['W1','W2','W3','W4','W5']   },
    year:  { data: [90,95,100,102.5,105,107.5,110,112.5,115,117.5,120,122.5],   labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  },
  'Overhead Press': {
    week:  { data: [0, 62.5, 0, 65, 0, 65, 0],                                  labels: ['M','T','W','T','F','S','S'] },
    month: { data: [60, 61, 62.5, 63, 65],                                      labels: ['W1','W2','W3','W4','W5']   },
    year:  { data: [50,52.5,55,55,57.5,58,60,61,62.5,63,65,65],                labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  },
  'Deadlift': {
    week:  { data: [150, 0, 152.5, 0, 155, 0, 0],                               labels: ['M','T','W','T','F','S','S'] },
    month: { data: [145, 147.5, 150, 150, 155],                                 labels: ['W1','W2','W3','W4','W5']   },
    year:  { data: [120,125,127.5,130,135,137.5,140,142.5,145,147.5,150,155],   labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  },
  'Pull-up': {
    week:  { data: [9, 0, 10, 0, 10, 0, 0],                                     labels: ['M','T','W','T','F','S','S'] },
    month: { data: [8, 8, 9, 9, 10],                                            labels: ['W1','W2','W3','W4','W5']   },
    year:  { data: [4,5,5,6,6,7,7,8,8,9,9,10],                                 labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
  },
}

const EXERCISES = Object.keys(EXERCISE_DATA) as ExName[]

function LineChart({ name, period }: { name: ExName; period: Period }) {
  const base = EXERCISE_DATA[name]
  const pd   = EX_PERIOD[name][period]
  const n    = pd.data.length
  const isScrollable = n > 8

  // Non-scrollable: always fill container with fixed 300-wide viewBox, spreading points evenly.
  // Scrollable (year, 12 pts): fixed 40px spacing so it overflows and scrolls.
  const MARGIN   = 10
  const VB_W     = isScrollable ? MARGIN * 2 + (n - 1) * 40 : 300
  const xStep    = isScrollable ? 40 : (VB_W - MARGIN * 2) / Math.max(1, n - 1)
  const chartScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isScrollable && chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth
    }
  }, [isScrollable, period])

  const allPts = pd.data.map((v, i) => ({
    x: MARGIN + i * xStep,
    y: v === 0 ? 93 : +(93 - ((v - base.min) / (base.max - base.min)) * 55).toFixed(1),
    hasData: v > 0,
  }))
  const dataPts  = allPts.filter(p => p.hasData)
  const polyline = dataPts.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = dataPts.length > 1
    ? `M${dataPts.map(p => `${p.x},${p.y}`).join(' L')} L${dataPts[dataPts.length-1].x},93 L${dataPts[0].x},93 Z`
    : ''
  const lp = dataPts[dataPts.length - 1] ?? allPts[allPts.length - 1]
  const bx = Math.max(0, Math.min(lp.x - 23, VB_W - 50))

  const svgEl = (
    <svg
      viewBox={`0 0 ${VB_W} 108`}
      width={isScrollable ? VB_W : '100%'}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="cgrd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,110,45,.28)" />
          <stop offset="100%" stopColor="rgba(255,110,45,0)" />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill="url(#cgrd)" />}
      {dataPts.length > 1 && <polyline points={polyline} fill="none" stroke="#ff7a35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === dataPts.length-1 ? 5 : 3.5} fill="#ff7a35"
          {...(i === dataPts.length-1 ? { stroke: 'rgba(255,255,255,.3)', strokeWidth: 2 } : {})} />
      ))}
      {dataPts.length > 0 && (
        <>
          <rect x={bx} y={lp.y - 20} width={46} height={16} rx={8} fill="rgba(255,100,40,.92)" />
          <text x={bx + 23} y={lp.y - 8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>PR {base.pr}</text>
        </>
      )}
      <line x1={10} y1={93} x2={VB_W - 10} y2={93} stroke="rgba(255,255,255,.07)" strokeWidth={1} />
      <text x={4} y={93} fontSize={8} fill="rgba(255,255,255,.22)">{base.min}</text>
      <text x={4} y={38} fontSize={8} fill="rgba(255,255,255,.22)">{base.max}</text>
      <text x={allPts[0].x}   y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">{pd.labels[0]}</text>
      <text x={allPts[n-1].x} y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">{pd.labels[n-1]}</text>
    </svg>
  )

  if (isScrollable) {
    return <div ref={chartScrollRef} style={{ overflowX: 'auto' }}>{svgEl}</div>
  }
  return svgEl
}

function BarChart({ bars, isVol, selectedIdx, onBarClick }: {
  bars:        { label: string; value: number }[]
  isVol:       boolean
  selectedIdx: number | null
  onBarClick:  (idx: number, rect: DOMRect) => void
}) {
  const scrollRef    = useRef<HTMLDivElement>(null)
  const MAX_H        = 80
  const BAR_W        = 32
  const BAR_GAP      = 10
  const maxVal       = Math.max(...bars.map(b => b.value), 1)
  const isScrollable = bars.length > 8

  useEffect(() => {
    if (scrollRef.current && isScrollable) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [bars.length, isScrollable])

  return (
    <div ref={scrollRef} style={{ overflowX: isScrollable ? 'auto' : 'visible', paddingBottom: 2 }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: BAR_GAP,
        minWidth: isScrollable ? bars.length * (BAR_W + BAR_GAP) - BAR_GAP : undefined,
        paddingTop: 32,
        paddingBottom: 2,
      }}>
        {bars.map((bar, i) => {
          const isSelected = selectedIdx === i
          const isLast     = i === bars.length - 1
          const h = Math.max(3, Math.round((bar.value / maxVal) * MAX_H))
          return (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); onBarClick(i, (e.currentTarget as HTMLElement).getBoundingClientRect()) }}
              style={{
                flexShrink: isScrollable ? 0 : 1,
                flex: isScrollable ? 'none' : '1 1 0',
                width: isScrollable ? BAR_W : undefined,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{
                width: isScrollable ? BAR_W : '100%',
                height: h,
                borderRadius: 6,
                background: isSelected
                  ? 'linear-gradient(180deg,#ffb060,#ff6030)'
                  : isLast
                    ? 'linear-gradient(180deg,#ff8050,#e04020)'
                    : 'rgba(255,255,255,.1)',
                transition: 'background 0.15s',
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod]         = useState<Period>('month')
  const [selectedEx, setSelectedEx] = useState<ExName>('Bench Press')
  const [showPicker, setShowPicker]   = useState(false)
  const [activeTip, setActiveTip]     = useState<{
    idx: number; bar: { label: string; value: number }; x: number; y: number; isVol: boolean
  } | null>(null)

  useEffect(() => { setActiveTip(null) }, [period])

  const d    = DATA[period]
  const ex   = EXERCISE_DATA[selectedEx]
  const bars = BAR_DATA[period]

  const CONSISTENCY = [
    { label: 'Workouts', value: d.cW,  bg: 'rgba(255,110,45,.14)', border: 'rgba(255,140,70,.32)', color: 'rgba(255,180,100,.95)', lc: 'rgba(255,160,80,.55)' },
    { label: 'Skipped',  value: d.cSk, bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)',  lc: 'rgba(255,255,255,.22)' },
    { label: 'Sick',     value: d.cSi, bg: 'rgba(60,160,220,.14)', border: 'rgba(80,180,240,.28)', color: 'rgba(100,200,240,.85)', lc: 'rgba(80,180,240,.45)' },
    { label: 'Vacation', value: d.cVa, bg: 'rgba(140,80,220,.14)', border: 'rgba(160,100,240,.28)', color: 'rgba(180,140,255,.85)', lc: 'rgba(160,100,240,.45)' },
  ]

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between px-[22px] pt-[14px] pb-0">
        <h1 className="text-[22px] font-bold tracking-[-0.4px] m-0">Analytics</h1>
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
            { label:'Workouts',    value: d.workouts, sub:'total sessions', warm:false },
            { label:'Training',    value: d.hours,    sub:'total hours',    warm:false },
            { label:'Avg Duration',value: d.avg,      sub:'per session',    warm:false },
            { label:'Streak',      value: d.streak,   sub:'day streak',     warm:true  },
          ].map(card => (
            <div key={card.label} className="rounded-[20px] p-4" style={{ background: card.warm ? 'linear-gradient(157deg,rgba(255,150,60,.14),rgba(200,80,20,.05))' : 'linear-gradient(157deg,rgba(255,238,224,.12),rgba(255,210,180,.04))', border: card.warm ? '1px solid rgba(255,140,60,.2)' : '1px solid rgba(255,255,255,.09)' }}>
              <div className="text-[10px] font-medium tracking-[.5px] mb-2" style={{ color: card.warm ? 'rgba(255,160,80,.5)' : 'rgba(255,255,255,.32)' }}>{card.label}</div>
              <div className="font-doto text-[36px] font-bold leading-none" style={{ letterSpacing: 3, color: card.warm ? 'rgba(255,200,120,.95)' : '#fff' }}>{card.value}</div>
              <div className="text-[11px] font-medium mt-[5px]" style={{ color: card.warm ? 'rgba(255,160,80,.4)' : 'rgba(255,255,255,.32)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Volume chart */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="text-[14px] font-semibold tracking-[-0.2px]">Volume</div>
            <div className="text-[11px] font-semibold" style={{ color: 'rgba(255,150,80,.8)' }}>
              {d.vol} kg <span className="font-normal" style={{ color: 'rgba(255,255,255,.3)' }}>this period</span>
            </div>
          </div>
          <BarChart
            bars={bars.vol}
            isVol={true}
            selectedIdx={activeTip?.isVol === true ? activeTip.idx : null}
            onBarClick={(idx, rect) => {
              const TIP_W = 130
              const x = Math.max(8, Math.min(rect.left + rect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 8))
              setActiveTip(t => t?.idx === idx && t.isVol ? null : { idx, bar: bars.vol[idx], x, y: rect.top - 62, isVol: true })
            }}
          />
        </div>

        {/* Exercise progress */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-center justify-between mb-[5px]">
            <div className="text-[14px] font-semibold tracking-[-0.2px]">Exercise Progress</div>
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
          <LineChart name={selectedEx} period={period} />
        </div>

        {/* Frequency */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="text-[14px] font-semibold tracking-[-0.2px]">Frequency</div>
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,.35)' }}>sessions / {period === 'week' ? 'week' : period === 'month' ? 'month' : 'year'}</div>
          </div>
          <BarChart
            bars={bars.freq}
            isVol={false}
            selectedIdx={activeTip?.isVol === false ? activeTip.idx : null}
            onBarClick={(idx, rect) => {
              const TIP_W = 130
              const x = Math.max(8, Math.min(rect.left + rect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 8))
              setActiveTip(t => t?.idx === idx && !t.isVol ? null : { idx, bar: bars.freq[idx], x, y: rect.top - 62, isVol: false })
            }}
          />
        </div>

        {/* Consistency */}
        <div className="glass rounded-[22px] p-4">
          <div className="text-[14px] font-semibold tracking-[-0.2px] mb-[14px]">Consistency</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {CONSISTENCY.map(c => (
              <div key={c.label} className="text-center rounded-[14px] px-[6px] py-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <div className="font-doto text-[22px] font-bold leading-none" style={{ letterSpacing: 2, color: c.color }}>{c.value}</div>
                <div className="text-[9px] font-medium tracking-[.3px] mt-1" style={{ color: c.lc }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="analytics" />

      {/* Fixed tooltip — rendered outside scroll container to avoid overflow clipping */}
      {activeTip && (
        <div
          style={{
            position: 'fixed',
            left: activeTip.x,
            top: activeTip.y,
            width: 130,
            background: 'rgba(20,10,6,.96)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 10,
            padding: '6px 10px',
            boxShadow: '0 4px 14px rgba(0,0,0,.5)',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>{activeTip.bar.label}</div>
          <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: 0.2 }}>
            {activeTip.isVol
              ? activeTip.bar.value > 0 ? `${activeTip.bar.value.toLocaleString()} kg` : 'Rest day'
              : activeTip.bar.value > 0 ? `${activeTip.bar.value} session${activeTip.bar.value !== 1 ? 's' : ''}` : 'Rest day'
            }
          </div>
        </div>
      )}

      {/* Exercise picker sheet */}
      {showPicker && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowPicker(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[30px_30px_0_0] px-5 pb-12 pt-4" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-8 h-1 rounded-[2px] mx-auto mb-[18px]" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[17px] font-bold tracking-[-0.3px] mb-[14px]">Select Exercise</div>
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
