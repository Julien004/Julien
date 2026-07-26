import { Link } from 'react-router-dom'
import { Flame, Footprints, Dumbbell, ArrowRight } from 'lucide-react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import ProgressRing from '../components/ProgressRing'
import { useTracker, caloriesForDay, dateKey } from '../lib/store'
import { lastNDays, format } from '../lib/dateUtils'

const CALORIE_GOAL = 2100
const STEPS_GOAL = 8000

export default function Dashboard() {
  const { getMealsForDate, getWorkoutForDate, workouts } = useTracker()

  const today = new Date()
  const todayKey = dateKey(today)
  const todayMeals = getMealsForDate(todayKey)
  const todayWorkout = getWorkoutForDate(todayKey)
  const caloriesToday = caloriesForDay(todayMeals)
  const stepsToday = todayWorkout.steps || 0

  const week = lastNDays(7, today)
  const chartData = week.map((d) => {
    const key = dateKey(d)
    return {
      label: format(d, 'EEE'),
      steps: workouts[key]?.steps || 0,
    }
  })

  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const w = workouts[dateKey(d)]
    if (w?.sessions?.some((s) => s.completed)) streak += 1
    else break
  }

  const completedToday = todayWorkout.sessions.filter((s) => s.completed).length
  const totalSessionsToday = todayWorkout.sessions.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">{format(today, 'EEEE, MMMM d')}</p>
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Welcome back</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Flame}
          label="Calories today"
          value={`${caloriesToday.toLocaleString()}`}
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
        <Link to="/nutrition">
          <GlassCard className="flex items-center justify-between p-5 transition-colors hover:bg-white/[0.06]">
            <div>
              <p className="font-display text-sm font-semibold">Log today's meals</p>
              <p className="mt-1 text-xs text-muted">Track breakfast, lunch, dinner & snacks</p>
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
    </div>
  )
}
