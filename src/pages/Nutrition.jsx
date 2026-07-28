import { useMemo, useState } from 'react'
import { Trash2, ClipboardList, PlusCircle, Scale, Check } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import MonthCalendar from '../components/MonthCalendar'
import Fab from '../components/Fab'
import Celebration from '../components/Celebration'
import FoodSearchSheet from '../components/nutrition/FoodSearchSheet'
import CustomFoodSheet from '../components/nutrition/CustomFoodSheet'
import RecentFavouriteFoods from '../components/nutrition/RecentFavouriteFoods'
import RecipesSection from '../components/nutrition/RecipesSection'
import NutritionDashboard from '../components/nutrition/NutritionDashboard'
import NutritionAnalytics from '../components/nutrition/NutritionAnalytics'
import { useTracker, caloriesForDay, macrosForDay, dateKey } from '../lib/store'
import { MEAL_SLOTS, MEAL_SLOT_LABELS, MEAL_PLANS, getCurrentMealSlot } from '../lib/seedData'
import { format } from '../lib/dateUtils'
import { useCelebration } from '../lib/useCelebration'

function MealSlotCard({ slot, items, onRemove }) {
  const total = items.reduce((s, it) => s + (it.calories || 0), 0)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">{MEAL_SLOT_LABELS[slot]}</h3>
        <span className="text-xs text-muted">{total} kcal</span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-sm"
            >
              <span className="truncate pr-2">
                {item.name}
                {item.grams ? <span className="text-muted-2"> · {item.grams}g</span> : null}
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted">
                  {item.calories} kcal{item.protein ? ` · ${item.protein}g protein` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="grid h-8 w-8 cursor-pointer place-items-center text-muted-2 transition-colors hover:text-destructive"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-2">Nothing logged yet</p>
      )}
    </GlassCard>
  )
}

function WeightLogCard({ dateKey: key, dateLabel }) {
  const { getWeightForDate, addWeightEntry } = useTracker()
  const saved = getWeightForDate(key)
  const [value, setValue] = useState(saved != null ? String(saved) : '')
  const [justSaved, setJustSaved] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const kg = Number(value)
    if (!kg || kg <= 0) return
    addWeightEntry(key, kg)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1200)
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Scale className="h-4 w-4 text-primary" /> Weight · {dateLabel}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ''))}
          inputMode="decimal"
          placeholder="kg"
          className="min-h-11 flex-1 rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />
        <button
          type="submit"
          className={`flex min-h-11 min-w-24 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-white transition-colors ${
            justSaved ? 'bg-accent' : 'bg-primary hover:opacity-90'
          }`}
        >
          {justSaved ? (
            <>
              <Check className="h-3.5 w-3.5" /> Saved
            </>
          ) : (
            'Log weight'
          )}
        </button>
      </form>
    </GlassCard>
  )
}

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { meals, removeFoodItem, applyMealPlan, getWaterForDate, addWater } = useTracker()
  const [planId, setPlanId] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [customFoodOpen, setCustomFoodOpen] = useState(false)
  const { message, celebrate } = useCelebration()

  const key = dateKey(selectedDate)
  const dayMeals = meals[key] ?? { breakfast: [], lunch: [], dinner: [], snacks: [] }
  const totalCalories = caloriesForDay(dayMeals)
  const dayMacros = macrosForDay(dayMeals)
  const waterMl = getWaterForDate(key)

  const markedDates = useMemo(() => {
    const set = new Set()
    for (const [k, day] of Object.entries(meals)) {
      if (Object.values(day).some((items) => items.length > 0)) set.add(k)
    }
    return set
  }, [meals])

  const handleApplyPlan = () => {
    const plan = MEAL_PLANS.find((p) => p.id === planId)
    if (!plan) return
    const hasExisting = Object.values(dayMeals).some((items) => items.length > 0)
    if (hasExisting && !window.confirm(`Replace existing meals on ${format(selectedDate, 'MMM d')} with "${plan.name}"?`)) {
      return
    }
    applyMealPlan(key, plan)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Nutrition</h1>
        <p className="mt-1 text-sm text-muted">Search foods, track macros, and build recipes</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <MonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-primary" />
              Apply a meal plan
            </div>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="mt-3 min-h-12 w-full cursor-pointer rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            >
              <option value="" className="bg-surface">Choose a plan…</option>
              {MEAL_PLANS.map((p) => (
                <option key={p.id} value={p.id} className="bg-surface">
                  {p.name} — {caloriesForDay(p.meals)} kcal
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleApplyPlan}
              disabled={!planId}
              className="mt-3 min-h-12 w-full cursor-pointer rounded-lg bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply to {format(selectedDate, 'MMM d')}
            </button>
          </GlassCard>

          <button
            type="button"
            onClick={() => setCustomFoodOpen(true)}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-white/5 text-sm font-medium text-foreground hover:bg-white/10"
          >
            <PlusCircle className="h-4 w-4 text-primary" /> Create custom food
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted">{format(selectedDate, 'EEEE, MMMM d')}</p>
              <p className="mt-1 font-display text-xl font-semibold">{totalCalories.toLocaleString()} kcal logged</p>
              <p className="mt-0.5 text-xs text-muted">{dayMacros.protein}g protein</p>
            </div>
          </GlassCard>

          <NutritionDashboard macros={dayMacros} waterMl={waterMl} onAddWater={(ml) => addWater(key, ml)} />

          <WeightLogCard key={key} dateKey={key} dateLabel={format(selectedDate, 'MMM d')} />

          <RecentFavouriteFoods dateKey={key} onLogged={(name) => celebrate(`${name} logged — nice work.`)} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MEAL_SLOTS.map((slot) => (
              <MealSlotCard
                key={slot}
                slot={slot}
                items={dayMeals[slot]}
                onRemove={(itemId) => removeFoodItem(key, slot, itemId)}
              />
            ))}
          </div>

          <RecipesSection dateKey={key} onLogged={(name) => celebrate(`${name} logged — nice work.`)} />
        </div>
      </div>

      <NutritionAnalytics dateKey={key} />

      <Fab onClick={() => setSearchOpen(true)} label="Add food" />
      <FoodSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        dateKey={key}
        defaultSlot={getCurrentMealSlot()}
        onAdded={(name) => celebrate(`${name} logged — nice work.`)}
      />
      <CustomFoodSheet open={customFoodOpen} onClose={() => setCustomFoodOpen(false)} />
      <Celebration message={message} />
    </div>
  )
}
