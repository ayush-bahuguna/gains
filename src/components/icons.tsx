import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  }
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  )
}

export function IconMic(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0" />
      <path d="M12 17.5V21" />
      <path d="M8.5 21h7" />
    </svg>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l.8-3.6L15.6 5.6a1.5 1.5 0 012.1 0l.7.7a1.5 1.5 0 010 2.1L7.6 19.2 4 20z" />
      <path d="M14 7.5l2.5 2.5" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V6.5" />
      <path d="M6.5 6.5l.7 12a1.5 1.5 0 001.5 1.4h6.6a1.5 1.5 0 001.5-1.4l.7-12" />
      <path d="M10 10.5v6" />
      <path d="M14 10.5v6" />
    </svg>
  )
}

export function IconMore(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.5}>
      <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function IconXCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 9.3l5.4 5.4" />
      <path d="M14.7 9.3l-5.4 5.4" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconPlusCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4.5 4.5L19 7" />
    </svg>
  )
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.5l2.8 2.8L16.5 9" />
    </svg>
  )
}

export function IconDumbbell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10v4" />
      <path d="M5.5 8v8" />
      <path d="M18.5 8v8" />
      <path d="M21 10v4" />
      <path d="M8 12h8" />
    </svg>
  )
}

export function IconNotebook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8.5 3v18" />
      <path d="M12 8h4" />
      <path d="M12 12h4" />
    </svg>
  )
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16" />
      <path d="M8 3v3.5" />
      <path d="M16 3v3.5" />
    </svg>
  )
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13l3-3" />
      <path d="M10 2h4" />
      <path d="M12 2v2.5" />
    </svg>
  )
}

export function IconTrendingUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 16l6-6 4 4 8-9" />
      <path d="M21 5h-5.5" />
      <path d="M21 5v5.5" />
    </svg>
  )
}

export function IconUser(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="M4.9 4.9l1.8 1.8" />
      <path d="M17.3 17.3l1.8 1.8" />
      <path d="M3 12h2.5" />
      <path d="M18.5 12H21" />
      <path d="M4.9 19.1l1.8-1.8" />
      <path d="M17.3 6.7l1.8-1.8" />
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.8-5.1-2.9-5.1 2.9 1.1-5.8-4.3-4 5.8-.7z" />
    </svg>
  )
}
