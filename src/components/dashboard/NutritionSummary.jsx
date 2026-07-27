import { Flame, Beef, Droplet, Moon } from 'lucide-react'
import { CALORIE_GOAL, PROTEIN_GOAL, WATER_GOAL_ML, WATER_CUP_ML, SLEEP_GOAL_HOURS } from '../../lib/goals'

function StatBlock({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {sub && <p className="text-[11px] text-muted-2">{sub}</p>}
      </div>
    </div>
  )
}

export default function NutritionSummary({ caloriesToday, proteinToday, waterMl, sleepHours, onAddWater, onSetSleep }) {
  const caloriesRemaining = Math.max(0, CALORIE_GOAL - caloriesToday)
  const proteinRemaining = Math.max(0, PROTEIN_GOAL - proteinToday)
  const waterPercent = Math.min(100, Math.round((waterMl / WATER_GOAL_ML) * 100))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatBlock
          icon={Flame}
          label="Calories remaining"
          value={caloriesRemaining.toLocaleString()}
          sub={`of ${CALORIE_GOAL.toLocaleString()} kcal goal`}
          accent="bg-secondary/15 text-secondary"
        />
        <StatBlock
          icon={Beef}
          label="Protein remaining"
          value={`${proteinRemaining}g`}
          sub={`of ${PROTEIN_GOAL}g goal`}
          accent="bg-primary/15 text-primary"
        />
      </div>

      <div className="rounded-xl bg-white/5 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Droplet className="h-4 w-4 text-primary" /> Water
          </div>
          <span className="text-xs text-muted">
            {waterMl.toLocaleString()} / {WATER_GOAL_ML.toLocaleString()} ml
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${waterPercent}%` }} />
        </div>
        <button
          type="button"
          onClick={() => onAddWater(WATER_CUP_ML)}
          className="mt-3 min-h-9 w-full cursor-pointer rounded-lg bg-white/10 text-xs font-medium text-foreground transition-colors hover:bg-white/15"
        >
          + Add a cup ({WATER_CUP_ML}ml)
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/5 p-3.5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Moon className="h-4 w-4 text-muted" /> Sleep last night
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="16"
            step="0.5"
            value={sleepHours ?? ''}
            onChange={(e) => onSetSleep(e.target.value === '' ? null : Number(e.target.value))}
            placeholder="hrs"
            className="min-h-9 w-16 rounded-lg border border-border bg-white/5 px-2 text-center text-sm text-foreground focus:border-primary/60 focus:outline-none"
          />
          <span className="text-xs text-muted-2">/ {SLEEP_GOAL_HOURS}h goal</span>
        </div>
      </div>
    </div>
  )
}
