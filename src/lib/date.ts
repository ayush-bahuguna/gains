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

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export function isSameMonth(
  a: { year: number; month: number },
  b: { year: number; month: number },
): boolean {
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

/** Local-timezone-safe inverse of toISODate — parses a bare YYYY-MM-DD
 *  string as local midnight, avoiding `new Date(iso)`'s UTC-parse rollover. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

/** e.g. "Monday / 13th" — the DayTooltip header format. */
export function formatWeekdayOrdinal(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]} / ${date.getDate()}${ordinalSuffix(date.getDate())}`
}
