'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/BottomNav'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function HomePage() {
  const [greeting, setGreeting] = useState('Good Morning')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    const h = now.getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
    setDateStr(`Today, ${MONTHS[now.getMonth()]} ${now.getDate()}`)
  }, [])

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden">
      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ padding: '0 22px', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mt-[22px]">
          <div>
            <div className="text-[13px] font-normal tracking-[.3px]" style={{ color: 'rgba(255,255,255,.5)' }}>{greeting}</div>
            <div className="text-[28px] font-light tracking-[-1px] mt-[5px] leading-none whitespace-nowrap">{dateStr}</div>
          </div>
          <div className="w-[50px] h-[50px] rounded-full flex-none p-[2px]" style={{ background: 'linear-gradient(150deg, rgba(255,140,60,.7), rgba(255,255,255,.12))' }}>
            <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,.08)' }}>
              <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,.35)', display: 'block' }}>
                <path d="M12 4a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 12 4z" />
                <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
              </svg>
            </div>
          </div>
        </div>

        {/* Readiness Ring */}
        <div className="relative w-[230px] h-[230px] mx-auto mt-[22px]">
          <svg viewBox="0 0 240 240" className="w-full h-full block">
            <defs>
              <linearGradient id="ringGrad" gradientUnits="userSpaceOnUse" x1="120" y1="214" x2="120" y2="36">
                <stop offset="0%" stopColor="#ff3416" />
                <stop offset="38%" stopColor="#ff6a1f" />
                <stop offset="72%" stopColor="#ffa12a" />
                <stop offset="100%" stopColor="#ffd96e" />
              </linearGradient>
            </defs>
            <g transform="rotate(108 120 120)">
              <circle cx="120" cy="120" r="100" pathLength="100" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="13" strokeLinecap="round" strokeDasharray="90 10" />
              <circle cx="120" cy="120" r="100" pathLength="100" fill="none" stroke="url(#ringGrad)" strokeWidth="13" strokeLinecap="round" strokeDasharray="57 43" />
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="font-doto leading-[.82] text-white"
              style={{ fontSize: 88, fontWeight: 300, fontVariationSettings: "'wght' 300, 'ROND' 100", letterSpacing: 5, textShadow: '0 0 18px rgba(255,150,60,.35)' }}
            >12</div>
            <div className="mt-3 text-[11px] font-medium tracking-[1.2px] whitespace-nowrap" style={{ color: 'rgba(255,255,255,.5)' }}>Day Streak</div>
          </div>
        </div>
        <div className="text-center mt-[5px] text-[12px] font-normal" style={{ color: 'rgba(255,255,255,.38)' }}>
          Personal best 21 days · <span className="font-semibold" style={{ color: 'rgba(255,170,90,.95)' }}>9 to go</span>
        </div>

        {/* Stats tiles */}
        <div className="flex gap-[9px] mt-5">
          {[
            { label: 'Workouts', value: '4', sub: 'this week', mono: true },
            { label: 'Time',     value: null, sub: 'this week', mono: true },
            { label: 'Volume',   value: '18.2', sub: 'k kg lifted', mono: true },
          ].map((tile) => (
            <div key={tile.label} className="glass flex-1 rounded-[20px] px-3 py-[14px]">
              <div className="text-[10px] font-medium tracking-[.5px]" style={{ color: 'rgba(255,236,224,.32)' }}>{tile.label}</div>
              {tile.label === 'Time' ? (
                <div className="font-doto font-bold leading-none mt-[10px]" style={{ fontSize: 32, letterSpacing: 2 }}>03:28</div>
              ) : (
                <div className="font-doto font-bold leading-none mt-[10px]" style={{ fontSize: tile.label === 'Volume' ? 28 : 36, letterSpacing: tile.label === 'Volume' ? 1 : 2 }}>{tile.value}</div>
              )}
              <div className="text-[10px] mt-[6px] font-normal tracking-[.3px]" style={{ color: 'rgba(255,236,224,.25)' }}>{tile.sub}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/workout">
          <button className="cta-gradient w-full mt-4 h-[58px] rounded-[30px] border-none cursor-pointer text-[14px] font-bold tracking-[1.4px] text-white" style={{ fontFamily: 'inherit' }}>
            START TRAINING
          </button>
        </Link>

        {/* 7 Days Progress */}
        <div className="glass mt-4 rounded-[24px] px-4 py-[18px]" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">7 Days Progress</span>
            <span className="text-[12px] font-normal" style={{ color: 'rgba(255,255,255,.35)' }}>4 workouts</span>
          </div>
          <div className="grid mt-4" style={{ gridTemplateColumns: 'repeat(7,1fr)', gap: 7, alignItems: 'end' }}>
            <DayCell type="workout"  label="M" />
            <DayCell type="sick"     label="T" />
            <DayCell type="workout"  label="W" />
            <DayCell type="vacation" label="T" />
            <DayCell type="workout"  label="F" />
            <DayCell type="today"    label="S" />
            <DayCell type="future"   label="S" />
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

type DayCellType = 'workout' | 'skipped' | 'sick' | 'vacation' | 'today' | 'future'

function DayCell({ type, label }: { type: DayCellType; label: string }) {
  const styles: Record<DayCellType, React.CSSProperties> = {
    workout:  { background: 'rgba(255,110,45,.14)', border: '1px solid rgba(255,140,70,.32)', color: '#ff9a52', height: 44, borderRadius: 13 },
    skipped:  { background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.14)', color: 'rgba(255,255,255,.22)', height: 44, borderRadius: 13 },
    sick:     { background: 'rgba(60,160,220,.14)', border: '1px solid rgba(80,180,240,.28)', color: 'rgba(100,200,240,.85)', height: 44, borderRadius: 13 },
    vacation: { background: 'rgba(140,80,220,.14)', border: '1px solid rgba(160,100,240,.28)', color: 'rgba(180,140,255,.85)', height: 44, borderRadius: 13 },
    today:    { backgroundImage: 'linear-gradient(165deg, rgba(255,255,255,.18), transparent 60%), linear-gradient(165deg, #ffa24a, #ff5e2b 70%)', border: '1px solid rgba(255,180,120,.5)', color: '#fff', height: 56, borderRadius: 15, transform: 'translateY(-6px)', boxShadow: '0 10px 22px -6px rgba(255,80,25,.55), inset 0 1px 0 rgba(255,255,255,.4)' },
    future:   { background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.1)', height: 44, borderRadius: 13 },
  }

  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <div className="w-full flex items-center justify-center" style={styles[type]}>
        {type === 'workout'  && <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" style={{ display: 'block' }}><path d="M12 23a7 7 0 0 0 7-7c0-2.1-1-4-3-5.6.3 1.6-.7 2.7-1.6 2.7-1.7 0-1-2.5-1-4.1 0-2.2-1.4-4.4-3.4-6 .5 3.1-1.6 4.7-2.8 6.3C6.1 10.7 5 12.8 5 16a7 7 0 0 0 7 7z" /></svg>}
        {type === 'skipped'  && <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" style={{ display: 'block' }}><path d="M6 6 18 18M18 6 6 18" /></svg>}
        {type === 'sick'     && <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" stroke="currentColor" strokeWidth={0} style={{ display: 'block' }}><path d="M12 2a4 4 0 0 0-4 4v5.6A6 6 0 1 0 16 11.6V6a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v6.1a6 6 0 0 0-4 0V6a2 2 0 0 1 2-2zm0 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" /></svg>}
        {type === 'vacation' && <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>}
        {type === 'today'    && <svg viewBox="0 0 24 24" width={19} height={19} fill="currentColor" style={{ display: 'block' }}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>}
      </div>
      <span className="text-[10px]" style={{ color: type === 'today' ? '#ff9a52' : 'rgba(255,255,255,.35)', fontWeight: type === 'today' ? 700 : 500 }}>{label}</span>
    </div>
  )
}
