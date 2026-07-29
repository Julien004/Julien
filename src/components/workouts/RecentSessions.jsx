import { useMemo } from 'react'
import { History } from 'lucide-react'
import GlassCard from '../GlassCard'
import SessionListRow from './SessionListRow'
import { parseDateKey, formatRelativeDay } from '../../lib/dateUtils'

export default function RecentSessions({ workouts, now, onSelect }) {
  const recent = useMemo(() => {
    const items = []
    for (const [key, day] of Object.entries(workouts)) {
      for (const session of day.sessions || []) {
        if (!session.completed) continue
        items.push({ session, dateKey: key, date: parseDateKey(key) })
      }
    }
    items.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || (b.session.startTime || '').localeCompare(a.session.startTime || ''))
    return items.slice(0, 8)
  }, [workouts])

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-primary" /> Recent sessions
      </div>
      {recent.length === 0 ? (
        <p className="mt-3 text-xs text-muted-2">Completed sessions will show up here.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {recent.map(({ session, dateKey: key, date }) => (
            <SessionListRow
              key={session.id}
              session={session}
              dateLabel={formatRelativeDay(date, now)}
              onClick={() => onSelect(session, key)}
              showCompleted
            />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
