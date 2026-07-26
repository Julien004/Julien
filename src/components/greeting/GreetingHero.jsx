import { useEffect, useMemo, useState } from 'react'
import { Footprints, Utensils, Dumbbell, Droplet, CheckCircle2, Quote, Moon as MoonIcon } from 'lucide-react'
import GreetingScene from './GreetingScene'
import { useTracker, dateKey } from '../../lib/store'
import { getDayPeriod, PERIOD_META } from '../../lib/timeOfDay'
import { pickQuote } from '../../lib/quotes'
import { STEPS_GOAL, MEALS_GOAL, MAIN_MEAL_SLOTS } from '../../lib/goals'
import { MEAL_SLOT_LABELS } from '../../lib/seedData'
import { format } from '../../lib/dateUtils'

function GoalRow({ icon: Icon, label, status, done }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          done ? 'bg-accent/30 text-accent' : 'bg-white/10 text-white'
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{label}</p>
        {status && <p className="truncate text-xs text-white/70">{status}</p>}
      </div>
    </div>
  )
}

function PeriodBody({ period, stepsToday, mealsLoggedCount, sessions, completedSessions, pendingSessions, meals }) {
  if (period === 'morning') {
    const nextSession = sessions[0]
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <GoalRow
          icon={Footprints}
          label={`Steps goal: ${STEPS_GOAL.toLocaleString()}`}
          status={`${stepsToday.toLocaleString()} logged so far`}
          done={stepsToday >= STEPS_GOAL}
        />
        <GoalRow
          icon={Utensils}
          label={`Meals goal: ${MEALS_GOAL} a day`}
          status={`${mealsLoggedCount} of ${MEALS_GOAL} logged`}
          done={mealsLoggedCount >= MEALS_GOAL}
        />
        <GoalRow
          icon={Dumbbell}
          label={nextSession ? nextSession.name : 'No workout added yet'}
          status={nextSession ? nextSession.category : "Plan today's session"}
          done={nextSession ? nextSession.completed : false}
        />
      </div>
    )
  }

  if (period === 'afternoon') {
    const remainingMeals = MAIN_MEAL_SLOTS.filter((slot) => meals[slot].length === 0)
    const remaining = [...remainingMeals.map((s) => MEAL_SLOT_LABELS[s]), ...pendingSessions.map((s) => s.name)]
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MAIN_MEAL_SLOTS.map((slot) => (
            <GoalRow
              key={slot}
              icon={Utensils}
              label={MEAL_SLOT_LABELS[slot]}
              status={meals[slot].length > 0 ? 'Logged' : 'Not logged yet'}
              done={meals[slot].length > 0}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <Droplet className="h-4 w-4 shrink-0 text-white" />
          <p className="text-sm text-white/90">
            {stepsToday < STEPS_GOAL
              ? `You're at ${stepsToday.toLocaleString()} steps — a short walk gets you closer to ${STEPS_GOAL.toLocaleString()}.`
              : "Steps goal hit — nice work."}{' '}
            Remember to stay hydrated through the afternoon.
          </p>
        </div>
        {remaining.length > 0 && (
          <p className="text-sm text-white/75">Still to do: {remaining.join(', ')}.</p>
        )}
      </div>
    )
  }

  if (period === 'evening') {
    const remaining = [
      ...MAIN_MEAL_SLOTS.filter((slot) => meals[slot].length === 0).map((s) => MEAL_SLOT_LABELS[s]),
      ...pendingSessions.map((s) => s.name),
    ]
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <GoalRow
            icon={Utensils}
            label={`${mealsLoggedCount} of ${MEALS_GOAL} meals logged`}
            status="Nutrition"
            done={mealsLoggedCount >= MEALS_GOAL}
          />
          <GoalRow
            icon={Dumbbell}
            label={`${completedSessions.length} of ${sessions.length} sessions done`}
            status="Training"
            done={sessions.length > 0 && pendingSessions.length === 0}
          />
        </div>
        <p className="text-sm text-white/85">
          {remaining.length > 0 ? `Still left: ${remaining.join(', ')}.` : 'Everything is done for today.'} Take time
          to recover, prep your meals, and get tomorrow ready.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <GoalRow icon={Footprints} label="Steps today" status={stepsToday.toLocaleString()} done={stepsToday >= STEPS_GOAL} />
        <GoalRow
          icon={Utensils}
          label="Meals logged"
          status={`${mealsLoggedCount} of ${MEALS_GOAL}`}
          done={mealsLoggedCount >= MEALS_GOAL}
        />
        <GoalRow
          icon={Dumbbell}
          label="Sessions completed"
          status={`${completedSessions.length} of ${sessions.length}`}
          done={sessions.length > 0 && pendingSessions.length === 0}
        />
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
        <MoonIcon className="h-4 w-4 shrink-0 text-white" />
        <p className="text-sm text-white/90">Wind down and aim for 7–9 hours of rest tonight.</p>
      </div>
    </div>
  )
}

export default function GreetingHero() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { getMealsForDate, getWorkoutForDate } = useTracker()
  const todayKey = dateKey(now)
  const meals = getMealsForDate(todayKey)
  const workout = getWorkoutForDate(todayKey)

  const period = getDayPeriod(now)
  const meta = PERIOD_META[period]
  const quote = useMemo(() => pickQuote(period, now), [period, now])

  const mealsLoggedCount = MAIN_MEAL_SLOTS.filter((slot) => meals[slot].length > 0).length
  const stepsToday = workout.steps || 0
  const sessions = workout.sessions
  const completedSessions = sessions.filter((s) => s.completed)
  const pendingSessions = sessions.filter((s) => !s.completed)

  const timeString = format(now, 'h:mm:ss a')
  const dateString = format(now, 'EEEE, MMMM d')

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl shadow-black/40">
      <GreetingScene period={period} />
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-white/70">{dateString}</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">{meta.greeting}</h1>
            <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{meta.message}</p>
          </div>
          <div className="self-start rounded-2xl bg-black/30 px-4 py-2.5 text-right backdrop-blur-sm">
            <p className="font-display text-2xl font-semibold tabular-nums text-white sm:text-3xl">{timeString}</p>
          </div>
        </div>

        <PeriodBody
          period={period}
          stepsToday={stepsToday}
          mealsLoggedCount={mealsLoggedCount}
          sessions={sessions}
          completedSessions={completedSessions}
          pendingSessions={pendingSessions}
          meals={meals}
        />

        <div className="flex items-start gap-2 border-t border-white/15 pt-4">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
          <p className="text-sm italic text-white/80">{quote}</p>
        </div>
      </div>
    </div>
  )
}
