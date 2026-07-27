import { useMemo, useState } from 'react'
import { ComposedChart, Area, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
} from 'date-fns'
import GlassCard from './GlassCard'
import { useTracker, dateKey } from '../lib/store'
import { STEPS_GOAL } from '../lib/goals'
import { format } from '../lib/dateUtils'

const GRANULARITIES = ['Days', 'Weeks', 'Months']

function buildWeekData(workouts, weekOffset) {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i)
    return {
      key: dateKey(d),
      label: format(d, 'd'),
      sublabel: format(d, 'EEE'),
      fullLabel: format(d, 'MMM d'),
      steps: workouts[dateKey(d)]?.steps || 0,
      goal: STEPS_GOAL,
    }
  })
}

function buildWeeksData(workouts, now) {
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
    const total = days.reduce((sum, d) => sum + (workouts[dateKey(d)]?.steps || 0), 0)
    return {
      key: dateKey(weekStart),
      label: format(weekStart, 'd'),
      sublabel: format(weekStart, 'MMM'),
      fullLabel: `Week of ${format(weekStart, 'MMM d')}`,
      steps: Math.round(total / 7),
      goal: STEPS_GOAL,
    }
  })
}

function buildMonthsData(workouts, now) {
  return Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(now, 5 - i))
    const monthEnd = endOfMonth(monthStart)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const total = days.reduce((sum, d) => sum + (workouts[dateKey(d)]?.steps || 0), 0)
    return {
      key: dateKey(monthStart),
      label: format(monthStart, 'MMM'),
      sublabel: format(monthStart, 'yyyy'),
      fullLabel: format(monthStart, 'MMMM yyyy'),
      steps: Math.round(total / days.length),
      goal: STEPS_GOAL,
    }
  })
}

export default function StatisticsPanel() {
  const { workouts } = useTracker()
  const [granularity, setGranularity] = useState('Days')
  const [weekOffset, setWeekOffset] = useState(0)
  const [focusedKey, setFocusedKey] = useState(null)
  const now = useMemo(() => new Date(), [])

  const data = useMemo(() => {
    if (granularity === 'Weeks') return buildWeeksData(workouts, now)
    if (granularity === 'Months') return buildMonthsData(workouts, now)
    return buildWeekData(workouts, weekOffset)
  }, [granularity, workouts, now, weekOffset])

  const todayKey = dateKey(now)
  const focused =
    data.find((d) => d.key === focusedKey) ?? data.find((d) => d.key === todayKey) ?? data[data.length - 1]

  const weekRangeLabel =
    granularity === 'Days' ? `${data[0].fullLabel} – ${data[data.length - 1].fullLabel}` : null

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Statistics</h2>
          <p className="text-xs text-muted">Steps vs. goal</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGranularity(g)
                setFocusedKey(null)
              }}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                granularity === g ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {granularity === 'Days' && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setWeekOffset((w) => w - 1)
              setFocusedKey(null)
            }}
            aria-label="Previous week"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-medium text-foreground">
            {weekOffset === 0 ? 'This week' : weekRangeLabel}
          </p>
          <button
            type="button"
            onClick={() => {
              setWeekOffset((w) => Math.min(0, w + 1))
              setFocusedKey(null)
            }}
            disabled={weekOffset >= 0}
            aria-label="Next week"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {data.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setFocusedKey(d.key)}
            className={`flex min-h-11 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl px-3.5 py-2 text-xs transition-colors duration-150 ${
              focused.key === d.key ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            <span className="font-display text-sm font-semibold">{d.label}</span>
            <span className="mt-0.5">{d.sublabel}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="statsStepsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="key" hide />
            <Tooltip
              contentStyle={{
                background: '#131829',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#f8fafc',
              }}
              labelStyle={{ color: '#94a3b8' }}
              labelFormatter={(key) => data.find((d) => d.key === key)?.fullLabel ?? ''}
              formatter={(value, name) => [value.toLocaleString(), name === 'goal' ? 'Goal' : 'Steps']}
            />
            <Area type="monotone" dataKey="steps" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#statsStepsGradient)" />
            <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-foreground">{focused.fullLabel}:</span> {focused.steps.toLocaleString()}{' '}
        steps
        {focused.steps >= focused.goal
          ? ' — goal reached'
          : ` — ${(focused.goal - focused.steps).toLocaleString()} to go`}
      </p>
    </GlassCard>
  )
}
