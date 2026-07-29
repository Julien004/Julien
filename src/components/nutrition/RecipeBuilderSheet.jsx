import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import BottomSheet from '../BottomSheet'
import { searchFoods, scaleFoodMacros } from '../../lib/foodDatabase'
import { useTracker } from '../../lib/store'

export default function RecipeBuilderSheet({ open, onClose }) {
  const { customFoods, getAllFoods, addRecipe } = useTracker()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const nameRef = useRef(null)

  useEffect(() => {
    if (open) nameRef.current?.focus({ preventScroll: true })
  }, [open])

  const results = useMemo(
    () => (query.trim() ? searchFoods(query, customFoods).slice(0, 6) : []),
    [query, customFoods]
  )
  const allFoods = getAllFoods()

  const handleClose = () => {
    setName('')
    setQuery('')
    setItems([])
    onClose()
  }

  const addIngredient = (food) => {
    setItems((prev) =>
      prev.some((it) => it.foodId === food.id)
        ? prev
        : [...prev, { foodId: food.id, name: food.name, grams: food.defaultGrams }]
    )
    setQuery('')
  }

  const updateGrams = (foodId, grams) => {
    setItems((prev) => prev.map((it) => (it.foodId === foodId ? { ...it, grams } : it)))
  }

  const removeIngredient = (foodId) => {
    setItems((prev) => prev.filter((it) => it.foodId !== foodId))
  }

  const totals = useMemo(() => {
    const sums = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    for (const it of items) {
      const food = allFoods.find((f) => f.id === it.foodId)
      if (!food) continue
      const scaled = scaleFoodMacros(food.per100, it.grams)
      for (const k of Object.keys(sums)) sums[k] += scaled[k]
    }
    return sums
  }, [items, allFoods])

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || items.length === 0) return
    addRecipe({ name: name.trim(), items: items.map(({ foodId, grams }) => ({ foodId, grams })) })
    handleClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Build a recipe">
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipe name, e.g. Chicken Bowl"
          className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />

        <div>
          <span className="mb-1.5 block text-xs text-muted">Add ingredients</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods to add"
              className="min-h-12 w-full rounded-xl border border-border bg-white/5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
            />
          </div>
          {results.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 rounded-xl border border-border bg-white/5 p-1.5">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => addIngredient(food)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-white/10"
                  >
                    {food.name}
                    <Plus className="h-4 w-4 text-primary" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map((it) => (
              <li key={it.foodId} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{it.name}</span>
                <input
                  type="number"
                  min="1"
                  value={it.grams}
                  onChange={(e) => updateGrams(it.foodId, Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                  className="min-h-9 w-16 rounded-lg border border-border bg-white/5 px-2 text-center text-sm text-foreground focus:border-primary/60 focus:outline-none"
                />
                <span className="text-xs text-muted-2">g</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(it.foodId)}
                  aria-label={`Remove ${it.name}`}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center text-muted-2 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {[
              ['Calories', totals.calories, ''],
              ['Protein', totals.protein.toFixed(1), 'g'],
              ['Carbs', totals.carbs.toFixed(1), 'g'],
              ['Fat', totals.fat.toFixed(1), 'g'],
              ['Fibre', totals.fiber.toFixed(1), 'g'],
              ['Sugar', totals.sugar.toFixed(1), 'g'],
              ['Sodium', Math.round(totals.sodium), 'mg'],
            ].map(([label, value, unit]) => (
              <div key={label} className="rounded-xl bg-white/5 p-2.5 text-center">
                <p className="text-[10px] text-muted-2">{label}</p>
                <p className="font-display text-sm font-semibold text-foreground">
                  {value}
                  <span className="text-[10px] font-normal text-muted"> {unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim() || items.length === 0}
          className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save recipe
        </button>
      </form>
    </BottomSheet>
  )
}
