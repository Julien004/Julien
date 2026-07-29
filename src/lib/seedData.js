export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snacks']

export const MEAL_SLOT_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

export function getCurrentMealSlot(date = new Date()) {
  const hour = date.getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snacks'
  return 'dinner'
}

export const MEAL_PLANS = [
  {
    id: 'lean-green',
    name: 'Lean & Green',
    tagline: 'Lower carb, high protein cutting plan',
    macros: { protein: 160, carbs: 120, fat: 60 },
    meals: {
      breakfast: [
        { name: 'Greek yogurt with berries', calories: 220, protein: 18 },
        { name: 'Black coffee', calories: 5, protein: 0 },
      ],
      lunch: [
        { name: 'Grilled chicken breast', calories: 280, protein: 45 },
        { name: 'Mixed leaf salad', calories: 90, protein: 2 },
        { name: 'Olive oil dressing', calories: 80, protein: 0 },
      ],
      dinner: [
        { name: 'Baked salmon', calories: 350, protein: 40 },
        { name: 'Steamed broccoli', calories: 60, protein: 4 },
        { name: 'Quinoa', calories: 180, protein: 8 },
      ],
      snacks: [
        { name: 'Almonds (handful)', calories: 170, protein: 6 },
        { name: 'Protein shake', calories: 150, protein: 25 },
      ],
    },
  },
  {
    id: 'muscle-builder',
    name: 'Muscle Builder',
    tagline: 'Higher calorie plan for strength gains',
    macros: { protein: 190, carbs: 280, fat: 80 },
    meals: {
      breakfast: [
        { name: 'Oats with banana & peanut butter', calories: 480, protein: 15 },
        { name: '3 whole eggs', calories: 210, protein: 18 },
      ],
      lunch: [
        { name: 'Beef & rice bowl', calories: 620, protein: 40 },
        { name: 'Side salad', calories: 70, protein: 2 },
      ],
      dinner: [
        { name: 'Chicken thigh & sweet potato', calories: 560, protein: 35 },
        { name: 'Green beans', calories: 50, protein: 3 },
      ],
      snacks: [
        { name: 'Mass gainer shake', calories: 400, protein: 50 },
        { name: 'Trail mix', calories: 210, protein: 8 },
      ],
    },
  },
  {
    id: 'balanced-maintenance',
    name: 'Balanced Maintenance',
    tagline: 'Everyday plan to hold steady',
    macros: { protein: 130, carbs: 220, fat: 70 },
    meals: {
      breakfast: [
        { name: 'Veggie omelette', calories: 320, protein: 20 },
        { name: 'Wholegrain toast', calories: 140, protein: 6 },
      ],
      lunch: [
        { name: 'Turkey wrap', calories: 420, protein: 30 },
        { name: 'Apple', calories: 95, protein: 0 },
      ],
      dinner: [
        { name: 'Stir-fry tofu & vegetables', calories: 430, protein: 20 },
        { name: 'Brown rice', calories: 200, protein: 5 },
      ],
      snacks: [
        { name: 'Hummus & carrots', calories: 160, protein: 6 },
        { name: 'Dark chocolate square', calories: 60, protein: 1 },
      ],
    },
  },
]
