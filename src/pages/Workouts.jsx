import { useMemo, useState } from 'react'
import { Footprints, Plus, Trash2, Check, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import MonthCalendar from '../components/MonthCalendar'
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
            className={`mt-0.5 grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors ${
              session.completed
                ? 'border-accent bg-accent text-white'
                : 'border-muted-2 text-transparent hover:border-primary'
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
          <div>
            <p className={`font-display text-sm font-semibold ${session.completed ? 'text-foreground' : 'text-foreground'}`}>
              {session.name}
            </p>
            <p className="text-xs text-muted">{session.category}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(session.id)}
          className="cursor-pointer text-muted-2 transition-colors hover:text-destructive"
          aria-label={`Remove ${session.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 pl-9">
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          Start
          <input
            type="time"
            value={session.startTime}
            onChange={(e) => onUpdate(session.id, { startTime: e.target.value })}
            className="cursor-pointer rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground focus:border-primary/60 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          End
          <input
            type="time"
            value={session.endTime}
            onChange={(e) => onUpdate(session.id, { endTime: e.target.value })}
            className="cursor-pointer rounded-md border border-border bg-white/5 px-2 py-1 text-xs text-foreground focus:border-primary/60 focus:outline-none"
          />
        </label>
        <span className="text-xs text-muted-2">
          {computedDuration != null ? `${computedDuration} min` : `~${session.durationMinutes} min planned`}
        </span>
      </div>
    </div>
  )
}

export default function Workouts() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { getWorkoutForDate, workouts, addSession, removeSession, toggleSessionComplete, updateSession, setSteps } =
    useTracker()
  const [exerciseId, setExerciseId] = useState(EXERCISE_LIBRARY[0].id)

  const key = dateKey(selectedDate)
  const dayWorkout = getWorkoutForDate(key)

  const markedDates = useMemo(() => {
    const set = new Set()
    for (const [k, day] of Object.entries(workouts)) {
      if (day.sessions?.length > 0) set.add(k)
    }
    return set
  }, [workouts])

  const handleAddSession = () => {
    const exercise = EXERCISE_LIBRARY.find((e) => e.id === exerciseId)
    if (exercise) addSession(key, exercise)
  }

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
              className="mt-3 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
            />
          </GlassCard>
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none"
              >
                {EXERCISE_LIBRARY.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-surface">
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSession}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add session
              </button>
            </div>
          </GlassCard>

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
              <p className="mt-1 text-xs text-muted-2">Pick an exercise above and add your first session.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
