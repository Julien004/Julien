import GlassCard from '../GlassCard'
import {
  CALORIE_GOAL,
  PROTEIN_GOAL,
  CARBS_GOAL,
  FAT_GOAL,
  FIBER_GOAL,
  SUGAR_GOAL,
  SODIUM_GOAL,
  WATER_GOAL_ML,
  WATER_CUP_ML,
} from '../../lib/goals'

function MacroBar({ label, value, goal, unit, capAtGoal }) {
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  const over = capAtGoal && value > goal
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className={over ? 'text-destructive' : 'text-muted'}>
          {Math.round(value * 10) / 10}
          {unit} <span className="text-muted-2">/ {goal}{unit}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function NutritionDashboard({ macros, waterMl, onAddWater }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Nutrition dashboard</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MacroBar label="Calories" value={macros.calories} goal={CALORIE_GOAL} unit=" kcal" />
        <MacroBar label="Protein" value={macros.protein} goal={PROTEIN_GOAL} unit="g" />
        <MacroBar label="Carbs" value={macros.carbs} goal={CARBS_GOAL} unit="g" />
        <MacroBar label="Fat" value={macros.fat} goal={FAT_GOAL} unit="g" />
        <MacroBar label="Fibre" value={macros.fiber} goal={FIBER_GOAL} unit="g" />
        <MacroBar label="Sugar" value={macros.sugar} goal={SUGAR_GOAL} unit="g" capAtGoal />
        <MacroBar label="Water" value={waterMl} goal={WATER_GOAL_ML} unit="ml" />
        <MacroBar label="Sodium" value={macros.sodium} goal={SODIUM_GOAL} unit="mg" capAtGoal />
      </div>

      <button
        type="button"
        onClick={() => onAddWater(WATER_CUP_ML)}
        className="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/5 text-sm font-medium text-foreground hover:bg-white/10"
      >
        + Add a cup ({WATER_CUP_ML}ml)
      </button>
    </GlassCard>
  )
}
