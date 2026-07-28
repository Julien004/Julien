import { useState } from 'react'
import { ChefHat, Plus, Trash2 } from 'lucide-react'
import GlassCard from '../GlassCard'
import RecipeBuilderSheet from './RecipeBuilderSheet'
import { getIcon } from '../../lib/icons'
import { getCurrentMealSlot } from '../../lib/seedData'
import { useTracker } from '../../lib/store'

export default function RecipesSection({ dateKey, onLogged }) {
  const { recipes, computeRecipeMacros, logRecipe, removeRecipe } = useTracker()
  const [builderOpen, setBuilderOpen] = useState(false)

  const handleLog = (recipe) => {
    logRecipe(dateKey, getCurrentMealSlot(), recipe)
    onLogged?.(recipe.name)
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ChefHat className="h-4 w-4 text-primary" /> Custom recipes
        </div>
        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="flex min-h-9 cursor-pointer items-center gap-1 rounded-lg bg-white/5 px-3 text-xs font-medium text-foreground hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" /> New recipe
        </button>
      </div>

      {recipes.length === 0 ? (
        <p className="mt-3 text-xs text-muted-2">
          Build a reusable recipe from foods you already log, like "Chicken Bowl" — 200g chicken, 150g rice, 100g
          broccoli — then log it in one tap.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {recipes.map((recipe) => {
            const macros = computeRecipeMacros(recipe)
            const Icon = getIcon(recipe.icon)
            return (
              <li
                key={recipe.id}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${recipe.color}22`, color: recipe.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{recipe.name}</p>
                  <p className="text-xs text-muted-2">
                    {macros.calories} kcal · {macros.protein}g protein · {recipe.items.length} ingredients
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLog(recipe)}
                  aria-label={`Log ${recipe.name}`}
                  className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-primary text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => window.confirm(`Delete "${recipe.name}"?`) && removeRecipe(recipe.id)}
                  aria-label={`Delete ${recipe.name}`}
                  className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-2 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <RecipeBuilderSheet open={builderOpen} onClose={() => setBuilderOpen(false)} />
    </GlassCard>
  )
}
