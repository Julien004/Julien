export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snacks']

export const MEAL_SLOT_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
}

export const MEAL_PLANS = [
  {
    id: 'lean-green',
    name: 'Lean & Green',
    tagline: 'Lower carb, high protein cutting plan',
    macros: { protein: 160, carbs: 120, fat: 60 },
    meals: {
      breakfast: [
        { name: 'Greek yogurt with berries', calories: 220 },
        { name: 'Black coffee', calories: 5 },
      ],
      lunch: [
        { name: 'Grilled chicken breast', calories: 280 },
        { name: 'Mixed leaf salad', calories: 90 },
        { name: 'Olive oil dressing', calories: 80 },
      ],
      dinner: [
        { name: 'Baked salmon', calories: 350 },
        { name: 'Steamed broccoli', calories: 60 },
        { name: 'Quinoa', calories: 180 },
      ],
      snacks: [
        { name: 'Almonds (handful)', calories: 170 },
        { name: 'Protein shake', calories: 150 },
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
        { name: 'Oats with banana & peanut butter', calories: 480 },
        { name: '3 whole eggs', calories: 210 },
      ],
      lunch: [
        { name: 'Beef & rice bowl', calories: 620 },
        { name: 'Side salad', calories: 70 },
      ],
      dinner: [
        { name: 'Chicken thigh & sweet potato', calories: 560 },
        { name: 'Green beans', calories: 50 },
      ],
      snacks: [
        { name: 'Mass gainer shake', calories: 400 },
        { name: 'Trail mix', calories: 210 },
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
        { name: 'Veggie omelette', calories: 320 },
        { name: 'Wholegrain toast', calories: 140 },
      ],
      lunch: [
        { name: 'Turkey wrap', calories: 420 },
        { name: 'Apple', calories: 95 },
      ],
      dinner: [
        { name: 'Stir-fry tofu & vegetables', calories: 430 },
        { name: 'Brown rice', calories: 200 },
      ],
      snacks: [
        { name: 'Hummus & carrots', calories: 160 },
        { name: 'Dark chocolate square', calories: 60 },
      ],
    },
  },
]

export const EXERCISE_LIBRARY = [
  { id: 'upper-strength', name: 'Upper Body Strength', category: 'Strength', defaultDuration: 50 },
  { id: 'lower-strength', name: 'Leg Day', category: 'Strength', defaultDuration: 55 },
  { id: 'full-body', name: 'Full Body Circuit', category: 'Strength', defaultDuration: 45 },
  { id: 'hiit', name: 'HIIT Cardio', category: 'Cardio', defaultDuration: 25 },
  { id: 'steady-cardio', name: 'Steady State Run', category: 'Cardio', defaultDuration: 30 },
  { id: 'mobility', name: 'Mobility & Stretch', category: 'Recovery', defaultDuration: 20 },
  { id: 'core', name: 'Core & Abs', category: 'Strength', defaultDuration: 20 },
  { id: 'rest-walk', name: 'Recovery Walk', category: 'Recovery', defaultDuration: 30 },
]
