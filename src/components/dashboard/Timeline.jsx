import { Link } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import { getIcon } from '../../lib/icons'
import { formatCountdown, toMinutes } from '../../lib/timeline'

function formatTime12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function Timeline({ items, currentId, now, onToggle }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-2">
        Nothing scheduled yet today — add activities in My Daily Schedule.
      </p>
    )
  }

  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <ol className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = getIcon(item.icon)
        const isCurrent = item.id === currentId
        const startMin = toMinutes(item.time)
        const isFuture = startMin > nowMin
        const countdown = isFuture && !item.completed ? formatCountdown(startMin - nowMin) : null
        const isMeal = item.sourceType === 'meal'

        const rowClass = `flex items-center gap-3 rounded-xl border p-3 transition-colors ${
          isCurrent ? 'border-primary/50 bg-primary/10' : 'border-border bg-white/[0.02]'
        }`

        const inner = (
          <>
            <button
              type="button"
              onClick={() => !isMeal && onToggle(item)}
              disabled={isMeal}
              aria-label={item.completed ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                isMeal ? '' : 'cursor-pointer'
              }`}
              style={{
                borderColor: item.completed ? item.color : 'rgba(255,255,255,0.15)',
                backgroundColor: item.completed ? item.color : 'transparent',
              }}
            >
              {item.completed ? (
                <Check className="animate-tick h-4 w-4 text-white" strokeWidth={3} />
              ) : (
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${
                  item.completed ? 'text-muted line-through' : 'text-foreground'
                }`}
              >
                {item.name}
              </p>
              <p className="text-xs text-muted-2">
                {formatTime12h(item.time)}
                {countdown && <span className="ml-1.5 text-primary">{countdown}</span>}
              </p>
            </div>
          </>
        )

        if (isMeal) {
          return (
            <li key={item.id}>
              <Link to="/nutrition" className={rowClass}>
                {inner}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-2" />
              </Link>
            </li>
          )
        }

        return (
          <li key={item.id} className={rowClass}>
            {inner}
          </li>
        )
      })}
    </ol>
  )
}
