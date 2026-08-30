import { useMemo, useState } from 'react'
import { MonthActivityGraph } from '../../components/MonthActivityGraph'
import { firstWeekdayOfMonth, toISODate } from '../../lib/date'

export function CalendarCheck() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const attendedDates = useMemo(() => {
    const firstWeekday = firstWeekdayOfMonth(year, month)
    const nthDayOfWeek = (target: number) => 1 + ((target - firstWeekday + 7) % 7)
    return new Set([
      toISODate(new Date(year, month, 2)),
      toISODate(new Date(year, month, 3)),
      toISODate(new Date(year, month, 9)),
      toISODate(new Date(year, month, nthDayOfWeek(6))), // first Saturday — attended
      toISODate(new Date(year, month, nthDayOfWeek(0))), // first Sunday — attended
    ])
  }, [year, month])

  return (
    <div className="mx-auto max-w-[480px] space-y-3 bg-paper p-6">
      <h1 className="mb-3 text-2xl font-bold">Calendar / Activity Graph (§19)</h1>
      <p className="text-sm text-graphite">
        Drag left/right to change months. Green = attended, dark red = skipped, grey = skipped
        Sunday or future.
      </p>
      <MonthActivityGraph
        year={year}
        month={month}
        attendedDates={attendedDates}
        onMonthChange={(y, m) => {
          setYear(y)
          setMonth(m)
        }}
      />
    </div>
  )
}
