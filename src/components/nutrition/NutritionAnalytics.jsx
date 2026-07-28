import { useMemo, useState } from 'react'
import { ComposedChart, Area, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
import GlassCard from '../GlassCard'
import { useTracker, dateKey, macrosForDay } from '../../lib/store'
import { CALORIE_GOAL, PROTEIN_GOAL, CARBS_GOAL, FAT_GOAL, WATER_GOAL_ML } from '../../lib/goals'
import { format } from '../../lib/dateUtils'

const METRICS = {
  calories: { label: 'Calories', unit: 'kcal', goal: CALORIE_GOAL, color: '#8b5cf6' },
  protein: { label: 'Protein', unit: 'g', goal: PROTEIN_GOAL, color: '#22c55e' },
  carbs: { label: 'Carbs', unit: 'g', goal: CARBS_GOAL, color: '#f59e0b' },
  fat: { label: 'Fat', unit: 'g', goal: FAT_GOAL, color: '#ec4899' },
  water: { label: 'Water', unit: 'ml', goal: WATER_GOAL_ML, color: '#06b6d4' },
  weight: { label: 'Weight', unit: 'kg', goal: null, color: '#3b82f6' },
}
const GRANULARITIES = ['Days', 'Weeks', 'Months']

function getMetricValue(metric, key, meals, water, weight) {
  if (metric === 'water') return water[key] || 0
  if (metric === 'weight') return weight[key] ?? null
  return macrosForDay(meals[key] ?? {})[metric] || 0
}

function buildDayData(metric, meals, water, weight, weekOffset) {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i)
    const key = dateKey(d)
    return {
      key,
      label: format(d, 'd'),
      sublabel: format(d, 'EEE'),
      fullLabel: format(d, 'MMM d'),
      value: getMetricValue(metric, key, meals, water, weight),
      goal: METRICS[metric].goal,
    }
  })
}

function buildWeeksData(metric, meals, water, weight, now) {
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
    const values = days.map((d) => getMetricValue(metric, dateKey(d), meals, water, weight))
    const present = metric === 'weight' ? values.filter((v) => v != null) : values
    const avg = present.length ? present.reduce((s, v) => s + v, 0) / present.length : null
    return {
      key: dateKey(weekStart),
      label: format(weekStart, 'd'),
      sublabel: format(weekStart, 'MMM'),
      fullLabel: `Week of ${format(weekStart, 'MMM d')}`,
      value: avg != null ? Math.round(avg * 10) / 10 : null,
      goal: METRICS[metric].goal,
    }
  })
}

function buildMonthsData(metric, meals, water, weight, now) {
  return Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(now, 5 - i))
    const monthEnd = endOfMonth(monthStart)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const values = days.map((d) => getMetricValue(metric, dateKey(d), meals, water, weight))
    const present = metric === 'weight' ? values.filter((v) => v != null) : values
    const avg = present.length ? present.reduce((s, v) => s + v, 0) / present.length : null
    return {
      key: dateKey(monthStart),
      label: format(monthStart, 'MMM'),
      sublabel: format(monthStart, 'yyyy'),
      fullLabel: format(monthStart, 'MMMM yyyy'),
      value: avg != null ? Math.round(avg * 10) / 10 : null,
      goal: METRICS[metric].goal,
    }
  })
}

const MACRO_COLORS = { protein: '#22c55e', carbs: '#f59e0b', fat: '#ec4899' }

export default function NutritionAnalytics({ dateKey: focusedDateKey }) {
  const { meals, water, weight } = useTracker()
  const [metric, setMetric] = useState('calories')
  const [granularity, setGranularity] = useState('Days')
  const [weekOffset, setWeekOffset] = useState(0)
  const [focusedKey, setFocusedKey] = useState(null)
  const now = useMemo(() => new Date(), [])

  const data = useMemo(() => {
    if (granularity === 'Weeks') return buildWeeksData(metric, meals, water, weight, now)
    if (granularity === 'Months') return buildMonthsData(metric, meals, water, weight, now)
    return buildDayData(metric, meals, water, weight, weekOffset)
  }, [metric, granularity, meals, water, weight, now, weekOffset])

  const todayKey = dateKey(now)
  const focused =
    data.find((d) => d.key === focusedKey) ?? data.find((d) => d.key === todayKey) ?? data[data.length - 1]
  const unit = METRICS[metric].unit
  const hasGoal = METRICS[metric].goal != null

  const breakdown = useMemo(() => {
    const m = macrosForDay(meals[focusedDateKey] ?? {})
    const cals = { protein: m.protein * 4, carbs: m.carbs * 4, fat: m.fat * 9 }
    const total = cals.protein + cals.carbs + cals.fat
    if (total === 0) return []
    return [
      { name: 'Protein', value: Math.round(cals.protein), color: MACRO_COLORS.protein },
      { name: 'Carbs', value: Math.round(cals.carbs), color: MACRO_COLORS.carbs },
      { name: 'Fat', value: Math.round(cals.fat), color: MACRO_COLORS.fat },
    ]
  }, [meals, focusedDateKey])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Analytics</h2>
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

        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(METRICS).map(([key, m]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMetric(key)
                setFocusedKey(null)
              }}
              className={`min-h-9 cursor-pointer rounded-full px-3.5 text-xs font-medium transition-colors ${
                metric === key ? 'text-white' : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
              style={metric === key ? { backgroundColor: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
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
              {weekOffset === 0 ? 'This week' : `${data[0].fullLabel} – ${data[data.length - 1].fullLabel}`}
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
                <linearGradient id="nutritionMetricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={METRICS[metric].color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={METRICS[metric].color} stopOpacity={0} />
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
                formatter={(value, name) => [
                  value == null ? 'No data' : `${value.toLocaleString()} ${unit}`,
                  name === 'goal' ? 'Goal' : METRICS[metric].label,
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={METRICS[metric].color}
                strokeWidth={2.5}
                fill="url(#nutritionMetricGradient)"
                connectNulls
              />
              {hasGoal && (
                <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-sm text-muted">
          <span className="font-medium text-foreground">{focused.fullLabel}:</span>{' '}
          {focused.value == null ? 'No data logged' : `${focused.value.toLocaleString()} ${unit}`}
          {hasGoal && focused.value != null && (
            focused.value >= focused.goal
              ? ' — goal reached'
              : ` — ${Math.round((focused.goal - focused.value) * 10) / 10} to go`
          )}
        </p>
      </GlassCard>

      <GlassCard className="flex flex-col p-5 sm:p-6">
        <h3 className="font-display text-sm font-semibold text-foreground">Macro breakdown</h3>
        <p className="text-xs text-muted-2">Share of calories today</p>
        {breakdown.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-center text-xs text-muted-2">Log food to see your macro split</p>
          </div>
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={65} paddingAngle={3}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#131829',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#f8fafc',
                    }}
                    formatter={(value, name) => [`${value} kcal`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {breakdown.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </span>
                  <span className="font-medium text-foreground">{b.value} kcal</span>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
