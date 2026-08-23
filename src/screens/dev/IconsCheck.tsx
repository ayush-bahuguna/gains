import {
  IconCalendar,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDumbbell,
  IconMic,
  IconMore,
  IconNotebook,
  IconPencil,
  IconPlusCircle,
  IconSearch,
  IconSettings,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUser,
  IconXCircle,
} from '../../components/icons'

const icons = [
  ['Notebook', IconNotebook],
  ['Dumbbell', IconDumbbell],
  ['Calendar', IconCalendar],
  ['Clock', IconClock],
  ['TrendingUp', IconTrendingUp],
  ['Star', IconStar],
  ['Pencil', IconPencil],
  ['Trash', IconTrash],
  ['More', IconMore],
  ['ChevronLeft', IconChevronLeft],
  ['ChevronRight', IconChevronRight],
  ['CheckCircle', IconCheckCircle],
  ['PlusCircle', IconPlusCircle],
  ['XCircle', IconXCircle],
  ['User', IconUser],
  ['Settings', IconSettings],
  ['Mic', IconMic],
  ['Search', IconSearch],
] as const

export function IconsCheck() {
  return (
    <div className="mx-auto max-w-[480px] bg-paper p-6">
      <h1 className="mb-4 text-2xl font-bold">Icon Set (§18)</h1>
      <div className="grid grid-cols-5 gap-5">
        {icons.map(([label, Icon]) => (
          <div key={label} className="flex flex-col items-center gap-1 text-graphite">
            <Icon className="h-6 w-6 text-ink" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
