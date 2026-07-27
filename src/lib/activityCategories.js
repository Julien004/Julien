export const ACTIVITY_CATEGORIES = [
  { id: 'gym', label: 'Gym', icon: 'Dumbbell', color: '#8b5cf6', balance: 'health' },
  { id: 'cardio', label: 'Cardio', icon: 'HeartPulse', color: '#ef4444', balance: 'health' },
  { id: 'running', label: 'Running', icon: 'Footprints', color: '#22c55e', balance: 'health' },
  { id: 'walking', label: 'Walking', icon: 'PersonStanding', color: '#06b6d4', balance: 'health' },
  { id: 'meal', label: 'Meal', icon: 'UtensilsCrossed', color: '#22c55e', balance: 'health' },
  { id: 'work', label: 'Work', icon: 'Briefcase', color: '#3b82f6', balance: 'productivity' },
  { id: 'study', label: 'Study', icon: 'GraduationCap', color: '#3b82f6', balance: 'productivity' },
  { id: 'chores', label: 'Chores', icon: 'Sparkles', color: '#64748b', balance: 'productivity' },
  { id: 'appointments', label: 'Appointments', icon: 'CalendarClock', color: '#3b82f6', balance: 'productivity' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', color: '#a855f7', balance: 'lifestyle' },
  { id: 'social', label: 'Social', icon: 'Users', color: '#ec4899', balance: 'lifestyle' },
  { id: 'reading', label: 'Reading', icon: 'Book', color: '#f97316', balance: 'mindset' },
  { id: 'meditation', label: 'Meditation', icon: 'Flower2', color: '#f97316', balance: 'mindset' },
  { id: 'custom', label: 'Custom', icon: 'Star', color: '#64748b', balance: 'lifestyle' },
]

export const CATEGORY_MAP = Object.fromEntries(ACTIVITY_CATEGORIES.map((c) => [c.id, c]))

export function getActivityCategory(id) {
  return CATEGORY_MAP[id] || CATEGORY_MAP.custom
}

export function getCategoryBalance(id) {
  return CATEGORY_MAP[id]?.balance || 'lifestyle'
}
