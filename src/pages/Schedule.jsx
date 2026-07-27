import { useEffect, useMemo, useState } from 'react'
import { addDays, subDays } from 'date-fns'
import { Plus, Check, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Fab from '../components/Fab'
import BottomSheet from '../components/BottomSheet'
import Celebration from '../components/Celebration'
import DayGrid from '../components/schedule/DayGrid'
import { useTracker, dateKey } from '../lib/store'
import { useCelebration } from '../lib/useCelebration'
import { ACTIVITY_CATEGORIES } from '../lib/activityCategories'
import { ACTIVITY_TEMPLATES } from '../lib/activityTemplates'
import { getIcon, ICON_OPTIONS } from '../lib/icons'
import { minutesToTime, timeToMinutes } from '../lib/dayGridLayout'
import { format, isSameDay } from '../lib/dateUtils'

const COLOR_SWATCHES = ['#8b5cf6', '#c026d3', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4', '#ef4444', '#64748b']
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRIORITIES = ['low', 'medium', 'high']
const REPEAT_OPTIONS = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return null
  let mins = timeToMinutes(endTime) - timeToMinutes(startTime)
  if (mins <= 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function ActivitySheet({ open, onClose, onSave, initial, defaultDate }) {
  const isEdit = !!initial
  const [templateId, setTemplateId] = useState(null)
  const [name, setName] = useState(initial?.name || '')
  const [icon, setIcon] = useState(initial?.icon || 'Star')
  const [color, setColor] = useState(initial?.color || COLOR_SWATCHES[0])
  const [category, setCategory] = useState(initial?.category || 'custom')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [points, setPoints] = useState(initial?.points ?? 10)
  const [notes, setNotes] = useState(initial?.notes || '')
  const [startTime, setStartTime] = useState(initial?.startTime || '')
  const [endTime, setEndTime] = useState(initial?.endTime || '')
  const [repeat, setRepeat] = useState(initial?.repeat || 'none')
  const [weeklyDays, setWeeklyDays] = useState(initial?.weeklyDays || [])
  const [reminder, setReminder] = useState(initial?.reminder || false)

  useEffect(() => {
    if (!open) return
    setTemplateId(null)
    setName(initial?.name || '')
    setIcon(initial?.icon || 'Star')
    setColor(initial?.color || COLOR_SWATCHES[0])
    setCategory(initial?.category || 'custom')
    setPriority(initial?.priority || 'medium')
    setPoints(initial?.points ?? 10)
    setNotes(initial?.notes || '')
    setStartTime(initial?.startTime || '')
    setEndTime(initial?.endTime || '')
    setRepeat(initial?.repeat || 'none')
    setWeeklyDays(initial?.weeklyDays || [])
    setReminder(initial?.reminder || false)
  }, [open, initial])

  const applyTemplate = (t) => {
    setTemplateId(t.id)
    setName(t.name)
    setIcon(t.icon)
    setPoints(t.points)
  }

  const applyCategory = (c) => {
    setCategory(c.id)
    setIcon(c.icon)
    setColor(c.color)
  }

  const toggleWeekday = (d) => {
    setWeeklyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  }

  const duration = formatDuration(startTime, endTime)

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
      date: initial?.date || defaultDate,
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
                    templateId === t.id
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-white/5 text-muted hover:bg-white/10'
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

        <div>
          <span className="mb-1.5 block text-xs text-muted">Category</span>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_CATEGORIES.map((c) => {
              const CIcon = getIcon(c.icon)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => applyCategory(c)}
                  className={`flex min-h-10 items-center gap-1.5 cursor-pointer rounded-full px-3.5 text-sm font-medium transition-colors ${
                    category === c.id ? 'text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                  }`}
                  style={category === c.id ? { backgroundColor: c.color } : undefined}
                >
                  <CIcon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

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
        {duration && <p className="-mt-2 text-xs text-muted-2">Duration: {duration}</p>}

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
          <div className="flex flex-wrap gap-1.5">
            {REPEAT_OPTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRepeat(r.id)}
                className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${
                  repeat === r.id ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:text-foreground'
                }`}
              >
                {r.label}
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
          {repeat === 'monthly' && (
            <p className="mt-2 text-xs text-muted-2">Repeats every month on this same date.</p>
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
  const {
    activities,
    addActivity,
    updateActivity,
    removeActivity,
    duplicateActivity,
    getActivitiesForDate,
    toggleActivityCompletion,
  } = useTracker()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [now, setNow] = useState(() => new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { message, celebrate } = useCelebration()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const selectedKey = dateKey(selectedDate)
  const dayOccurrences = useMemo(
    () => getActivitiesForDate(selectedKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities, selectedKey]
  )

  const progress = useMemo(() => {
    const totalPoints = dayOccurrences.reduce((s, a) => s + (a.points || 0), 0)
    const donePoints = dayOccurrences.filter((a) => a.completed).reduce((s, a) => s + (a.points || 0), 0)
    return totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0
  }, [dayOccurrences])

  const editingActivity = editingId ? activities.find((a) => a.id === editingId) || null : null

  const handleSave = (data) => {
    if (editingId) updateActivity(editingId, data)
    else addActivity(data)
    setEditingId(null)
  }

  const handleToggleComplete = (activity) => {
    toggleActivityCompletion(selectedKey, activity.id)
    if (!activity.completed) celebrate(`${activity.name} complete — nice work.`)
  }

  const handleReschedule = (activity, newStartTime) => {
    const duration = activity.endTime
      ? timeToMinutes(activity.endTime) - timeToMinutes(activity.startTime)
      : null
    const patch = { startTime: newStartTime }
    if (duration != null && duration > 0) {
      patch.endTime = minutesToTime(timeToMinutes(newStartTime) + duration)
    }
    updateActivity(activity.id, patch)
  }

  const handleDuplicate = (activity) => {
    duplicateActivity(activity.id)
  }

  const handleDelete = (activity) => {
    if (window.confirm(`Delete "${activity.name}"?`)) removeActivity(activity.id)
  }

  const isToday = isSameDay(selectedDate, now)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">My Daily Schedule</h1>
        <p className="mt-1 text-sm text-muted">Plan your day hour by hour — anything counts</p>
      </div>

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            aria-label="Previous day"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-foreground sm:text-lg">
              {format(selectedDate, 'EEEE, MMM d')}
            </p>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                Back to today
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            aria-label="Next day"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Day progress</span>
            <span className="text-muted">{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </GlassCard>

      <DayGrid
        activities={dayOccurrences}
        selectedDate={selectedDate}
        now={now}
        onEdit={(activity) => {
          setEditingId(activity.id)
          setSheetOpen(true)
        }}
        onToggleComplete={handleToggleComplete}
        onReschedule={handleReschedule}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

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
        defaultDate={selectedKey}
      />
      <Celebration message={message} />
    </div>
  )
}
