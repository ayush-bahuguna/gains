import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert } from '../../components/Alert'
import { BottomNav } from '../../components/BottomNav'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Checkbox } from '../../components/Checkbox'
import { Chip } from '../../components/Chip'
import { Dropdown } from '../../components/Dropdown'
import { EmptyState } from '../../components/EmptyState'
import { ExerciseBlock } from '../../components/ExerciseBlock'
import { firstWeekdayOfMonth, toISODate } from '../../lib/date'
import { IconButton } from '../../components/IconButton'
import {
  IconDumbbell,
  IconMic,
  IconMore,
  IconNotebook,
  IconPencil,
  IconPlus,
  IconX,
} from '../../components/icons'
import { ListCard } from '../../components/ListCard'
import { MonthActivityGraph } from '../../components/MonthActivityGraph'
import { NotesBox } from '../../components/NotesBox'
import { NumberStepper } from '../../components/NumberStepper'
import { PaginationDots } from '../../components/PaginationDots'
import { ProgressBar } from '../../components/ProgressBar'
import { RadioButton } from '../../components/RadioButton'
import { SearchInput } from '../../components/SearchInput'
import type { SetRowData } from '../../components/SetTable'
import { Slider } from '../../components/Slider'
import { TemplateCard } from '../../components/TemplateCard'
import { TextInput } from '../../components/TextInput'
import { Toggle } from '../../components/Toggle'
import { VoicePanel, type VoicePanelState } from '../../components/VoiceListeningPanel'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

const sets: SetRowData[] = [
  { setNumber: 1, weight: 80, reps: 8 },
  { setNumber: 2, weight: 80, reps: 8 },
  { setNumber: 3, weight: 85, reps: 6 },
]

export function KitchenSink() {
  const [checked, setChecked] = useState(true)
  const [on, setOn] = useState(true)
  const [radio, setRadio] = useState('a')
  const [weight, setWeight] = useState(80)
  const [voiceState, setVoiceState] = useState<VoicePanelState>('idle')

  const today = new Date()
  const [graphYear, setGraphYear] = useState(today.getFullYear())
  const [graphMonth, setGraphMonth] = useState(today.getMonth())
  const graphDates = useMemo(() => {
    const firstWeekday = firstWeekdayOfMonth(graphYear, graphMonth)
    const nthDayOfWeek = (target: number) => 1 + ((target - firstWeekday + 7) % 7)
    return new Set([
      toISODate(new Date(graphYear, graphMonth, 2)),
      toISODate(new Date(graphYear, graphMonth, 3)),
      toISODate(new Date(graphYear, graphMonth, nthDayOfWeek(6))), // first Saturday
      toISODate(new Date(graphYear, graphMonth, nthDayOfWeek(0))), // first Sunday
    ])
  }, [graphYear, graphMonth])

  return (
    <div className="mx-auto max-w-[480px] space-y-10 border-x border-ink/10 bg-paper p-6 pb-28">
      <div>
        <h1 className="text-4xl font-bold text-ink">Kitchen Sink</h1>
        <p className="text-sm text-graphite">Full design system — phase 2 final pass. Dev only.</p>
      </div>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" leftIcon={<IconMic className="h-4 w-4" />}>
            Start Session
          </Button>
          <Button variant="secondary" leftIcon={<IconPlus className="h-4 w-4" />}>
            Add Exercise
          </Button>
          <Button variant="tertiary">View all</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <IconButton icon={<IconPencil className="h-5 w-5" />} aria-label="Edit" />
          <IconButton icon={<IconMore className="h-5 w-5" />} aria-label="More" />
          <IconButton icon={<IconX className="h-5 w-5" />} aria-label="Close" />
        </div>
      </Section>

      <Section title="Inputs">
        <TextInput placeholder="Exercise name..." />
        <SearchInput placeholder="Search exercises..." />
        <div className="flex gap-3">
          <NumberStepper value={weight} onChange={setWeight} className="w-36" />
          <Dropdown defaultValue="kg" className="w-20">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </Dropdown>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-2">
          <Chip variant="category" color="sage">
            Chest
          </Chip>
          <Chip variant="category" color="sky">
            Back
          </Chip>
          <Chip variant="type">Compound</Chip>
          <Chip variant="filter" selected>
            Today
          </Chip>
          <Chip variant="filter">This Week</Chip>
        </div>
      </Section>

      <Section title="Cards">
        <ListCard icon={<IconDumbbell className="h-5 w-5" />} title="Push Day" subtitle="6 exercises" />
        <TemplateCard
          icon={<IconDumbbell className="h-4 w-4" />}
          title="Pull Day"
          description="Back and pull-focused day."
          exerciseCount={5}
        />
      </Section>

      <Section title="Exercise Block">
        <ExerciseBlock title="Bench Press" sets={sets} />
      </Section>

      <Section title="Small Elements">
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <Toggle checked={on} onChange={setOn} />
          <RadioButton checked={radio === 'a'} onChange={() => setRadio('a')} label="A" />
          <RadioButton checked={radio === 'b'} onChange={() => setRadio('b')} label="B" />
        </div>
        <Slider value={weight} onChange={setWeight} min={0} max={200} unit="kg" />
        <PaginationDots count={4} active={1} />
      </Section>

      <Section title="Progress">
        <ProgressBar label="Session Progress" current={4} total={6} unit="exercises" color="sage" />
        <ProgressBar label="Exercise Progress" current={3} total={5} unit="sets" color="sky" />
      </Section>

      <Section title="Notes">
        <NotesBox defaultValue={'Felt strong on bench today.\nGood pump!'} />
      </Section>

      <Section title="Alerts">
        <Alert variant="success" message="Set added" />
        <Alert variant="warning" message="Exercise not found. Tap to create." />
        <Alert variant="error" message="Couldn't hear that. Try again." />
      </Section>

      <Section title="Empty State">
        <EmptyState
          icon={<IconNotebook className="h-6 w-6" />}
          title="No session yet"
          subtitle="Start your workout"
          actionLabel="Start Session"
        />
      </Section>

      <Section title="Voice Panel">
        <VoicePanel
          state={voiceState}
          onMicClick={() => {
            if (voiceState === 'idle' || voiceState === 'error') setVoiceState('listening')
            else if (voiceState === 'listening') setVoiceState('processing')
            else setVoiceState('idle')
          }}
        />
      </Section>

      <Section title="Card container (raw)">
        <Card>
          <p className="text-sm text-ink">Plain card content.</p>
        </Card>
      </Section>

      <Section title="Calendar / Activity Graph (§19)">
        <MonthActivityGraph
          year={graphYear}
          month={graphMonth}
          attendedDates={graphDates}
          onMonthChange={(y, m) => {
            setGraphYear(y)
            setGraphMonth(m)
          }}
        />
      </Section>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px]">
        <BottomNav />
      </div>
    </div>
  )
}
