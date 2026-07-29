import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'
import { addDays } from 'date-fns'
import GlassCard from '../GlassCard'
import SessionListRow from './SessionListRow'
import { dateKey } from '../../lib/store'
import { formatRelativeDay } from '../../lib/dateUtils'

export default function UpcomingActivities({ workouts, now, onSelect }) {
  const upcoming = useMemo(() => {
    const items = []
    for (let i = 0; i < 14; i++) {
      const d = addDays(now, i)
      const key = dateKey(d)
      const sessions = workouts[key]?.sessions || []
      for (const session of sessions) {
        if (session.completed) continue
        items.push({ session, dateKey: key, date: d })
      }
    }
    items.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || (a.session.startTime || '').localeCompare(b.session.startTime || ''))
    return items.slice(0, 8)
  }, [workouts, now])

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CalendarClock className="h-4 w-4 text-primary" /> Upcoming activities
      </div>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-xs text-muted-2">
          Nothing planned yet. Log an activity for a future date to see it here.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {upcoming.map(({ session, dateKey: key, date }) => (
            <SessionListRow
              key={session.id}
              session={session}
              dateLabel={formatRelativeDay(date, now)}
              onClick={() => onSelect(session, key)}
            />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
