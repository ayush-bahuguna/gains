import { useLayoutEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useMeasure } from '../lib/useMeasure'
import {
  IconCalendar,
  IconCalendarFilled,
  IconDumbbell,
  IconDumbbellFilled,
  IconNotebook,
  IconNotebookFilled,
  IconUser,
  IconUserFilled,
} from './icons'
import { Sketchy } from './Sketchy'

const tabs = [
  { to: '/journal', label: 'Log', icon: IconNotebook, filledIcon: IconNotebookFilled },
  {
    to: '/templates',
    label: 'Workouts',
    icon: IconDumbbell,
    filledIcon: IconDumbbellFilled,
  },
  {
    to: '/history',
    label: 'History',
    icon: IconCalendar,
    filledIcon: IconCalendarFilled,
  },
  { to: '/me', label: 'Me', icon: IconUser, filledIcon: IconUserFilled },
]

function TopDivider() {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="relative h-2 w-full">
      <Sketchy
        width={size.width}
        height={size.height}
        shape="line"
        stroke="rgba(92, 92, 92, 0.45)"
        strokeWidth={0.85}
        roughness={1.6}
        bowing={0.9}
        multiStroke
      />
    </div>
  )
}

export function BottomNav() {
  const [navRef, navSize] = useMeasure<HTMLDivElement>()

  // Published as a CSS var (rather than prop-drilled) so anything on the
  // page — e.g. ScrollIndicator — can size itself to stop exactly above the
  // nav's real rendered height (including its own safe-area padding) without
  // needing a direct relationship to this component. useLayoutEffect (not
  // useEffect) so the var is set before first paint — otherwise a consumer
  // reading it via calc() briefly sees the var unset/0 and renders as if the
  // nav weren't there.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--bottom-nav-height',
      `${navSize.height}px`,
    )
  }, [navSize.height])

  return (
    <div
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] bg-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <TopDivider />
      <nav className="flex pb-1">
        {tabs.map(({ to, label, icon: Icon, filledIcon: FilledIcon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'font-medium text-ink' : 'text-graphite'
              }`
            }
          >
            {({ isActive }) => {
              const TabIcon = isActive ? FilledIcon : Icon
              return (
                <>
                  <TabIcon className="h-5 w-5" />
                  <span>{label}</span>
                </>
              )
            }}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
