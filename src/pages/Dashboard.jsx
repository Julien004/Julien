import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Footprints, Dumbbell, ArrowRight, Sparkles, Quote as QuoteIcon } from 'lucide-react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import ProgressRing from '../components/ProgressRing'
import GreetingScene from '../components/greeting/GreetingScene'
import StatisticsPanel from '../components/StatisticsPanel'
import Timeline from '../components/dashboard/Timeline'
import LifeBalance from '../components/dashboard/LifeBalance'
import NutritionSummary from '../components/dashboard/NutritionSummary'
import DailyReflection from '../components/dashboard/DailyReflection'
import Celebration from '../components/Celebration'
import { useTracker, caloriesForDay, proteinForDay, dateKey } from '../lib/store'
import { CALORIE_GOAL, STEPS_GOAL } from '../lib/goals'
import { lastNDays, format } from '../lib/dateUtils'
import { getDayPeriod, PERIOD_META } from '../lib/timeOfDay'
import { pickQuote } from '../lib/quotes'
import { useCelebration } from '../lib/useCelebration'
import { getTipsFor } from '../lib/activityTemplates'
import {
  buildTimelineForDate,
  getCurrentAndNext,
  computeDailyProgress,
  computeLifeBalance,
  formatCountdown,
} from '../lib/timeline'

