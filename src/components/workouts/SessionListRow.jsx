import { Check } from 'lucide-react'
import { getIcon } from '../../lib/icons'
import { getActivityType } from '../../lib/activityTypes'
import { summarizeSession } from '../../lib/sessionSummary'

export default function SessionListRow({ session, dateLabel, onClick, showCompleted }) {
  const type = getActivityType(session.activityType)
  const Icon = getIcon(type.icon)
  const summary = summarizeSession(session)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3 text-left transition-colors hover:bg-white/10"
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${type.color}22`, color: type.color }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{session.name}</p>
        <p className="truncate text-xs text-muted-2">
          {dateLabel}
          {session.startTime ? ` · ${session.startTime}` : ''}
          {summary ? ` · ${summary}` : ''}
        </p>
      </div>
      {showCompleted && session.completed && (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}
