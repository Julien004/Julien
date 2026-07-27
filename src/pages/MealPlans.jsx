import { useState } from 'react'
import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useTracker, caloriesForDay, dateKey } from '../lib/store'
import { MEAL_PLANS, MEAL_SLOT_LABELS } from '../lib/seedData'
import { format, parseDateKey } from '../lib/dateUtils'

function MacroPill({ icon: Icon, label, value, unit = 'g' }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-muted">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}: <span className="font-medium text-foreground">{value}{unit}</span>
    </div>
  )
}

export default function MealPlans() {
  const { applyMealPlan, meals } = useTracker()
  const [targetDate, setTargetDate] = useState(dateKey(new Date()))
  const [confirmedPlanId, setConfirmedPlanId] = useState(null)

  const handleApply = (plan) => {
    const key = targetDate
    const dayMeals = meals[key]
    const hasExisting = dayMeals && Object.values(dayMeals).some((items) => items.length > 0)
    if (hasExisting && !window.confirm(`Replace existing meals on ${key} with "${plan.name}"?`)) {
      return
    }
    applyMealPlan(key, plan)
    setConfirmedPlanId(plan.id)
    setTimeout(() => setConfirmedPlanId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Meal plans</h1>
          <p className="mt-1 text-sm text-muted">Pick a preset plan and apply it to any day</p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs text-muted">Apply to date</span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="min-h-12 cursor-pointer rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {MEAL_PLANS.map((plan) => (
          <GlassCard key={plan.id} className="flex flex-col p-6">
            <div>
              <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-secondary" />
              <span className="font-medium text-foreground">{caloriesForDay(plan.meals).toLocaleString()} kcal</span>
              <span className="text-muted">/ day</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <MacroPill icon={Beef} label="Protein" value={plan.macros.protein} />
              <MacroPill icon={Wheat} label="Carbs" value={plan.macros.carbs} />
              <MacroPill icon={Droplet} label="Fat" value={plan.macros.fat} />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
              {Object.entries(plan.meals).map(([slot, items]) => (
                <div key={slot}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                    {MEAL_SLOT_LABELS[slot]}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {items.map((it) => it.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleApply(plan)}
              className={`mt-6 min-h-12 cursor-pointer rounded-lg text-sm font-medium transition-all
                ${confirmedPlanId === plan.id
                  ? 'bg-accent/20 text-accent'
                  : 'bg-primary text-white hover:opacity-90'}`}
            >
              {confirmedPlanId === plan.id ? 'Applied ✓' : `Apply to ${format(parseDateKey(targetDate), 'MMM d')}`}
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
