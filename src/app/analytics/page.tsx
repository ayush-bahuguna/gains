'use client'
import { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getBarData, getExProgression, getHomeStats, type Period } from '@/lib/db/analytics'

type ExName = 'Bench Press' | 'Squat' | 'Overhead Press' | 'Deadlift' | 'Pull-up'

type BarItem   = { label: string; value: number }
type BarData   = { vol: BarItem[]; freq: BarItem[]; totalSecs: number }
type ExPd      = { data: number[]; labels: string[] }

const EXERCISES = ['Bench Press','Squat','Overhead Press','Deadlift','Pull-up'] as ExName[]

function emptyBars(period: Period): BarData {
  if (period === 'week')  return { vol: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(l => ({ label:l, value:0 })), freq: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(l => ({ label:l, value:0 })), totalSecs: 0 }
  if (period === 'month') return { vol: ['W1','W2','W3','W4','W5'].map(l => ({ label:l, value:0 })), freq: ['W1','W2','W3','W4','W5'].map(l => ({ label:l, value:0 })), totalSecs: 0 }
  return { vol: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(l => ({ label:l, value:0 })), freq: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(l => ({ label:l, value:0 })), totalSecs: 0 }
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}m`
}

function emptyExPd(period: Period): ExPd {
  if (period === 'week')  return { data: new Array(7).fill(0),  labels: ['M','T','W','T','F','S','S'] }
  if (period === 'month') return { data: new Array(5).fill(0),  labels: ['W1','W2','W3','W4','W5'] }
  return { data: new Array(12).fill(0), labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }
}

function fmtVol(v: number): string {
  return v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)
}

// ── LineChart ──────────────────────────────────────────────────────────────

function LineChart({ pd, scaling, prLabel }: { pd: ExPd; scaling: { min: number; max: number }; prLabel: string }) {
  const n = pd.data.length
  const isScrollable = n > 8

  const MARGIN = 10
  const VB_W   = isScrollable ? MARGIN * 2 + (n - 1) * 40 : 300
  const xStep  = isScrollable ? 40 : (VB_W - MARGIN * 2) / Math.max(1, n - 1)
  const chartScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isScrollable && chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth
    }
  }, [isScrollable, pd])

  const { min, max } = scaling
  const range = Math.max(1, max - min)

  const allPts = pd.data.map((v, i) => ({
    x: MARGIN + i * xStep,
    y: v === 0 ? 93 : +(93 - ((v - min) / range) * 55).toFixed(1),
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
    <svg viewBox={`0 0 ${VB_W} 108`} width={isScrollable ? VB_W : '100%'} style={{ display: 'block', overflow: 'visible' }}>
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
          <text x={bx + 23} y={lp.y - 8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>{prLabel}</text>
        </>
      )}
      <line x1={10} y1={93} x2={VB_W - 10} y2={93} stroke="rgba(255,255,255,.07)" strokeWidth={1} />
      <text x={4} y={93} fontSize={8} fill="rgba(255,255,255,.22)">{min}</text>
      <text x={4} y={38} fontSize={8} fill="rgba(255,255,255,.22)">{max}</text>
      <text x={allPts[0].x}   y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">{pd.labels[0]}</text>
      <text x={allPts[n-1].x} y={107} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,.2)">{pd.labels[n-1]}</text>
    </svg>
  )

  if (isScrollable) {
    return <div ref={chartScrollRef} style={{ overflowX: 'auto' }}>{svgEl}</div>
  }
  return svgEl
}

// ── BarChart ───────────────────────────────────────────────────────────────

function BarChart({ bars, isVol, selectedIdx, onBarClick }: {
  bars:        BarItem[]
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
        display: 'flex', alignItems: 'flex-end', gap: BAR_GAP,
        minWidth: isScrollable ? bars.length * (BAR_W + BAR_GAP) - BAR_GAP : undefined,
        paddingTop: 32, paddingBottom: 2,
      }}>
        {bars.map((bar, i) => {
          const isSelected = selectedIdx === i
          const isLast     = i === bars.length - 1
          const h = Math.max(3, Math.round((bar.value / maxVal) * MAX_H))
          return (
            <div key={i}
              onClick={(e) => { e.stopPropagation(); onBarClick(i, (e.currentTarget as HTMLElement).getBoundingClientRect()) }}
              style={{ flexShrink: isScrollable ? 0 : 1, flex: isScrollable ? 'none' : '1 1 0', width: isScrollable ? BAR_W : undefined, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{
                width: isScrollable ? BAR_W : '100%', height: h, borderRadius: 6,
                background: isSelected ? 'linear-gradient(180deg,#ffb060,#ff6030)' : isLast ? 'linear-gradient(180deg,#ff8050,#e04020)' : 'rgba(255,255,255,.1)',
                transition: 'background 0.15s',
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { userId } = useAuth()

  const [period,     setPeriod]     = useState<Period>('month')
  const [selectedEx, setSelectedEx] = useState<ExName>('Bench Press')
  const [showPicker, setShowPicker] = useState(false)
  const [activeTip, setActiveTip]   = useState<{
    idx: number; bar: BarItem; x: number; y: number; isVol: boolean
  } | null>(null)

  const [bars,   setBars]   = useState<BarData>(() => emptyBars('month'))
  const [exPd,   setExPd]   = useState<ExPd>(() => emptyExPd('month'))
  const [streak, setStreak] = useState(0)

  // Refetch bars + streak when period or userId changes
  useEffect(() => {
    setActiveTip(null)
    setBars(emptyBars(period))
    if (!userId) return
    getBarData(userId, period).then(setBars)
    getHomeStats(userId).then(s => setStreak(s.streak))
  }, [userId, period])

  // Refetch exercise progression when exercise or period changes
  useEffect(() => {
    setExPd(emptyExPd(period))
    if (!userId) return
    getExProgression(userId, selectedEx, period).then(setExPd)
  }, [userId, selectedEx, period])

  // Compute summary stats from bars
  const totalWorkouts = bars.freq.reduce((a, b) => a + b.value, 0)
  const totalVolume   = bars.vol.reduce((a, b) => a + b.value, 0)
  const totalSecs     = bars.totalSecs
  const totalHours    = (totalSecs / 3600).toFixed(1)
  const avgSecs       = totalWorkouts > 0 ? totalSecs / totalWorkouts : 0
  const avgDuration   = fmtDuration(avgSecs)

  // Compute line chart scaling from actual data
  const nonZero    = exPd.data.filter(v => v > 0)
  const scaling    = nonZero.length > 0
    ? { min: Math.floor(Math.min(...nonZero) * 0.92), max: Math.ceil(Math.max(...nonZero) * 1.08) }
    : { min: 0, max: 100 }
  const prVal = nonZero.length > 0 ? Math.max(...nonZero) : 0
  const prLabel = prVal > 0 ? `${prVal} kg` : '—'

  const CONSISTENCY = [
    { label:'Workouts', value: String(totalWorkouts), bg:'rgba(255,110,45,.14)', border:'rgba(255,140,70,.32)', color:'rgba(255,180,100,.95)', lc:'rgba(255,160,80,.55)' },
    { label:'Streak',   value: String(streak),        bg:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)',  lc:'rgba(255,255,255,.22)' },
    { label:'Volume',   value: fmtVol(totalVolume),   bg:'rgba(60,160,220,.14)', border:'rgba(80,180,240,.28)', color:'rgba(100,200,240,.85)', lc:'rgba(80,180,240,.45)' },
    { label:'PR',       value: prVal > 0 ? `${prVal}` : '—', bg:'rgba(140,80,220,.14)', border:'rgba(160,100,240,.28)', color:'rgba(180,140,255,.85)', lc:'rgba(160,100,240,.45)' },
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
              <div key={p} onClick={() => setPeriod(id)}
                className="w-[34px] h-7 rounded-[14px] flex items-center justify-center text-[12px] font-bold cursor-pointer tracking-[.5px]"
                style={{ background: on ? 'rgba(255,120,60,.9)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)' }}
              >{p}</div>
            )
          })}
        </div>
      </div>

      {/* Scroll */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: '16px 18px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Summary cards */}
        <div className="grid gap-[10px] mb-[18px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { label: 'WORKOUTS',     value: String(totalWorkouts), sub: 'total sessions', warm: false },
            { label: 'TRAINING',     value: totalHours,            sub: 'total hours',    warm: false },
            { label: 'AVG DURATION', value: avgDuration,           sub: 'per session',    warm: false },
            { label: 'STREAK',       value: String(streak),        sub: 'day streak',     warm: true  },
          ].map(card => (
            <div key={card.label} className="rounded-[20px] p-4" style={{ background: card.warm ? 'linear-gradient(157deg,rgba(255,150,60,.14),rgba(200,80,20,.05))' : 'linear-gradient(157deg,rgba(255,238,224,.12),rgba(255,210,180,.04))', border: card.warm ? '1px solid rgba(255,140,60,.2)' : '1px solid rgba(255,255,255,.09)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[1px] mb-2" style={{ color: card.warm ? 'rgba(255,160,80,.5)' : 'rgba(255,255,255,.32)' }}>{card.label}</div>
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
              {fmtVol(totalVolume)} kg <span className="font-normal" style={{ color: 'rgba(255,255,255,.3)' }}>this period</span>
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
            {prVal > 0 ? `PR: ${prLabel}` : 'No data yet — log a workout to see progress'}
          </div>
          <LineChart pd={exPd} scaling={scaling} prLabel={prLabel} />
        </div>

        {/* Frequency */}
        <div className="glass rounded-[22px] p-4 mb-3">
          <div className="flex items-baseline justify-between mb-[14px]">
            <div className="text-[14px] font-semibold tracking-[-0.2px]">Frequency</div>
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,.35)' }}>
              sessions / {period === 'week' ? 'week' : period === 'month' ? 'month' : 'year'}
            </div>
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

      {/* Fixed tooltip */}
      {activeTip && (
        <div style={{
          position: 'fixed', left: activeTip.x, top: activeTip.y,
          width: 130, background: 'rgba(20,10,6,.96)',
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 10,
          padding: '6px 10px', boxShadow: '0 4px 14px rgba(0,0,0,.5)',
          zIndex: 50, pointerEvents: 'none',
        }}>
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
                <div key={name}
                  onClick={() => { setSelectedEx(name); setShowPicker(false) }}
                  className="flex items-center justify-between px-4 py-[13px] rounded-[16px] mb-2 cursor-pointer"
                  style={{ background: on ? 'rgba(255,110,45,.14)' : 'rgba(255,255,255,.04)', border: on ? '1px solid rgba(255,110,45,.3)' : '1px solid rgba(255,255,255,.06)' }}
                >
                  <div className="text-[15px] font-semibold tracking-[-0.1px]">{name}</div>
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
