import { useEffect, useMemo, useState } from 'react'
import { Search, ChevronLeft, Star, Check } from 'lucide-react'
import BottomSheet from '../BottomSheet'
import { searchFoods, scaleFoodMacros } from '../../lib/foodDatabase'
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from '../../lib/seedData'
import { useTracker } from '../../lib/store'

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
]

export default function FoodSearchSheet({ open, onClose, dateKey, defaultSlot = 'breakfast', onAdded }) {
  const { customFoods, favoriteFoodIds, toggleFavoriteFood, logFood } = useTracker()
  const [query, setQuery] = useState('')
  const [slot, setSlot] = useState(defaultSlot)
  const [selected, setSelected] = useState(null)
  const [grams, setGrams] = useState(100)
  const [justAdded, setJustAdded] = useState(false)

  const results = useMemo(() => searchFoods(query, customFoods), [query, customFoods])

  useEffect(() => {
    if (open) setSlot(defaultSlot)
  }, [open, defaultSlot])

  const handleClose = () => {
    setQuery('')
    setSelected(null)
    setJustAdded(false)
    onClose()
  }

  const selectFood = (food) => {
    setSelected(food)
    setGrams(food.defaultGrams)
  }

  const macros = selected ? scaleFoodMacros(selected.per100, grams) : null
  const isFavorite = selected ? favoriteFoodIds.includes(selected.id) : false

  const handleAdd = () => {
    if (!selected || grams <= 0) return
    logFood(dateKey, slot, selected, grams)
    onAdded?.(selected.name)
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
      setSelected(null)
    }, 700)
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={selected ? selected.name : 'Add food'}>
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

      {!selected ? (
        <div className="mt-4 flex flex-col gap-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods, e.g. Chicken Breast"
              autoFocus
              className="min-h-12 w-full rounded-xl border border-border bg-white/5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
            />
          </div>

          <ul className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto">
            {results.map((food) => {
              const preview = scaleFoodMacros(food.per100, food.defaultGrams)
              const fav = favoriteFoodIds.includes(food.id)
              return (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => selectFood(food)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{food.name}</p>
                      <p className="text-xs text-muted-2">
                        {food.group} · {preview.calories} kcal / {food.defaultGrams}g
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteFood(food.id)
                      }}
                      aria-label={fav ? 'Unfavourite' : 'Favourite'}
                      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-2 hover:bg-white/10"
                    >
                      <Star className={`h-4 w-4 ${fav ? 'fill-accent text-accent' : ''}`} />
                    </span>
                  </button>
                </li>
              )
            })}
            {results.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-2">No foods match "{query}"</p>
            )}
          </ul>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 pb-2">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary"
          >
            <ChevronLeft className="h-4 w-4" /> Back to search
          </button>

          <div>
            <span className="mb-1.5 block text-xs text-muted">Serving size (g)</span>
            <input
              type="number"
              min="1"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              className="min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground focus:border-primary/60 focus:outline-none"
            />
            {selected.commonServings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.commonServings.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setGrams(s.grams)}
                    className={`min-h-9 cursor-pointer rounded-full px-3 text-xs font-medium transition-colors ${
                      grams === s.grams ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGrams(100)}
                  className={`min-h-9 cursor-pointer rounded-full px-3 text-xs font-medium transition-colors ${
                    grams === 100 ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  100g
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MACRO_FIELDS.map((f) => (
              <div key={f.key} className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-muted-2">{f.label}</p>
                <p className="mt-0.5 font-display text-base font-semibold text-foreground">
                  {macros[f.key]}
                  <span className="ml-0.5 text-xs font-normal text-muted">{f.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toggleFavoriteFood(selected.id)}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-white/5 text-sm font-medium text-foreground hover:bg-white/10"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
            {isFavorite ? 'Favourited' : 'Add to favourites'}
          </button>

          <button
            type="button"
            onClick={handleAdd}
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
        </div>
      )}
    </BottomSheet>
  )
}
