import { useEffect, useMemo, useRef } from 'react'
import ActivityBlock from './ActivityBlock'
import { layoutDayActivities, HOUR_HEIGHT, GRID_HEIGHT } from '../../lib/dayGridLayout'
import { isSameDay } from '../../lib/dateUtils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHourLabel(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

export default function DayGrid({
  activities,
  selectedDate,
  now,
  onEdit,
  onToggleComplete,
  onReschedule,
  onDuplicate,
  onDelete,
}) {
  const { scheduled, unscheduled } = useMemo(() => layoutDayActivities(activities), [activities])
  const isToday = isSameDay(selectedDate, now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const anchorMinutes = isToday ? Math.max(0, nowMinutes - 120) : 7 * 60
    scrollRef.current.scrollTop = anchorMinutes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {unscheduled.length > 0 && (
        <div className="border-b border-border p-3">
          <p className="mb-2 text-xs font-medium text-muted">No time set</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onEdit(a)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: `${a.color}22`, color: a.color }}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="max-h-[65dvh] overflow-y-auto overscroll-contain">
        <div className="relative flex" style={{ height: GRID_HEIGHT }}>
          <div className="w-14 shrink-0">
            {HOURS.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-[10px] text-muted-2">{formatHourLabel(h)}</span>
              </div>
            ))}
          </div>

          <div className="relative flex-1 border-l border-border">
            {HOURS.map((h) => (
              <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: h * HOUR_HEIGHT }} />
            ))}

            {isToday && (
              <div className="absolute inset-x-0 z-20 flex items-center" style={{ top: nowMinutes }}>
                <span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <div className="h-px flex-1 bg-destructive" />
              </div>
            )}

            {scheduled.map((activity) => (
              <ActivityBlock
                key={activity.id}
                activity={activity}
                onTap={() => onEdit(activity)}
                onToggleComplete={() => onToggleComplete(activity)}
                onReschedule={(newStart) => onReschedule(activity, newStart)}
                onDuplicate={() => onDuplicate(activity)}
                onDelete={() => onDelete(activity)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
