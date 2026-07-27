import { MEAL_SLOTS, MEAL_SLOT_LABELS } from './seedData'
import { MEAL_DEFAULT_TIMES, WORKOUT_SESSION_POINTS, MEAL_SLOT_POINTS } from './goals'
import { CATEGORIES } from './categories'

export function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function formatCountdown(minutes) {
  if (minutes <= 0) return 'now'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `in ${h}h ${m}m`
  return `in ${m}m`
}

export function buildTimelineForDate({ activities = [], workout, meals }) {
  const items = []

  for (const act of activities) {
    items.push({
      id: `activity-${act.id}`,
      sourceType: 'activity',
      sourceId: act.id,
      name: act.name,
      icon: act.icon,
      color: act.color,
      category: act.category,
      time: act.startTime || null,
      endTime: act.endTime || null,
      completed: act.completed,
      points: act.points || 0,
      notes: act.notes || '',
    })
  }

  for (const session of workout.sessions) {
    items.push({
      id: `workout-${session.id}`,
      sourceType: 'workout',
      sourceId: session.id,
      name: session.name,
      icon: 'Dumbbell',
      color: '#8b5cf6',
      category: 'health',
      time: session.startTime || null,
      endTime: session.endTime || null,
      completed: session.completed,
      points: WORKOUT_SESSION_POINTS,
      notes: session.category || '',
    })
  }

  for (const slot of MEAL_SLOTS) {
    const slotItems = meals[slot] || []
    items.push({
      id: `meal-${slot}`,
      sourceType: 'meal',
      sourceId: slot,
      name: MEAL_SLOT_LABELS[slot],
      icon: 'UtensilsCrossed',
      color: '#22c55e',
      category: 'health',
      time: MEAL_DEFAULT_TIMES[slot],
      endTime: null,
      completed: slotItems.length > 0,
      points: MEAL_SLOT_POINTS,
      notes: slotItems.map((i) => i.name).join(', '),
    })
  }

  const timed = items.filter((i) => i.time).sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
  const untimed = items.filter((i) => !i.time)

  return { timed, untimed, all: [...timed, ...untimed] }
}

export function getCurrentAndNext(timedItems, now = new Date()) {
  const nowMin = now.getHours() * 60 + now.getMinutes()

  let current = null
  let next = null

  for (const item of timedItems) {
    const startMin = toMinutes(item.time)
    const endMin = item.endTime ? toMinutes(item.endTime) : startMin + 45

    if (startMin <= nowMin && nowMin < endMin && !item.completed) {
      current = item
    }
    if (startMin > nowMin && !next) {
      next = item
    }
  }

  const countdownMinutes = next ? toMinutes(next.time) - nowMin : null

  return { current, next, countdownMinutes }
}

export function computeDailyProgress(items) {
  const totalPoints = items.reduce((sum, i) => sum + (i.points || 0), 0)
  const completedPoints = items.filter((i) => i.completed).reduce((sum, i) => sum + (i.points || 0), 0)
  const percent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
  return { totalPoints, completedPoints, percent }
}

export function computeLifeBalance(items) {
  const result = {}
  for (const cat of Object.keys(CATEGORIES)) {
    const catItems = items.filter((i) => i.category === cat)
    const totalPoints = catItems.reduce((sum, i) => sum + (i.points || 0), 0)
    const completedPoints = catItems
      .filter((i) => i.completed)
      .reduce((sum, i) => sum + (i.points || 0), 0)
    result[cat] = {
      totalPoints,
      completedPoints,
      percent: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : null,
    }
  }
  return result
}
