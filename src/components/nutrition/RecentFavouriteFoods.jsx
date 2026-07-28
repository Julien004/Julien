import { Plus, Star, Clock } from 'lucide-react'
import GlassCard from '../GlassCard'
import { scaleFoodMacros } from '../../lib/foodDatabase'
import { getCurrentMealSlot } from '../../lib/seedData'
import { useTracker } from '../../lib/store'

function FoodChip({ food, grams, onLog, onToggleFavorite, isFavorite }) {
  const macros = scaleFoodMacros(food.per100, grams)
  return (
    <div className="flex min-h-14 shrink-0 items-center gap-2 rounded-xl bg-white/5 py-2 pl-3.5 pr-2">
      <div className="min-w-0">
        <p className="max-w-[9.5rem] truncate text-sm font-medium text-foreground">{food.name}</p>
        <p className="text-xs text-muted-2">
          {macros.calories} kcal · {grams}g
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={isFavorite ? 'Unfavourite' : 'Favourite'}
        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-2 hover:bg-white/10"
      >
        <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
      </button>
      <button
        type="button"
        onClick={onLog}
        aria-label={`Log ${food.name}`}
        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-primary text-white hover:opacity-90"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default function RecentFavouriteFoods({ dateKey, onLogged }) {
  const { getAllFoods, recentFoodLog, favoriteFoodIds, toggleFavoriteFood, logFood } = useTracker()
  const allFoods = getAllFoods()

  const recent = recentFoodLog
    .map((r) => ({ ...r, food: allFoods.find((f) => f.id === r.foodId) }))
    .filter((r) => r.food)
    .slice(0, 10)

  const favourites = favoriteFoodIds
    .map((id) => allFoods.find((f) => f.id === id))
    .filter(Boolean)

  const handleLog = (food, grams) => {
    logFood(dateKey, getCurrentMealSlot(), food, grams)
    onLogged?.(food.name)
  }

  if (recent.length === 0 && favourites.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {recent.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" /> Recent foods
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {recent.map((r) => (
              <FoodChip
                key={r.foodId}
                food={r.food}
                grams={r.grams}
                isFavorite={favoriteFoodIds.includes(r.food.id)}
                onToggleFavorite={() => toggleFavoriteFood(r.food.id)}
                onLog={() => handleLog(r.food, r.grams)}
              />
            ))}
          </div>
        </GlassCard>
      )}

      {favourites.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" /> Favourite foods
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {favourites.map((food) => (
              <FoodChip
                key={food.id}
                food={food}
                grams={food.defaultGrams}
                isFavorite
                onToggleFavorite={() => toggleFavoriteFood(food.id)}
                onLog={() => handleLog(food, food.defaultGrams)}
              />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
