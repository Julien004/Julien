import { useRef, useState } from 'react'
import { Check, MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react'
import { getIcon } from '../../lib/icons'
import { snapMinutes, minutesToTime, GRID_HEIGHT } from '../../lib/dayGridLayout'

function formatTime12h(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function ActivityBlock({ activity, onTap, onToggleComplete, onReschedule, onDuplicate, onDelete }) {
  const [liveTop, setLiveTop] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const dragRef = useRef(null)
  const Icon = getIcon(activity.icon)

  const top = liveTop ?? activity.top
  const narrow = activity.totalCols >= 3
  const compact = activity.height < 44 || narrow

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    dragRef.current = {
      startY: e.clientY,
      startTop: activity.top,
      moved: false,
      pointerId: e.pointerId,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    const deltaY = e.clientY - drag.startY
    if (Math.abs(deltaY) > 5) drag.moved = true
    if (!drag.moved) return
    const newTop = Math.max(0, Math.min(GRID_HEIGHT - activity.height, drag.startTop + deltaY))
    setLiveTop(newTop)
  }

  const handlePointerUp = (e) => {
    const drag = dragRef.current
    if (!drag) return
    e.currentTarget.releasePointerCapture(drag.pointerId)
    if (drag.moved) {
      const snapped = snapMinutes(liveTop ?? activity.top)
      onReschedule(minutesToTime(snapped))
    } else {
      onTap()
    }
    dragRef.current = null
    setLiveTop(null)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`absolute cursor-grab select-none rounded-lg border-l-4 py-1 text-left shadow-sm transition-shadow active:z-30 active:cursor-grabbing active:shadow-lg ${
        narrow ? 'px-1' : 'px-2'
      }`}
      style={{
        top: `${top}px`,
        height: `${activity.height}px`,
        left: `calc(${(activity.col / activity.totalCols) * 100}% + 2px)`,
        width: `calc(${100 / activity.totalCols}% - 4px)`,
        backgroundColor: `${activity.color}22`,
        borderLeftColor: activity.color,
        touchAction: 'none',
        opacity: activity.completed ? 0.55 : 1,
      }}
    >
      <div className="flex h-full items-start gap-1.5 overflow-hidden">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
          className="mt-0.5 grid h-4 w-4 shrink-0 cursor-pointer place-items-center rounded-full border-2"
          style={{
            borderColor: activity.color,
            backgroundColor: activity.completed ? activity.color : 'transparent',
          }}
        >
          {activity.completed && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {!narrow && <Icon className="h-3 w-3 shrink-0" style={{ color: activity.color }} />}
            <p
              className={`truncate text-xs font-semibold text-foreground ${
                activity.completed ? 'line-through' : ''
              }`}
            >
              {activity.name}
            </p>
          </div>
          {!compact && (
            <p className="truncate text-[10px] text-muted-2">
              {formatTime12h(activity.startTime)}
              {activity.endTime ? ` – ${formatTime12h(activity.endTime)}` : ''}
            </p>
          )}
        </div>

        {!compact && (
          <div className="relative shrink-0">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              aria-label="Activity options"
              className="grid h-6 w-6 cursor-pointer place-items-center rounded text-muted-2 hover:bg-white/10 hover:text-foreground"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-6 z-50 w-32 overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onTap()
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-white/5"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDuplicate()
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-white/5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete()
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-destructive hover:bg-white/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
