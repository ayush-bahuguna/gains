// Local-calendar-date helpers. Deliberately avoid Date#toISOString() (which
// converts to UTC and can roll the date over by one depending on the user's
// timezone offset) — everything here reads/writes local Y/M/D fields.

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(year, month + 1, 0).getDate()
}

/** 0 = Sunday ... 6 = Saturday, for the 1st of the given month. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export function isSameMonth(a: { year: number; month: number }, b: { year: number; month: number }): boolean {
  return a.year === b.year && a.month === b.month
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}
