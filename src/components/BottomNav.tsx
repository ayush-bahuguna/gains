'use client'
import Link from 'next/link'

type Tab = 'home' | 'workout' | 'history' | 'analytics' | 'profile'

const TABS: { id: Tab; href: string; icon: React.ReactNode }[] = [
  {
    id: 'home', href: '/',
    icon: <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M3 10.6L12 3l9 7.6" /><path d="M5.5 9.4V20h4V14h5v6h4V9.4" /></svg>,
  },
  {
    id: 'workout', href: '/workout',
    icon: <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M8 7.5v9" /><path d="M16 7.5v9" /><path d="M5 10v4" /><path d="M19 10v4" /><path d="M8 12h8" /></svg>,
  },
  {
    id: 'history', href: '/history',
    icon: <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 1.9" /></svg>,
  },
  {
    id: 'analytics', href: '/analytics',
    icon: <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M4 4v16h16" /><path d="M7 14l3.4-3.6 3 2.3L20 7" /></svg>,
  },
  {
    id: 'profile', href: '/profile',
    icon: <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M12 4a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 12 4z" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>,
  },
]

export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10"
      style={{ height: 'calc(66px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="nav-glass absolute left-6 right-6 flex items-center justify-around px-3 rounded-[34px]"
        style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', height: 66 }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex-1 h-full flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div
                className={`flex items-center justify-center rounded-full transition-transform active:scale-90 ${isActive ? 'nav-active' : ''}`}
                style={{
                  width: isActive ? 50 : 44,
                  height: isActive ? 50 : 44,
                  color: isActive ? '#fff' : 'rgba(255,255,255,.38)',
                }}
              >
                {tab.icon}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
