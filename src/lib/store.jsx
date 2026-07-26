import { createContext, useContext, useMemo } from 'react'
import { useLocalStorageState, dateKey } from './storage'

const TrackerContext = createContext(null)

const emptyDayMeals = () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] })
const emptyDayWorkout = () => ({ steps: 0, sessions: [] })

let idCounter = 0
const nextId = () => `id-${Date.now()}-${idCounter++}`

export function TrackerProvider({ children }) {
  const [meals, setMeals] = useLocalStorageState('pt-tracker:meals', {})
  const [workouts, setWorkouts] = useLocalStorageState('pt-tracker:workouts', {})

  const api = useMemo(() => {
    const getMealsForDate = (key) => meals[key] ?? emptyDayMeals()
    const getWorkoutForDate = (key) => workouts[key] ?? emptyDayWorkout()

    return {
      meals,
      workouts,
      getMealsForDate,
      getWorkoutForDate,

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

      addSession(key, exercise) {
        setWorkouts((prev) => {
          const day = prev[key] ?? emptyDayWorkout()
          const session = {
            id: nextId(),
            exerciseId: exercise.id,
            name: exercise.name,
            category: exercise.category,
            completed: false,
            durationMinutes: exercise.defaultDuration ?? 30,
            startTime: '',
            endTime: '',
          }
          return { ...prev, [key]: { ...day, sessions: [...day.sessions, session] } }
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
    }
  }, [meals, workouts, setMeals, setWorkouts])

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

export { dateKey }
