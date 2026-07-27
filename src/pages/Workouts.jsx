import { useMemo, useState } from 'react'
import { Footprints, Trash2, Check, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import MonthCalendar from '../components/MonthCalendar'
import Fab from '../components/Fab'
import BottomSheet from '../components/BottomSheet'
import { useTracker, dateKey } from '../lib/store'
import { EXERCISE_LIBRARY } from '../lib/seedData'
import { format } from '../lib/dateUtils'

function minutesBetween(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = eh * 60 + em - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60
  return diff
}

function SessionRow({ session, onToggle, onUpdate, onRemove }) {
  const computedDuration = minutesBetween(session.startTime, session.endTime)

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        session.completed ? 'border-accent/30 bg-accent/[0.06]' : 'border-border bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggle(session.id)}
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
          <div className="pt-1.5">
            <p className="font-display text-sm font-semibold text-foreground">{session.name}</p>
            <p className="text-xs text-muted">{session.category}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(session.id)}
          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center text-muted-2 transition-colors hover:text-destructive"
          aria-label={`Remove ${session.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 pl-12">
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          Start
          <input
            type="time"
            value={session.startTime}
            onChange={(e) => onUpdate(session.id, { startTime: e.target.value })}
            className="min-h-9 cursor-pointer rounded-md border border-border bg-white/5 px-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          End
          <input
            type="time"
            value={session.endTime}
            onChange={(e) => onUpdate(session.id, { endTime: e.target.value })}
            className="min-h-9 cursor-pointer rounded-md border border-border bg-white/5 px-2 text-xs text-foreground focus:border-primary/60 focus:outline-none"
          />
        </label>
        <span className="text-xs text-muted-2">
          {computedDuration != null ? `${computedDuration} min` : `~${session.durationMinutes} min planned`}
        </span>
      </div>
    </div>
  )
}

function AddSessionSheet({ open, onClose, onAdd, selectedDateLabel }) {
  const [exerciseId, setExerciseId] = useState(EXERCISE_LIBRARY[0].id)
  const [justAdded, setJustAdded] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const exercise = EXERCISE_LIBRARY.find((ex) => ex.id === exerciseId)
    if (!exercise) return
    onAdd(exercise)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={`Add session · ${selectedDateLabel}`}>
      <form onSubmit={submit} className="flex flex-col gap-3 pb-2">
        <div className="flex flex-col gap-2">
          {EXERCISE_LIBRARY.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setExerciseId(ex.id)}
              className={`flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm transition-colors ${
                exerciseId === ex.id
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{ex.name}</span>
              <span className="text-xs text-muted-2">{ex.category}</span>
            </button>
          ))}
        </div>
        <button
          type="submit"
          className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-medium text-white transition-colors ${
            justAdded ? 'bg-accent' : 'bg-primary hover:opacity-90'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            'Add session'
          )}
        </button>
      </form>
    </BottomSheet>
  )
}

export default function Workouts() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { getWorkoutForDate, workouts, addSession, removeSession, toggleSessionComplete, updateSession, setSteps } =
    useTracker()
  const [sheetOpen, setSheetOpen] = useState(false)

  const key = dateKey(selectedDate)
  const dayWorkout = getWorkoutForDate(key)

  const markedDates = useMemo(() => {
    const set = new Set()
    for (const [k, day] of Object.entries(workouts)) {
      if (day.sessions?.length > 0) set.add(k)
    }
    return set
  }, [workouts])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Workouts</h1>
        <p className="mt-1 text-sm text-muted">Log sessions, steps, and time spent training</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <MonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
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

        <div className="flex flex-col gap-4">
          {dayWorkout.sessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dayWorkout.sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onToggle={(id) => toggleSessionComplete(key, id)}
                  onUpdate={(id, patch) => updateSession(key, id, patch)}
                  onRemove={(id) => removeSession(key, id)}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-muted">No sessions logged for {format(selectedDate, 'MMMM d')} yet.</p>
              <p className="mt-1 text-xs text-muted-2">Tap the + button to add your first session.</p>
            </GlassCard>
          )}
        </div>
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Add session" />
      <AddSessionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={(exercise) => addSession(key, exercise)}
        selectedDateLabel={format(selectedDate, 'MMM d')}
      />
    </div>
  )
}
