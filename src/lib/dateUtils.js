import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
  subDays,
} from 'date-fns'

export function buildMonthGrid(monthDate) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map((day) => ({
    date: day,
    inMonth: isSameMonth(day, monthDate),
    isToday: isToday(day),
  }))
}

export function lastNDays(n, from = new Date()) {
  return Array.from({ length: n }, (_, i) => subDays(from, n - 1 - i))
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatRelativeDay(date, now = new Date()) {
  if (isSameDay(date, now)) return 'Today'
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(date, tomorrow)) return 'Tomorrow'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

export { isSameDay, isToday, format, addMonths, subMonths }
