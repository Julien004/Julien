import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { startOfWeek, addDays } from 'date-fns'
import { BarChart3 } from 'lucide-react'
import GlassCard from '../GlassCard'
import { getIcon } from '../../lib/icons'
import { ACTIVITY_TYPES } from '../../lib/activityTypes'
import { dateKey } from '../../lib/store'

export default function WeeklyDistribution({ workouts, now }) {
  const breakdown = useMemo(() => {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const minutesByType = {}
    for (let i = 0; i < 7; i++) {
      const key = dateKey(addDays(weekStart, i))
      const sessions = workouts[key]?.sessions || []
      for (const session of sessions) {
        if (!session.completed) continue
        minutesByType[session.activityType] = (minutesByType[session.activityType] || 0) + (session.durationMinutes || 0)
      }
    }
    return ACTIVITY_TYPES.map((t) => ({ ...t, minutes: minutesByType[t.id] || 0 }))
      .filter((t) => t.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
  }, [workouts, now])

  const totalMinutes = breakdown.reduce((s, b) => s + b.minutes, 0)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-primary" /> Weekly activity distribution
        </div>
        <span className="text-xs text-muted">{totalMinutes} min this week</span>
      </div>

      {breakdown.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 py-6">
          <p className="text-center text-xs text-muted-2">Complete an activity to see your weekly split</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="minutes" nameKey="label" innerRadius={45} outerRadius={65} paddingAngle={3}>
                  {breakdown.map((b) => (
                    <Cell key={b.id} fill={b.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#131829',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#f8fafc',
                  }}
                  formatter={(value, name) => [`${value} min`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex w-full flex-col gap-1.5">
            {breakdown.map((b) => {
              const Icon = getIcon(b.icon)
              const pct = totalMinutes > 0 ? Math.round((b.minutes / totalMinutes) * 100) : 0
              return (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Icon className="h-3.5 w-3.5" style={{ color: b.color }} />
                    {b.label}
                  </span>
                  <span className="font-medium text-foreground">
                    {b.minutes} min <span className="text-muted-2">· {pct}%</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
