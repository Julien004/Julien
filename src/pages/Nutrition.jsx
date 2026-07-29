import { useState } from 'react'
import { addDays, subDays } from 'date-fns'
import { Trash2, ClipboardList, PlusCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import GlassCard from '../components/GlassCard'
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
import { format, isSameDay } from '../lib/dateUtils'
import { useCelebration } from '../lib/useCelebration'

function MealSlotCard({ slot, items, onRemove, onAdd }) {
  const total = items.reduce((s, it) => s + (it.calories || 0), 0)
  const label = MEAL_SLOT_LABELS[slot]

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">{label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{total} kcal</span>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add to ${label}`}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
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
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-2 transition-colors hover:bg-white/5 hover:text-muted"
        >
          Tap to add {label.toLowerCase()}
        </button>
      )}
    </GlassCard>
  )
}

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { meals, removeFoodItem, applyMealPlan, getWaterForDate, addWater } = useTracker()
  const [planId, setPlanId] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchSlot, setSearchSlot] = useState(getCurrentMealSlot())
  const [customFoodOpen, setCustomFoodOpen] = useState(false)
  const { message, celebrate } = useCelebration()

  const key = dateKey(selectedDate)
  const dayMeals = meals[key] ?? { breakfast: [], lunch: [], dinner: [], snacks: [] }
  const totalCalories = caloriesForDay(dayMeals)
  const dayMacros = macrosForDay(dayMeals)
  const waterMl = getWaterForDate(key)
  const isToday = isSameDay(selectedDate, new Date())

  const handleApplyPlan = () => {
    const plan = MEAL_PLANS.find((p) => p.id === planId)
    if (!plan) return
    const hasExisting = Object.values(dayMeals).some((items) => items.length > 0)
    if (hasExisting && !window.confirm(`Replace existing meals on ${format(selectedDate, 'MMM d')} with "${plan.name}"?`)) {
      return
    }
    applyMealPlan(key, plan)
  }

  const openSlotSearch = (slot) => {
    setSearchSlot(slot)
    setSearchOpen(true)
  }

  const openFabSearch = () => {
    setSearchSlot(getCurrentMealSlot())
    setSearchOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Nutrition</h1>
        <p className="mt-1 text-sm text-muted">Search foods, track macros, and build recipes</p>
      </div>

      <NutritionAnalytics dateKey={key} />

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            aria-label="Previous day"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-foreground sm:text-lg">
              {format(selectedDate, 'EEEE, MMM d')}
            </p>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                Back to today
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            aria-label="Next day"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          {totalCalories.toLocaleString()} kcal logged · {dayMacros.protein}g protein
        </p>
      </GlassCard>

      <NutritionDashboard macros={dayMacros} waterMl={waterMl} onAddWater={(ml) => addWater(key, ml)} />

      <RecentFavouriteFoods dateKey={key} onLogged={(name) => celebrate(`${name} logged — nice work.`)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MEAL_SLOTS.map((slot) => (
          <MealSlotCard
            key={slot}
            slot={slot}
            items={dayMeals[slot]}
            onRemove={(itemId) => removeFoodItem(key, slot, itemId)}
            onAdd={() => openSlotSearch(slot)}
          />
        ))}
      </div>

      <RecipesSection dateKey={key} onLogged={(name) => celebrate(`${name} logged — nice work.`)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <Fab onClick={openFabSearch} label="Add food" />
      <FoodSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        dateKey={key}
        defaultSlot={searchSlot}
        onAdded={(name) => celebrate(`${name} logged — nice work.`)}
      />
      <CustomFoodSheet open={customFoodOpen} onClose={() => setCustomFoodOpen(false)} />
      <Celebration message={message} />
    </div>
  )
}
