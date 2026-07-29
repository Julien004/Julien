import { ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfWeek, addDays } from 'date-fns'
import { dateKey } from '../../lib/store'
import { format, isSameDay, isToday } from '../../lib/dateUtils'

export default function WeekStrip({ selectedDate, onSelect, markedDates = new Set() }) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = days[6]
  const containsToday = days.some((d) => isToday(d))

  const shiftWeek = (dir) => onSelect(addDays(selectedDate, dir * 7))

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          aria-label="Previous week"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-sm font-semibold text-foreground">
          {containsToday ? 'This week' : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`}
        </p>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          aria-label="Next week"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1 sm:gap-2">
        {days.map((d) => {
          const key = dateKey(d)
          const selected = isSameDay(d, selectedDate)
          const marked = markedDates.has(key)
          const today = isToday(d)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              className={`relative flex min-h-16 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-colors duration-150 ${
                selected ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide">{format(d, 'EEEEE')}</span>
              <span className="font-display text-base font-semibold">{format(d, 'd')}</span>
              {today && !selected && <span className="absolute top-1.5 h-1 w-1 rounded-full bg-primary" />}
              {marked && !selected && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
