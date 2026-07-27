import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  Bell,
  Repeat,
  CalendarDays,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Fab from '../components/Fab'
import BottomSheet from '../components/BottomSheet'
import Celebration from '../components/Celebration'
import { useTracker, dateKey } from '../lib/store'
import { useCelebration } from '../lib/useCelebration'
import { CATEGORIES, CATEGORY_LIST } from '../lib/categories'
import { ACTIVITY_TEMPLATES } from '../lib/activityTemplates'
import { getIcon, ICON_OPTIONS } from '../lib/icons'
import { format, parseDateKey } from '../lib/dateUtils'

const COLOR_SWATCHES = ['#8b5cf6', '#c026d3', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4', '#ef4444', '#64748b']
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRIORITIES = ['low', 'medium', 'high']

function formatRepeat(activity) {
  if (activity.repeat === 'daily') return 'Every day'
  if (activity.repeat === 'weekly') {
    if (!activity.weeklyDays?.length) return 'Weekly'
    const days = [...activity.weeklyDays].sort().map((d) => WEEKDAY_LABELS[d])
    return `Every ${days.join(', ')}`
  }
  if (activity.date) {
    try {
      return format(parseDateKey(activity.date), 'MMM d')
    } catch {
      return 'One-off'
    }
  }
  return 'One-off'
}

function ActivityCard({ activity, completedToday, onToggleToday, onEdit, onDelete }) {
  const Icon = getIcon(activity.icon)
  const cat = CATEGORIES[activity.category]

  return (
    <GlassCard className="flex items-start gap-3 p-4">
      <button
        type="button"
        onClick={onToggleToday}
        aria-label={completedToday ? 'Mark incomplete for today' : 'Mark complete for today'}
        className="mt-0.5 grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors"
        style={{
          borderColor: completedToday ? activity.color : 'rgba(255,255,255,0.2)',
          backgroundColor: completedToday ? activity.color : 'transparent',
        }}
      >
        {completedToday && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </button>

      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${activity.color}26`, color: activity.color }}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">{activity.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              {activity.startTime ? activity.startTime : 'No time set'}
              {activity.endTime ? ` – ${activity.endTime}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="grid h-9 w-9 cursor-pointer place-items-center text-muted-2 transition-colors hover:text-foreground"
              aria-label={`Edit ${activity.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="grid h-9 w-9 cursor-pointer place-items-center text-muted-2 transition-colors hover:text-destructive"
              aria-label={`Delete ${activity.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
          <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
            {cat.label}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
            <Repeat className="h-3 w-3" /> {formatRepeat(activity)}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5">{activity.points} pts</span>
          {activity.reminder && (
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5">
              <Bell className="h-3 w-3" /> Reminder
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function ActivitySheet({ open, onClose, onSave, initial }) {
  const isEdit = !!initial
  const [templateId, setTemplateId] = useState(null)
  const [name, setName] = useState(initial?.name || '')
  const [icon, setIcon] = useState(initial?.icon || 'Star')
  const [color, setColor] = useState(initial?.color || COLOR_SWATCHES[0])
  const [category, setCategory] = useState(initial?.category || 'lifestyle')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [points, setPoints] = useState(initial?.points ?? 10)
  const [notes, setNotes] = useState(initial?.notes || '')
  const [startTime, setStartTime] = useState(initial?.startTime || '')
  const [endTime, setEndTime] = useState(initial?.endTime || '')
  const [repeat, setRepeat] = useState(initial?.repeat || 'none')
  const [weeklyDays, setWeeklyDays] = useState(initial?.weeklyDays || [])
  const [reminder, setReminder] = useState(initial?.reminder || false)

  const applyTemplate = (t) => {
    setTemplateId(t.id)
    setName(t.name)
    setIcon(t.icon)
    setCategory(t.category)
    setPoints(t.points)
  }

  const toggleWeekday = (d) => {
    setWeeklyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      icon,
      color,
      category,
      priority,
      points: Number(points) || 0,
      notes: notes.trim(),
      startTime,
      endTime,
      repeat,
      weeklyDays: repeat === 'weekly' ? weeklyDays : [],
      date: repeat === 'none' ? dateKey(new Date()) : null,
      reminder,
      templateId: templateId || initial?.templateId || null,
    })
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Edit activity' : 'New activity'}>
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        {!isEdit && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ACTIVITY_TEMPLATES.map((t) => {
              const TIcon = getIcon(t.icon)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-colors ${
                    templateId === t.id ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  <TIcon className="h-4 w-4" />
                  {t.name}
                </button>
              )
            })}
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Activity name"
          autoFocus
          className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />

        <div className="flex gap-3">
          <label className="flex-1">
            <span className="mb-1.5 block text-xs text-muted">Start time</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="min-h-12 w-full cursor-pointer rounded-xl border border-border bg-white/5 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1.5 block text-xs text-muted">End time</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="min-h-12 w-full cursor-pointer rounded-xl border border-border bg-white/5 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Icon</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ICON_OPTIONS.map((name_) => {
              const OptIcon = getIcon(name_)
              return (
                <button
                  key={name_}
                  type="button"
                  onClick={() => setIcon(name_)}
                  aria-label={name_}
                  className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors ${
                    icon === name_ ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-white/5 text-muted'
                  }`}
                >
                  <OptIcon className="h-5 w-5" />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Colour</span>
          <div className="flex gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-2"
                style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }}
              >
                {color === c && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`min-h-10 cursor-pointer rounded-full px-3.5 text-sm font-medium transition-colors ${
                  category === c.id ? 'text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
                style={category === c.id ? { backgroundColor: c.color } : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <span className="mb-1.5 block text-xs text-muted">Priority</span>
            <div className="flex gap-1 rounded-lg bg-white/5 p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`min-h-9 flex-1 cursor-pointer rounded-md text-xs font-medium capitalize transition-colors ${
                    priority === p ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <label className="w-28">
            <span className="mb-1.5 block text-xs text-muted">Points</span>
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ''))}
              className="min-h-9 w-full rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-muted">Repeat</span>
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            {['none', 'daily', 'weekly'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRepeat(r)}
                className={`min-h-10 flex-1 cursor-pointer rounded-md text-sm font-medium capitalize transition-colors ${
                  repeat === r ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                {r === 'none' ? 'Once' : r}
              </button>
            ))}
          </div>
          {repeat === 'weekly' && (
            <div className="mt-2 flex gap-1.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`grid h-10 flex-1 cursor-pointer place-items-center rounded-lg text-xs font-medium transition-colors ${
                    weeklyDays.includes(i) ? 'bg-primary text-white' : 'bg-white/5 text-muted'
                  }`}
                >
                  {label[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-border bg-white/5 px-4">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <Bell className="h-4 w-4 text-muted" /> Reminder
          </span>
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-primary"
          />
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />

        <button
          type="submit"
          className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          {isEdit ? 'Save changes' : 'Add activity'}
        </button>
      </form>
    </BottomSheet>
  )
}

export default function Schedule() {
  const { activities, addActivity, updateActivity, removeActivity, getActivitiesForDate, toggleActivityCompletion } =
    useTracker()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { message, celebrate } = useCelebration()

  const todayKey = dateKey(new Date())
  const todayOccurrences = useMemo(() => getActivitiesForDate(todayKey), [activities, todayKey])
  const completedMap = useMemo(() => {
    const map = {}
    for (const occ of todayOccurrences) map[occ.id] = occ.completed
    return map
  }, [todayOccurrences])

  const handleToggleToday = (activity) => {
    toggleActivityCompletion(todayKey, activity.id)
    if (!completedMap[activity.id]) celebrate(`${activity.name} complete — nice work.`)
  }

  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99')),
    [activities]
  )

  const editingActivity = activities.find((a) => a.id === editingId) || null

  const handleSave = (data) => {
    if (editingId) updateActivity(editingId, data)
    else addActivity(data)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">My Daily Schedule</h1>
        <p className="mt-1 text-sm text-muted">Build the activities that make up your day — anything counts</p>
      </div>

      {sortedActivities.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sortedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              completedToday={!!completedMap[activity.id]}
              onToggleToday={() => handleToggleToday(activity)}
              onEdit={() => {
                setEditingId(activity.id)
                setSheetOpen(true)
              }}
              onDelete={() => {
                if (window.confirm(`Delete "${activity.name}"?`)) removeActivity(activity.id)
              }}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center gap-3 p-10 text-center">
          <CalendarDays className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">Nothing scheduled yet.</p>
          <p className="text-xs text-muted-2">
            Tap the + button to add your first activity — gym, work, gaming, meditation, anything.
          </p>
        </GlassCard>
      )}

      <Fab
        onClick={() => {
          setEditingId(null)
          setSheetOpen(true)
        }}
        icon={Plus}
        label="Add activity"
      />
      <ActivitySheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false)
          setEditingId(null)
        }}
        onSave={handleSave}
        initial={editingActivity}
      />
      <Celebration message={message} />
    </div>
  )
}
