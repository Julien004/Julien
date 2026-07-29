import { useMemo, useState } from 'react'
import { Footprints, Trash2, Check, Sparkles } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Fab from '../components/Fab'
import Celebration from '../components/Celebration'
import ActivityTypePicker from '../components/workouts/ActivityTypePicker'
import LogActivitySheet from '../components/workouts/LogActivitySheet'
import UpcomingActivities from '../components/workouts/UpcomingActivities'
import WeeklyDistribution from '../components/workouts/WeeklyDistribution'
import RecentSessions from '../components/workouts/RecentSessions'
import WeekStrip from '../components/workouts/WeekStrip'
import { getIcon } from '../lib/icons'
import { getActivityType } from '../lib/activityTypes'
import { summarizeSession } from '../lib/sessionSummary'
import { useTracker, dateKey } from '../lib/store'
import { format } from '../lib/dateUtils'
import { useCelebration } from '../lib/useCelebration'

function DaySessionRow({ session, onToggle, onEdit, onRemove }) {
  const type = getActivityType(session.activityType)
  const Icon = getIcon(type.icon)
  const summary = summarizeSession(session)

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        session.completed ? 'border-accent/30 bg-accent/[0.06]' : 'border-border bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={session.completed}
            aria-label={session.completed ? 'Mark session incomplete' : 'Mark session complete'}
            className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors ${
              session.completed
                ? 'border-accent bg-accent text-white'
                : 'border-muted-2 text-transparent hover:border-primary'
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </button>
          <button type="button" onClick={onEdit} className="min-w-0 cursor-pointer text-left">
            <span className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: type.color }} />
              <span className="truncate font-display text-sm font-semibold text-foreground">{session.name}</span>
            </span>
            <p className="mt-0.5 truncate text-xs text-muted">
              {summary}
              {session.startTime ? ` · ${session.startTime}` : ''}
            </p>
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center text-muted-2 transition-colors hover:text-destructive"
          aria-label={`Remove ${session.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function Workouts() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { workouts, getWorkoutForDate, addSession, removeSession, toggleSessionComplete, moveSession, setSteps } =
    useTracker()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [quickType, setQuickType] = useState(null)
  const { message, celebrate } = useCelebration()
  const now = useMemo(() => new Date(), [])

  const key = dateKey(selectedDate)
  const dayWorkout = getWorkoutForDate(key)

  const markedDates = useMemo(() => {
    const set = new Set()
    for (const [k, day] of Object.entries(workouts)) {
      if (day.sessions?.length > 0) set.add(k)
    }
    return set
  }, [workouts])

  const closeSheet = () => {
    setSheetOpen(false)
    setEditingSession(null)
    setQuickType(null)
  }

  const handleSave = (data) => {
    if (editingSession) {
      moveSession(editingSession.dateKey, data.date, editingSession.session.id, data)
    } else {
      addSession(data.date, data)
    }
    closeSheet()
  }

  const handleDelete = () => {
    if (!editingSession) return
    removeSession(editingSession.dateKey, editingSession.session.id)
    closeSheet()
  }

  const openEdit = (session, sKey) => {
    setQuickType(null)
    setEditingSession({ session, dateKey: sKey })
    setSheetOpen(true)
  }

  const openQuickLog = (typeId) => {
    setEditingSession(null)
    setQuickType(typeId)
    setSheetOpen(true)
  }

  const openFabLog = () => {
    setEditingSession(null)
    setQuickType(null)
    setSheetOpen(true)
  }

  const handleToggleSession = (session, sKey) => {
    toggleSessionComplete(sKey, session.id)
    if (!session.completed) celebrate(`${session.name} complete — nice work.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Activity Hub</h1>
        <p className="mt-1 text-sm text-muted">Move your way — every activity counts</p>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Choose an activity
        </div>
        <div className="mt-3">
          <ActivityTypePicker onSelect={openQuickLog} />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Footprints className="h-4 w-4 text-primary" />
              Steps for {format(selectedDate, 'MMM d')}
            </div>
            <input
              type="number"
              min="0"
              value={dayWorkout.steps || ''}
              onChange={(e) => setSteps(key, Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              placeholder="e.g. 6500"
              className="mt-3 min-h-12 w-full rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
            />
          </GlassCard>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-semibold text-foreground">Sessions on {format(selectedDate, 'MMM d')}</h2>
          {dayWorkout.sessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dayWorkout.sessions.map((session) => (
                <DaySessionRow
                  key={session.id}
                  session={session}
                  onToggle={() => handleToggleSession(session, key)}
                  onEdit={() => openEdit(session, key)}
                  onRemove={() => removeSession(key, session.id)}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-muted">Nothing logged for {format(selectedDate, 'MMMM d')} yet.</p>
              <p className="mt-1 text-xs text-muted-2">Choose an activity above, or tap + to log or plan one.</p>
            </GlassCard>
          )}
        </div>
      </div>

      <UpcomingActivities workouts={workouts} now={now} onSelect={openEdit} />
      <WeeklyDistribution workouts={workouts} now={now} />
      <RecentSessions workouts={workouts} now={now} onSelect={openEdit} />

      <Fab onClick={openFabLog} label="Log activity" />
      <LogActivitySheet
        open={sheetOpen}
        onClose={closeSheet}
        onSave={handleSave}
        onDelete={editingSession ? handleDelete : undefined}
        initial={editingSession ? { ...editingSession.session, date: editingSession.dateKey } : null}
        defaultDate={key}
        startType={quickType}
      />
      <Celebration message={message} />
    </div>
  )
}
