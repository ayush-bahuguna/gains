import { NavLink } from 'react-router-dom'
import { useMeasure } from '../lib/useMeasure'
import { IconCalendar, IconDumbbell, IconNotebook, IconUser } from './icons'
import { Sketchy } from './Sketchy'

const tabs = [
  { to: '/journal', label: 'Log', icon: IconNotebook },
  { to: '/templates', label: 'Templates', icon: IconDumbbell },
  { to: '/history', label: 'History', icon: IconCalendar },
  { to: '/me', label: 'Me', icon: IconUser },
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
  return (
    <div className="sticky bottom-0 z-40 bg-paper">
      <TopDivider />
      <nav className="flex pb-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'font-medium text-ink' : 'text-graphite'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
