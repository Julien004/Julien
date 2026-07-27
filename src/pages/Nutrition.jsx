import { useMemo, useState } from 'react'
import { Trash2, ClipboardList, Check } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import MonthCalendar from '../components/MonthCalendar'
import Fab from '../components/Fab'
import BottomSheet from '../components/BottomSheet'
import { useTracker, caloriesForDay, dateKey } from '../lib/store'
import { MEAL_SLOTS, MEAL_SLOT_LABELS, MEAL_PLANS } from '../lib/seedData'
import { format } from '../lib/dateUtils'

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
              <span className="truncate pr-2">{item.name}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted">{item.calories} kcal</span>
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

function AddFoodSheet({ open, onClose, onAdd, selectedDateLabel }) {
  const [slot, setSlot] = useState('breakfast')
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(slot, { name: name.trim(), calories: Number(calories) || 0 })
    setName('')
    setCalories('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={`Add food · ${selectedDateLabel}`}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEAL_SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={`min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors ${
              slot === s ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            {MEAL_SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 pb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Food or drink"
          autoFocus
          className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />
        <input
          value={calories}
          onChange={(e) => setCalories(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Calories (kcal)"
          inputMode="numeric"
          className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />
        <button
          type="submit"
          className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-medium text-white transition-colors ${
            justAdded ? 'bg-accent' : 'bg-primary hover:opacity-90'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            `Add to ${MEAL_SLOT_LABELS[slot]}`
          )}
        </button>
      </form>
    </BottomSheet>
  )
}

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { meals, addFoodItem, removeFoodItem, applyMealPlan } = useTracker()
  const [planId, setPlanId] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const key = dateKey(selectedDate)
  const dayMeals = meals[key] ?? { breakfast: [], lunch: [], dinner: [], snacks: [] }
  const totalCalories = caloriesForDay(dayMeals)

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
        <p className="mt-1 text-sm text-muted">Log meals day by day and track your calories</p>
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
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted">{format(selectedDate, 'EEEE, MMMM d')}</p>
              <p className="mt-1 font-display text-xl font-semibold">{totalCalories.toLocaleString()} kcal logged</p>
            </div>
          </GlassCard>

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
        </div>
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Add food" />
      <AddFoodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={(slot, item) => addFoodItem(key, slot, item)}
        selectedDateLabel={format(selectedDate, 'MMM d')}
      />
    </div>
  )
}
