import { createContext, useContext, useMemo } from 'react'
import { useLocalStorageState, dateKey } from './storage'
import { parseDateKey } from './dateUtils'
import { WORKOUT_SESSION_POINTS, MEAL_SLOT_POINTS } from './goals'
import { FOOD_DATABASE, scaleFoodMacros } from './foodDatabase'

const TrackerContext = createContext(null)

const emptyDayMeals = () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] })
const emptyDayWorkout = () => ({ steps: 0, sessions: [] })

let idCounter = 0
const nextId = () => `id-${Date.now()}-${idCounter++}`
const round1 = (n) => Math.round(n * 10) / 10

export function TrackerProvider({ children }) {
  const [meals, setMeals] = useLocalStorageState('pt-tracker:meals', {})
  const [workouts, setWorkouts] = useLocalStorageState('pt-tracker:workouts', {})
  const [activities, setActivities] = useLocalStorageState('pt-tracker:activities', [])
  const [activityCompletions, setActivityCompletions] = useLocalStorageState(
    'pt-tracker:activityCompletions',
    {}
  )
  const [reflections, setReflections] = useLocalStorageState('pt-tracker:reflections', {})
  const [water, setWater] = useLocalStorageState('pt-tracker:water', {})
  const [sleep, setSleep] = useLocalStorageState('pt-tracker:sleep', {})
  const [weight, setWeight] = useLocalStorageState('pt-tracker:weight', {})
  const [customFoods, setCustomFoods] = useLocalStorageState('pt-tracker:customFoods', [])
  const [recipes, setRecipes] = useLocalStorageState('pt-tracker:recipes', [])
  const [favoriteFoodIds, setFavoriteFoodIds] = useLocalStorageState('pt-tracker:favoriteFoodIds', [])
  const [recentFoodLog, setRecentFoodLog] = useLocalStorageState('pt-tracker:recentFoodLog', [])

  const api = useMemo(() => {
    const getMealsForDate = (key) => meals[key] ?? emptyDayMeals()
    const getWorkoutForDate = (key) => workouts[key] ?? emptyDayWorkout()

    const getActivitiesForDate = (key) => {
      const target = parseDateKey(key)
      const weekday = target.getDay()
      return activities
        .filter((def) => {
          if (def.repeat === 'daily') return true
          if (def.repeat === 'weekdays') return weekday >= 1 && weekday <= 5
          if (def.repeat === 'weekly') return (def.weeklyDays || []).includes(weekday)
          if (def.repeat === 'monthly') {
            if (!def.date) return false
            return parseDateKey(def.date).getDate() === target.getDate()
          }
          return def.date === key
        })
        .map((def) => ({ ...def, completed: !!activityCompletions[key]?.[def.id] }))
        .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
    }

    const getAllFoods = () => [...FOOD_DATABASE, ...customFoods]
    const getFood = (id) => getAllFoods().find((f) => f.id === id)
    const getRecipe = (id) => recipes.find((r) => r.id === id)

    const computeRecipeMacros = (recipe) => {
      const foods = getAllFoods()
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      for (const line of recipe.items) {
        const food = foods.find((f) => f.id === line.foodId)
        if (!food) continue
        const scaled = scaleFoodMacros(food.per100, line.grams)
        for (const k of Object.keys(totals)) totals[k] += scaled[k]
      }
      return {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        sugar: Math.round(totals.sugar * 10) / 10,
        sodium: Math.round(totals.sodium),
      }
    }

    return {
      meals,
      workouts,
      activities,
      reflections,
      water,
      sleep,
      weight,
      customFoods,
      recipes,
      favoriteFoodIds,
      recentFoodLog,
      getMealsForDate,
      getWorkoutForDate,
      getActivitiesForDate,
      getAllFoods,
      getFood,
      getRecipe,
      computeRecipeMacros,

      addFoodItem(key, slot, item) {
        setMeals((prev) => {
          const day = prev[key] ?? emptyDayMeals()
          return {
            ...prev,
            [key]: { ...day, [slot]: [...day[slot], { id: nextId(), ...item }] },
          }
        })
      },

      removeFoodItem(key, slot, itemId) {
        setMeals((prev) => {
          const day = prev[key] ?? emptyDayMeals()
          return {
            ...prev,
            [key]: { ...day, [slot]: day[slot].filter((it) => it.id !== itemId) },
          }
        })
      },

      applyMealPlan(key, plan) {
        setMeals((prev) => {
          const withIds = {}
          for (const slot of Object.keys(plan.meals)) {
            withIds[slot] = plan.meals[slot].map((it) => ({ id: nextId(), ...it }))
          }
          return { ...prev, [key]: { ...emptyDayMeals(), ...withIds } }
        })
      },

      logFood(key, slot, food, grams) {
        const macros = scaleFoodMacros(food.per100, grams)
        setMeals((prev) => {
          const day = prev[key] ?? emptyDayMeals()
          const item = { id: nextId(), name: food.name, foodId: food.id, grams, ...macros }
          return { ...prev, [key]: { ...day, [slot]: [...day[slot], item] } }
        })
        setRecentFoodLog((prev) => {
          const withoutFood = prev.filter((r) => r.foodId !== food.id)
          return [{ foodId: food.id, grams, loggedAt: Date.now() }, ...withoutFood].slice(0, 20)
        })
      },

      logRecipe(key, slot, recipe) {
        const macros = computeRecipeMacros(recipe)
        setMeals((prev) => {
          const day = prev[key] ?? emptyDayMeals()
          const item = { id: nextId(), name: recipe.name, recipeId: recipe.id, ...macros }
          return { ...prev, [key]: { ...day, [slot]: [...day[slot], item] } }
        })
      },

      addCustomFood(data) {
        const id = nextId()
        const grams = Number(data.servingSize) || 100
        const scale = 100 / grams
        const food = {
          id,
          name: data.name,
          group: 'Custom',
          defaultGrams: grams,
          commonServings: [{ label: `1 serving (${grams}g)`, grams }],
          custom: true,
          barcode: data.barcode || null,
          per100: {
            calories: Math.round((Number(data.calories) || 0) * scale),
            protein: round1((Number(data.protein) || 0) * scale),
            carbs: round1((Number(data.carbs) || 0) * scale),
            fat: round1((Number(data.fat) || 0) * scale),
            fiber: round1((Number(data.fiber) || 0) * scale),
            sugar: round1((Number(data.sugar) || 0) * scale),
            sodium: Math.round((Number(data.sodium) || 0) * scale),
          },
        }
        setCustomFoods((prev) => [...prev, food])
        return food
      },

      findFoodByBarcode(barcode) {
        return customFoods.find((f) => f.barcode === barcode) || null
      },

      removeCustomFood(id) {
        setCustomFoods((prev) => prev.filter((f) => f.id !== id))
        setFavoriteFoodIds((prev) => prev.filter((f) => f !== id))
      },

      addRecipe(data) {
        const id = nextId()
        setRecipes((prev) => [
          ...prev,
          {
            id,
            name: data.name,
            icon: data.icon || 'UtensilsCrossed',
            color: data.color || '#22c55e',
            items: data.items || [],
            createdAt: Date.now(),
          },
        ])
        return id
      },

      updateRecipe(id, patch) {
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
      },

      removeRecipe(id) {
        setRecipes((prev) => prev.filter((r) => r.id !== id))
      },

      toggleFavoriteFood(foodId) {
        setFavoriteFoodIds((prev) =>
          prev.includes(foodId) ? prev.filter((f) => f !== foodId) : [...prev, foodId]
        )
      },

      addWeightEntry(key, kg) {
        setWeight((prev) => ({ ...prev, [key]: Number(kg) }))
      },

      removeWeightEntry(key) {
        setWeight((prev) => {
          const { [key]: _removed, ...rest } = prev
          return rest
        })
      },

      addSession(key, sessionData) {
        const id = nextId()
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          const session = {
            completed: false,
            startTime: '',
            endTime: '',
            details: {},
            notes: '',
            ...sessionData,
            id,
          }
          return { ...prev, [key]: { ...day, sessions: [...day.sessions, session] } }
        })
        return id
      },

      moveSession(oldKey, newKey, sessionId, patch) {
        if (oldKey === newKey) {
          setWorkouts((prev) => {
            const day = prev[oldKey] ?? emptyDayWorkout()
            return {
              ...prev,
              [oldKey]: {
                ...day,
                sessions: day.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)),
              },
            }
          })
          return
        }
        setWorkouts((prev) => {
          const oldDay = prev[oldKey] ?? emptyDayWorkout()
          const session = oldDay.sessions.find((s) => s.id === sessionId)
          if (!session) return prev
          const newDay = prev[newKey] ?? emptyDayWorkout()
          return {
            ...prev,
            [oldKey]: { ...oldDay, sessions: oldDay.sessions.filter((s) => s.id !== sessionId) },
            [newKey]: { ...newDay, sessions: [...newDay.sessions, { ...session, ...patch }] },
          }
        })
      },

      removeSession(key, sessionId) {
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          return {
            ...prev,
            [key]: { ...day, sessions: day.sessions.filter((s) => s.id !== sessionId) },
          }
        })
      },

      toggleSessionComplete(key, sessionId) {
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          return {
            ...prev,
            [key]: {
              ...day,
              sessions: day.sessions.map((s) =>
                s.id === sessionId ? { ...s, completed: !s.completed } : s
              ),
            },
          }
        })
      },

      updateSession(key, sessionId, patch) {
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          return {
            ...prev,
            [key]: {
              ...day,
              sessions: day.sessions.map((s) =>
                s.id === sessionId ? { ...s, ...patch } : s
              ),
            },
          }
        })
      },

      setSteps(key, steps) {
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          return { ...prev, [key]: { ...day, steps } }
        })
      },

      addActivity(activity) {
        const id = nextId()
        setActivities((prev) => [
          ...prev,
          {
            id,
            name: '',
            icon: 'Star',
            color: '#8b5cf6',
            category: 'custom',
            priority: 'medium',
            points: 10,
            notes: '',
            startTime: '',
            endTime: '',
            repeat: 'none',
            weeklyDays: [],
            date: dateKey(new Date()),
            reminder: false,
            createdAt: Date.now(),
            ...activity,
          },
        ])
        return id
      },

      updateActivity(id, patch) {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
      },

      removeActivity(id) {
        setActivities((prev) => prev.filter((a) => a.id !== id))
        setActivityCompletions((prev) => {
          const next = {}
          for (const [key, dayMap] of Object.entries(prev)) {
            if (dayMap[id] === undefined) {
              next[key] = dayMap
            } else {
              const { [id]: _removed, ...rest } = dayMap
              next[key] = rest
            }
          }
          return next
        })
      },

      duplicateActivity(id) {
        const source = activities.find((a) => a.id === id)
        if (!source) return null
        const newId = nextId()
        setActivities((prev) => [
          ...prev,
          { ...source, id: newId, name: source.name, createdAt: Date.now() },
        ])
        return newId
      },

      toggleActivityCompletion(key, activityId) {
        setActivityCompletions((prev) => {
          const day = prev[key] ?? {}
          return { ...prev, [key]: { ...day, [activityId]: !day[activityId] } }
        })
      },

      saveReflection(key, data) {
        setReflections((prev) => ({ ...prev, [key]: { ...data, submittedAt: Date.now() } }))
      },

      getWaterForDate(key) {
        return water[key] || 0
      },

      addWater(key, ml) {
        setWater((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + ml) }))
      },

      getSleepForDate(key) {
        return sleep[key] ?? null
      },

      setSleepHours(key, hours) {
        setSleep((prev) => ({ ...prev, [key]: hours }))
      },

      getWeightForDate(key) {
        return weight[key] ?? null
      },
    }
  }, [
    meals,
    workouts,
    activities,
    activityCompletions,
    reflections,
    water,
    sleep,
    weight,
    customFoods,
    recipes,
    favoriteFoodIds,
    recentFoodLog,
    setMeals,
    setWorkouts,
    setActivities,
    setActivityCompletions,
    setReflections,
    setWater,
    setSleep,
    setWeight,
    setCustomFoods,
    setRecipes,
    setFavoriteFoodIds,
    setRecentFoodLog,
  ])

  return <TrackerContext.Provider value={api}>{children}</TrackerContext.Provider>
}

