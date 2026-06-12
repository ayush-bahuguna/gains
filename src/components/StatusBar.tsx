'use client'
import { useEffect, useState } from 'react'

export function StatusBar() {
  const [time, setTime] = useState('9:41')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours() % 12 || 12
      const m = String(now.getMinutes()).padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative z-10 flex-none flex items-center justify-between px-7 text-[15px] font-semibold tracking-[.2px]"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', minHeight: 52 }}
    >
      <span>{time}</span>
      {/* Dynamic island */}
      <div
        className="absolute bg-black rounded-[20px]"
        style={{ left: '50%', top: 'max(env(safe-area-inset-top, 16px), 14px)', transform: 'translateX(-50%)', width: 108, height: 31 }}
      />
      {/* System icons */}
      <div className="flex items-center gap-[7px]">
        <svg viewBox="0 0 24 22" width={17} height={15} fill="currentColor" style={{ display: 'block' }}>
          <rect x="1" y="15" width="3.6" height="6" rx="1" />
          <rect x="6.8" y="11" width="3.6" height="10" rx="1" />
          <rect x="12.6" y="6.5" width="3.6" height="14.5" rx="1" />
          <rect x="18.4" y="2" width="3.6" height="19" rx="1" />
        </svg>
        <svg viewBox="0 0 24 20" width={17} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" style={{ display: 'block' }}>
          <path d="M3 7.2C5.8 4.8 8.8 3.6 12 3.6s6.2 1.2 9 3.6" />
          <path d="M6 10.7c1.8-1.6 3.8-2.4 6-2.4s4.2.8 6 2.4" />
          <path d="M9 14.2c.9-.8 1.9-1.2 3-1.2s2.1.4 3 1.2" />
          <circle cx="12" cy="17.4" r="1.2" fill="currentColor" stroke="none" />
        </svg>
        <svg viewBox="0 0 26 16" width={22} height={14} fill="none" stroke="currentColor" strokeWidth={1.5} style={{ display: 'block' }}>
          <rect x="1" y="2" width="20" height="12" rx="3" />
          <rect x="3" y="4" width="14.5" height="8" rx="1.5" fill="currentColor" stroke="none" />
          <rect x="22.5" y="5.5" width="2" height="5" rx="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </div>
  )
}
