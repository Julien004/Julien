import { createContext, useContext, useMemo } from 'react'
import { useLocalStorageState, dateKey } from './storage'
import { parseDateKey } from './dateUtils'
import { WORKOUT_SESSION_POINTS, MEAL_SLOT_POINTS } from './goals'

const TrackerContext = createContext(null)

const emptyDayMeals = () => ({ breakfast: [], lunch: [], dinner: [], snacks: [] })
const emptyDayWorkout = () => ({ steps: 0, sessions: [] })

let idCounter = 0
const nextId = () => `id-${Date.now()}-${idCounter++}`

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

  const api = useMemo(() => {
    const getMealsForDate = (key) => meals[key] ?? emptyDayMeals()
    const getWorkoutForDate = (key) => workouts[key] ?? emptyDayWorkout()

    const getActivitiesForDate = (key) => {
      const weekday = parseDateKey(key).getDay()
      return activities
        .filter((def) => {
          if (def.repeat === 'daily') return true
          if (def.repeat === 'weekly') return (def.weeklyDays || []).includes(weekday)
          return def.date === key
        })
        .map((def) => ({ ...def, completed: !!activityCompletions[key]?.[def.id] }))
        .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
    }

    return {
      meals,
      workouts,
      activities,
      reflections,
      water,
      sleep,
      getMealsForDate,
      getWorkoutForDate,
      getActivitiesForDate,

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

      addActivity(activity) {
        const id = nextId()
        setActivities((prev) => [
          ...prev,
          {
            id,
            name: '',
            icon: 'Star',
            color: '#8b5cf6',
            category: 'lifestyle',
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
    }
  }, [
    meals,
    workouts,
    activities,
    activityCompletions,
    reflections,
    water,
    sleep,
    setMeals,
    setWorkouts,
    setActivities,
    setActivityCompletions,
    setReflections,
    setWater,
    setSleep,
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

export { dateKey, WORKOUT_SESSION_POINTS, MEAL_SLOT_POINTS }