export default function Dashboard() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])

  const {
    getMealsForDate,
    getWorkoutForDate,
    workouts,
    getActivitiesForDate,
    toggleActivityCompletion,
    toggleSessionComplete,
    getWaterForDate,
    addWater,
    getSleepForDate,
    setSleepHours,
    reflections,
    saveReflection,
  } = useTracker()

  const todayKey = dateKey(now)
  const todayMeals = getMealsForDate(todayKey)
  const todayWorkout = getWorkoutForDate(todayKey)
  const todayActivities = getActivitiesForDate(todayKey)

  const caloriesToday = caloriesForDay(todayMeals)
  const proteinToday = proteinForDay(todayMeals)
  const stepsToday = todayWorkout.steps || 0

  const period = getDayPeriod(now)
  const meta = PERIOD_META[period]
  const quote = useMemo(() => pickQuote(period, now), [period, now])
  const timeString = format(now, 'h:mm a')
  const dateString = format(now, 'EEEE, MMMM d')

  const timeline = useMemo(
    () => buildTimelineForDate({ activities: todayActivities, workout: todayWorkout, meals: todayMeals }),
    [todayActivities, todayWorkout, todayMeals]
  )
  const { current, next, countdownMinutes } = useMemo(() => getCurrentAndNext(timeline.timed, now), [timeline, now])
  const progress = useMemo(() => computeDailyProgress(timeline.all), [timeline])
  const balance = useMemo(() => computeLifeBalance(timeline.all), [timeline])

  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const w = workouts[dateKey(d)]
    if (w?.sessions?.some((s) => s.completed)) streak += 1
    else break
  }

  const { message, celebrate } = useCelebration()

  const handleToggleTimelineItem = (item) => {
    if (item.sourceType === 'activity') toggleActivityCompletion(todayKey, item.sourceId)
    else if (item.sourceType === 'workout') toggleSessionComplete(todayKey, item.sourceId)
    if (!item.completed) celebrate(`${item.name} complete — nice work.`)
  }

  const week = lastNDays(7, now)
  const chartData = week.map((d) => {
    const key = dateKey(d)
    return { label: format(d, 'EEE'), steps: workouts[key]?.steps || 0 }
  })

  const completedToday = todayWorkout.sessions.filter((s) => s.completed).length
  const totalSessionsToday = todayWorkout.sessions.length

  const water = getWaterForDate(todayKey)
  const sleepHours = getSleepForDate(todayKey)
  const todayReflection = reflections[todayKey] || null

  const currentTips = current ? getTipsFor(current.templateId, current.category) : []

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex flex-col overflow-hidden">
        <GreetingScene period={period} />
        <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-8 lg:p-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70">{dateString}</p>
              <h1 className="mt-1 break-words font-display text-3xl font-bold leading-[1.05] text-white sm:text-4xl lg:text-5xl">
                {meta.greeting}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{meta.message}</p>
              {streak > 0 && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                  <Sparkles className="h-3.5 w-3.5" /> {streak} day streak
                </span>
              )}
            </div>
            <div className="self-start rounded-2xl bg-black/30 px-5 py-2.5 text-right backdrop-blur-sm">
              <p className="font-display text-2xl font-semibold tabular-nums text-white sm:text-3xl">{timeString}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              {current ? 'Happening now' : next ? 'Up next' : "What's next"}
            </p>
            {current ? (
              <>
                <p className="mt-1.5 font-display text-lg font-semibold text-white">{current.name}</p>
                {currentTips.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1">
                    {currentTips.slice(0, 2).map((tip) => (
                      <li key={tip} className="text-xs text-white/70">
                        · {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : next ? (
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="font-display text-lg font-semibold text-white">{next.name}</p>
                <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                  {formatCountdown(countdownMinutes)}
                </span>
              </div>
            ) : (
              <p className="mt-1.5 font-display text-lg font-semibold text-white">You're all caught up for today.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-md">
              <ProgressRing progress={progress.percent / 100} size={92} stroke={8} color="#8b5cf6">
                <p className="font-display text-lg font-bold text-white">{progress.percent}%</p>
              </ProgressRing>
              <div>
                <p className="text-xs text-white/60">Daily Progress</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">{progress.completedPoints}</p>
                <p className="text-xs text-white/60">Life Score today</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-md">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">Life Balance</p>
              <LifeBalance balance={balance} />
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-white/15 bg-black/30 p-5 backdrop-blur-md">
              <QuoteIcon className="h-5 w-5 shrink-0 text-white/50" />
              <p className="mt-3 text-base italic leading-snug text-white/90">{quote}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:py-10 lg:pb-10">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Today's timeline</h2>
            <span className="text-xs text-muted">{progress.percent}% complete</span>
          </div>
          <div className="mt-4">
            <Timeline items={timeline.timed} currentId={current?.id} now={now} onToggle={handleToggleTimelineItem} />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Today's workout</h2>
              <Link to="/workouts" className="text-xs font-medium text-primary hover:underline">
                Manage
              </Link>
            </div>
            {totalSessionsToday > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                {todayWorkout.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-sm"
                  >
                    <span className={s.completed ? 'text-muted line-through' : 'text-foreground'}>{s.name}</span>
                    <span className="text-xs text-muted">{s.completed ? 'Done' : `${s.durationMinutes} min`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-2">No sessions logged yet today.</p>
            )}
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Nutrition & recovery</h2>
              <Link to="/nutrition" className="text-xs font-medium text-primary hover:underline">
                Manage
              </Link>
            </div>
            <div className="mt-4">
              <NutritionSummary
                caloriesToday={caloriesToday}
                proteinToday={proteinToday}
                waterMl={water}
                sleepHours={sleepHours}
                onAddWater={(ml) => addWater(todayKey, ml)}
                onSetSleep={(hrs) => setSleepHours(todayKey, hrs)}
              />
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Daily Reflection</h2>
          <div className="mt-4">
            <DailyReflection
              period={period}
              reflection={todayReflection}
              reflections={reflections}
              onSaveMood={(mood) => saveReflection(todayKey, { ...(reflections[todayKey] || {}), mood })}
              onSaveReflection={(data) => saveReflection(todayKey, { ...(reflections[todayKey] || {}), ...data })}
            />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Flame}
            label="Calories today"
            value={caloriesToday.toLocaleString()}
            sub={`of ${CALORIE_GOAL.toLocaleString()} kcal goal`}
            accent="secondary"
          />
          <StatCard
            icon={Footprints}
            label="Steps today"
            value={stepsToday.toLocaleString()}
            sub={`of ${STEPS_GOAL.toLocaleString()} goal`}
            accent="primary"
          />
          <StatCard
            icon={Dumbbell}
            label="Day streak"
            value={streak}
            sub={streak === 1 ? 'day of training' : 'days of training'}
            accent="accent"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Weekly activity</h2>
              <span className="text-xs text-muted">Steps, last 7 days</span>
            </div>
            <div className="relative mt-4 h-56 sm:h-64">
              {chartData.every((d) => d.steps === 0) ? (
                <div className="grid h-full place-items-center">
                  <p className="text-sm text-muted-2">No steps logged yet this week</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#131829',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: '#f8fafc',
                      }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="steps"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#stepsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <ProgressRing progress={stepsToday / STEPS_GOAL} color="#8b5cf6">
              <div>
                <p className="font-display text-xl font-bold">{Math.round((stepsToday / STEPS_GOAL) * 100)}%</p>
                <p className="text-[11px] text-muted">of goal</p>
              </div>
            </ProgressRing>
            <div>
              <p className="font-display text-sm font-semibold">Today's sessions</p>
              <p className="mt-1 text-xs text-muted">
                {totalSessionsToday === 0
                  ? 'No sessions planned yet'
                  : `${completedToday} of ${totalSessionsToday} completed`}
              </p>
            </div>
            <Link
              to="/workouts"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Go to workouts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/schedule">
            <GlassCard className="flex items-center justify-between p-5 transition-colors hover:bg-white/[0.06]">
              <div>
                <p className="font-display text-sm font-semibold">Build your daily schedule</p>
                <p className="mt-1 text-xs text-muted">Add anything — gym, work, gaming, meditation</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </GlassCard>
          </Link>
          <Link to="/meal-plans">
            <GlassCard className="flex items-center justify-between p-5 transition-colors hover:bg-white/[0.06]">
              <div>
                <p className="font-display text-sm font-semibold">Browse meal plans</p>
                <p className="mt-1 text-xs text-muted">Apply a preset plan to any day</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" />
            </GlassCard>
          </Link>
        </div>

        <StatisticsPanel />
      </div>
      <Celebration message={message} />
    </div>
  )
}
