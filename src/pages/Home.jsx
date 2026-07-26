import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Footprints,
  Utensils,
  Dumbbell,
  Droplet,
  Moon as MoonIcon,
  Quote as QuoteIcon,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import GreetingScene from '../components/greeting/GreetingScene'
import { useTracker, dateKey } from '../lib/store'
import { getDayPeriod, PERIOD_META } from '../lib/timeOfDay'
import { pickQuote } from '../lib/quotes'
import { STEPS_GOAL, MEALS_GOAL, MAIN_MEAL_SLOTS } from '../lib/goals'
import { MEAL_SLOT_LABELS } from '../lib/seedData'
import { format } from '../lib/dateUtils'

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-md sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

function FocusPanel({ period, stepsToday, mealsLoggedCount, sessions, completedSessions, meals }) {
  if (period === 'afternoon') {
    return (
      <Panel>
        <p className="text-xs font-medium uppercase tracking-wide text-white/60">Meals so far</p>
        <div className="mt-3 flex flex-col gap-2">
          {MAIN_MEAL_SLOTS.map((slot) => {
            const done = meals[slot].length > 0
            return (
              <div key={slot} className="flex items-center gap-2 text-sm text-white/90">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-white/40" />
                )}
                {MEAL_SLOT_LABELS[slot]}
              </div>
            )
          })}
        </div>
      </Panel>
    )
  }

  const title =
    period === 'morning' ? "Today's goals" : period === 'evening' ? "Today's progress" : "Today's recap"
  const stat = period === 'morning' || period === 'night' ? `${stepsToday.toLocaleString()}` : `${completedSessions.length}/${sessions.length}`
  const statLabel = period === 'morning' || period === 'night' ? `of ${STEPS_GOAL.toLocaleString()} steps` : 'sessions completed'

  return (
    <Panel>
      <p className="text-xs font-medium uppercase tracking-wide text-white/60">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold text-white">{stat}</p>
      <p className="mt-1 text-sm text-white/70">{statLabel}</p>
      <p className="mt-3 text-sm text-white/80">
        {mealsLoggedCount} of {MEALS_GOAL} meals logged
      </p>
    </Panel>
  )
}

function WorkoutPanel({ period, sessions, pendingSessions, remainingMeals, stepsToday }) {
  let icon = Dumbbell
  let title = ''
  let subtext = ''
  let link = null

  if (period === 'morning') {
    const next = sessions[0]
    icon = Dumbbell
    title = next ? next.name : 'No workout planned yet'
    subtext = next ? `${next.category} · ${next.durationMinutes} min` : 'Add a session before you start the day'
    link = { to: '/workouts', label: next ? 'Start workout' : 'Plan a session' }
  } else if (period === 'afternoon') {
    icon = Droplet
    title = 'Stay hydrated'
    subtext = `You're at ${stepsToday.toLocaleString()} steps — remember water through the afternoon.`
    if (remainingMeals.length > 0) link = { to: '/nutrition', label: 'Log remaining meals' }
    else if (pendingSessions.length > 0) link = { to: '/workouts', label: 'Complete today\'s session' }
  } else if (period === 'evening') {
    icon = Utensils
    title = 'Recover & prep'
    subtext = 'Prep tonight\'s meals and get tomorrow ready.'
    link = { to: '/meal-plans', label: 'Browse meal plans' }
  } else {
    icon = MoonIcon
    title = 'Wind down'
    subtext = 'Aim for 7–9 hours of rest tonight.'
  }

  const Icon = icon

  return (
    <Panel className="flex flex-col justify-between">
      <div>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <p className="mt-3 font-display text-base font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-white/75">{subtext}</p>
      </div>
      {link && (
        <Link
          to={link.to}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white hover:underline"
        >
          {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </Panel>
  )
}

export default function Home() {
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
  const remainingMeals = MAIN_MEAL_SLOTS.filter((slot) => meals[slot].length === 0).map((s) => MEAL_SLOT_LABELS[s])
  const stepsToday = workout.steps || 0
  const sessions = workout.sessions
  const completedSessions = sessions.filter((s) => s.completed)
  const pendingSessions = sessions.filter((s) => !s.completed)

  const timeString = format(now, 'h:mm:ss a')
  const dateString = format(now, 'EEEE, MMMM d')

  return (
    <div className="relative flex min-h-[calc(100dvh-64px)] flex-1 flex-col overflow-hidden lg:min-h-dvh">
      <GreetingScene period={period} />
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-10 p-6 sm:p-10 lg:p-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-white/70">{dateString}</p>
            <h1 className="mt-2 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              {meta.greeting}
            </h1>
            <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">{meta.message}</p>
          </div>
          <div className="self-start rounded-2xl bg-black/30 px-5 py-3 text-right backdrop-blur-sm">
            <p className="font-display text-3xl font-semibold tabular-nums text-white sm:text-4xl">{timeString}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FocusPanel
            period={period}
            stepsToday={stepsToday}
            mealsLoggedCount={mealsLoggedCount}
            sessions={sessions}
            completedSessions={completedSessions}
            meals={meals}
          />
          <Panel className="flex flex-col justify-center">
            <QuoteIcon className="h-5 w-5 shrink-0 text-white/50" />
            <p className="mt-3 text-lg italic leading-snug text-white/90">{quote}</p>
          </Panel>
          <WorkoutPanel
            period={period}
            sessions={sessions}
            pendingSessions={pendingSessions}
            remainingMeals={remainingMeals}
            stepsToday={stepsToday}
          />
        </div>
      </div>
    </div>
  )
}
