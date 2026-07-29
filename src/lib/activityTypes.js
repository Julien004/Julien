export const ACTIVITY_TYPES = [
  { id: 'gym', label: 'Gym', icon: 'Dumbbell', color: '#8b5cf6' },
  { id: 'running', label: 'Running', icon: 'Footprints', color: '#22c55e' },
  { id: 'walking', label: 'Walking', icon: 'PersonStanding', color: '#06b6d4' },
  { id: 'cycling', label: 'Cycling', icon: 'Bike', color: '#f59e0b' },
  { id: 'swimming', label: 'Swimming', icon: 'Waves', color: '#3b82f6' },
  { id: 'basketball', label: 'Basketball', icon: 'CircleDot', color: '#ef4444' },
  { id: 'tennis', label: 'Tennis', icon: 'Trophy', color: '#eab308' },
  { id: 'martialArts', label: 'Martial Arts', icon: 'Swords', color: '#ec4899' },
  { id: 'yoga', label: 'Yoga', icon: 'Flower2', color: '#a855f7' },
  { id: 'custom', label: 'Other', icon: 'Star', color: '#64748b' },
]

export const ACTIVITY_TYPE_MAP = Object.fromEntries(ACTIVITY_TYPES.map((a) => [a.id, a]))

export function getActivityType(id) {
  return ACTIVITY_TYPE_MAP[id] || ACTIVITY_TYPE_MAP.custom
}

export const MARTIAL_ARTS_DISCIPLINES = ['Boxing', 'Muay Thai', 'BJJ', 'Judo', 'Karate', 'Kickboxing', 'MMA', 'Other']
export const YOGA_STYLES = ['Hatha', 'Vinyasa', 'Power', 'Yin', 'Restorative', 'Other']
export const SWIM_STROKES = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Mixed']
export const INTENSITY_LEVELS = ['Light', 'Moderate', 'Hard']
export const GAME_TYPES = ['Pickup', 'Practice', 'Match']
export const MATCH_TYPES = ['Singles', 'Doubles']
export const MATCH_RESULTS = ['Won', 'Lost', 'Practice']