export function useTracker() {
  const ctx = useContext(TrackerContext)
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider')
  return ctx
}

export function caloriesForDay(dayMeals) {
  return Object.values(dayMeals).reduce(
    (sum, items) => sum + items.reduce((s, it) => s + (it.calories || 0), 0),
    0
  )
}

export function proteinForDay(dayMeals) {
  return Object.values(dayMeals).reduce(
    (sum, items) => sum + items.reduce((s, it) => s + (it.protein || 0), 0),
    0
  )
}

function macroFieldForDay(dayMeals, field) {
  return Object.values(dayMeals).reduce(
    (sum, items) => sum + items.reduce((s, it) => s + (it[field] || 0), 0),
    0
  )
}

export function carbsForDay(dayMeals) {
  return macroFieldForDay(dayMeals, 'carbs')
}

export function fatForDay(dayMeals) {
  return macroFieldForDay(dayMeals, 'fat')
}

export function fiberForDay(dayMeals) {
  return macroFieldForDay(dayMeals, 'fiber')
}

export function sugarForDay(dayMeals) {
  return macroFieldForDay(dayMeals, 'sugar')
}

export function sodiumForDay(dayMeals) {
  return macroFieldForDay(dayMeals, 'sodium')
}

export function macrosForDay(dayMeals) {
  return {
    calories: caloriesForDay(dayMeals),
    protein: proteinForDay(dayMeals),
    carbs: carbsForDay(dayMeals),
    fat: fatForDay(dayMeals),
    fiber: fiberForDay(dayMeals),
    sugar: sugarForDay(dayMeals),
    sodium: sodiumForDay(dayMeals),
  }
}

export { dateKey, WORKOUT_SESSION_POINTS, MEAL_SLOT_POINTS }
