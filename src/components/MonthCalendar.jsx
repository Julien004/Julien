import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildMonthGrid, isSameDay, format, addMonths, subMonths } from '../lib/dateUtils'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function MonthCalendar({ selectedDate, onSelect, markedDates = new Set() }) {
  const [visibleMonth, setVisibleMonth] = useState(new Date(selectedDate))
  const days = buildMonthGrid(visibleMonth)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-base font-semibold text-foreground">
          {format(visibleMonth, 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, inMonth, isToday }) => {
          const key = format(date, 'yyyy-MM-dd')
          const selected = isSameDay(date, selectedDate)
          const marked = markedDates.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(date)}
              className={`relative aspect-square cursor-pointer rounded-lg text-sm transition-colors duration-150
                ${!inMonth ? 'text-muted-2/50' : 'text-foreground'}
                ${selected ? 'bg-primary text-white font-semibold' : 'hover:bg-white/5'}
                ${isToday && !selected ? 'ring-1 ring-primary/60' : ''}
              `}
            >
              {format(date, 'd')}
              {marked && !selected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
