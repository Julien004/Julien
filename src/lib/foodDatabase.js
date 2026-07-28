// Curated offline food database. Macros are per 100g/100ml unless the food is
// naturally counted in units (e.g. eggs) — commonServings gives quick presets.
// [id, name, group, defaultGrams, [calories, protein, carbs, fat, fibre, sugar, sodiumMg], commonServings]
const RAW = [
  ['chicken-breast', 'Chicken Breast', 'Protein', 150, [165, 31, 0, 3.6, 0, 0, 74], [{ label: '1 breast (172g)', grams: 172 }]],
  ['chicken-thigh', 'Chicken Thigh', 'Protein', 120, [209, 26, 0, 10.9, 0, 0, 90]],
  ['turkey-breast', 'Turkey Breast', 'Protein', 150, [135, 30, 0, 1, 0, 0, 50]],
  ['turkey-mince', 'Turkey Mince (cooked)', 'Protein', 150, [176, 27, 0, 7, 0, 0, 82]],
  ['salmon', 'Salmon', 'Protein', 150, [208, 20, 0, 13, 0, 0, 59], [{ label: '1 fillet (170g)', grams: 170 }]],
  ['tuna-canned', 'Tuna (canned in water)', 'Protein', 100, [116, 26, 0, 1, 0, 0, 247], [{ label: '1 can (142g)', grams: 142 }]],
  ['cod', 'Cod', 'Protein', 150, [105, 23, 0, 0.9, 0, 0, 78]],
  ['shrimp', 'Shrimp', 'Protein', 120, [99, 24, 0.2, 0.3, 0, 0, 111]],
  ['steak', 'Steak (Sirloin)', 'Protein', 200, [271, 29, 0, 17, 0, 0, 60], [{ label: '1 steak (225g)', grams: 225 }]],
  ['ground-beef', 'Ground Beef (85% lean)', 'Protein', 150, [250, 26, 0, 17, 0, 0, 75]],
  ['pork-chop', 'Pork Chop', 'Protein', 150, [231, 27, 0, 13, 0, 0, 62]],
  ['bacon', 'Bacon', 'Protein', 30, [541, 37, 1.4, 42, 0, 0, 1717], [{ label: '2 slices (16g)', grams: 16 }]],
  ['eggs', 'Eggs', 'Protein', 100, [155, 13, 1.1, 11, 0, 1.1, 124], [{ label: '1 large egg (50g)', grams: 50 }, { label: '2 eggs (100g)', grams: 100 }]],
  ['egg-whites', 'Egg Whites', 'Protein', 100, [52, 11, 0.7, 0.2, 0, 0.7, 166]],
  ['tofu', 'Tofu (firm)', 'Protein', 150, [144, 15.5, 3.3, 8.7, 2.3, 0.6, 12]],
  ['protein-shake', 'Protein Shake', 'Protein', 30, [400, 80, 10, 5, 1.5, 6, 430], [{ label: '1 scoop (30g)', grams: 30 }]],
  ['protein-bar', 'Protein Bar', 'Protein', 60, [350, 20, 35, 12, 5, 15, 200], [{ label: '1 bar (60g)', grams: 60 }]],

  ['greek-yoghurt', 'Greek Yoghurt (nonfat)', 'Dairy', 170, [59, 10, 3.6, 0.4, 0, 3.6, 36], [{ label: '1 pot (170g)', grams: 170 }]],
  ['greek-yoghurt-full', 'Greek Yoghurt (full fat)', 'Dairy', 170, [97, 9, 4, 5, 0, 4, 35]],
  ['cottage-cheese', 'Cottage Cheese', 'Dairy', 150, [72, 12, 2.7, 1, 0, 2.7, 330]],
  ['milk-whole', 'Milk (whole)', 'Dairy', 250, [61, 3.2, 4.8, 3.3, 0, 5.1, 40], [{ label: '1 cup (240ml)', grams: 240 }]],
  ['milk-skim', 'Milk (skim)', 'Dairy', 250, [34, 3.4, 5, 0.1, 0, 5, 42], [{ label: '1 cup (240ml)', grams: 240 }]],
  ['cheddar', 'Cheddar Cheese', 'Dairy', 30, [403, 25, 1.3, 33, 0, 0.5, 621], [{ label: '1 slice (28g)', grams: 28 }]],
  ['mozzarella', 'Mozzarella', 'Dairy', 30, [280, 28, 3.1, 17, 0, 1.2, 627]],
  ['feta', 'Feta Cheese', 'Dairy', 30, [264, 14, 4.1, 21, 0, 4.1, 917]],
  ['parmesan', 'Parmesan', 'Dairy', 20, [431, 38, 4.1, 29, 0, 0.9, 1529]],

  ['rice-white', 'Rice (white, cooked)', 'Grains', 150, [130, 2.7, 28, 0.3, 0.4, 0.1, 1], [{ label: '1 cup (158g)', grams: 158 }]],
  ['rice-brown', 'Rice (brown, cooked)', 'Grains', 150, [123, 2.7, 26, 1, 1.6, 0.2, 4], [{ label: '1 cup (195g)', grams: 195 }]],
  ['quinoa', 'Quinoa (cooked)', 'Grains', 150, [120, 4.4, 21, 1.9, 2.8, 0.9, 7]],
  ['oats', 'Oats (dry)', 'Grains', 40, [389, 16.9, 66, 6.9, 10.6, 1, 2], [{ label: '1/2 cup (40g)', grams: 40 }]],
  ['pasta', 'Pasta (cooked)', 'Grains', 180, [131, 5, 25, 1.1, 1.8, 0.6, 1], [{ label: '1 cup (140g)', grams: 140 }]],
  ['bread-white', 'Bread (white)', 'Grains', 30, [265, 9, 49, 3.2, 2.7, 5, 491], [{ label: '1 slice (30g)', grams: 30 }]],
  ['bread-wholegrain', 'Bread (wholegrain)', 'Grains', 32, [247, 13, 41, 4.2, 7, 6, 400], [{ label: '1 slice (32g)', grams: 32 }]],
  ['bagel', 'Bagel', 'Grains', 95, [250, 10, 49, 1.5, 2.1, 5, 430], [{ label: '1 bagel (95g)', grams: 95 }]],
  ['tortilla-wrap', 'Tortilla Wrap', 'Grains', 45, [312, 8.2, 51, 7.6, 3.1, 2, 550], [{ label: '1 wrap (45g)', grams: 45 }]],
  ['cereal-bran-flakes', 'Bran Flakes', 'Grains', 40, [317, 10, 80, 1.7, 13, 12, 590]],
  ['granola', 'Granola', 'Grains', 50, [471, 10, 64, 20, 7, 24, 20]],

  ['sweet-potato', 'Sweet Potato (baked)', 'Vegetables', 150, [90, 2, 21, 0.1, 3.3, 6.5, 36], [{ label: '1 medium (150g)', grams: 150 }]],
  ['potato', 'Potato (baked)', 'Vegetables', 170, [93, 2.5, 21, 0.1, 2.2, 1.2, 6], [{ label: '1 medium (170g)', grams: 170 }]],
  ['broccoli', 'Broccoli (cooked)', 'Vegetables', 100, [35, 2.4, 7.2, 0.4, 3.3, 1.4, 41]],
  ['spinach', 'Spinach (raw)', 'Vegetables', 60, [23, 2.9, 3.6, 0.4, 2.2, 0.4, 79]],
  ['kale', 'Kale (raw)', 'Vegetables', 60, [49, 4.3, 8.8, 0.9, 3.6, 2.3, 38]],
  ['carrots', 'Carrots (raw)', 'Vegetables', 80, [41, 0.9, 10, 0.2, 2.8, 4.7, 69], [{ label: '1 medium (61g)', grams: 61 }]],
  ['green-beans', 'Green Beans (cooked)', 'Vegetables', 100, [35, 1.8, 7.9, 0.2, 3.4, 3.3, 6]],
  ['tomato', 'Tomato', 'Vegetables', 120, [18, 0.9, 3.9, 0.2, 1.2, 2.6, 5], [{ label: '1 medium (120g)', grams: 120 }]],
  ['cucumber', 'Cucumber', 'Vegetables', 100, [15, 0.7, 3.6, 0.1, 0.5, 1.7, 2]],
  ['bell-pepper', 'Bell Pepper', 'Vegetables', 120, [31, 1, 6, 0.3, 2.1, 4.2, 4], [{ label: '1 medium (120g)', grams: 120 }]],
  ['onion', 'Onion', 'Vegetables', 110, [40, 1.1, 9.3, 0.1, 1.7, 4.2, 4]],
  ['mushrooms', 'Mushrooms', 'Vegetables', 70, [22, 3.1, 3.3, 0.3, 1, 2, 5]],
  ['zucchini', 'Zucchini', 'Vegetables', 100, [17, 1.2, 3.1, 0.3, 1, 2.5, 8]],
  ['cauliflower', 'Cauliflower', 'Vegetables', 100, [25, 1.9, 5, 0.3, 2, 1.9, 30]],
  ['corn', 'Corn (sweet)', 'Vegetables', 90, [86, 3.2, 19, 1.2, 2, 3.2, 15]],
  ['peas', 'Peas', 'Vegetables', 80, [81, 5.4, 14, 0.4, 5.7, 5.7, 5]],
  ['lettuce', 'Lettuce', 'Vegetables', 50, [15, 1.4, 2.9, 0.2, 1.3, 0.8, 28]],

  ['avocado', 'Avocado', 'Fruit', 100, [160, 2, 8.5, 14.7, 6.7, 0.7, 7], [{ label: '1/2 avocado (100g)', grams: 100 }]],
  ['banana', 'Banana', 'Fruit', 118, [89, 1.1, 23, 0.3, 2.6, 12, 1], [{ label: '1 medium (118g)', grams: 118 }]],
  ['apple', 'Apple', 'Fruit', 182, [52, 0.3, 14, 0.2, 2.4, 10, 1], [{ label: '1 medium (182g)', grams: 182 }]],
  ['orange', 'Orange', 'Fruit', 131, [47, 0.9, 12, 0.1, 2.4, 9, 0], [{ label: '1 medium (131g)', grams: 131 }]],
  ['strawberries', 'Strawberries', 'Fruit', 150, [32, 0.7, 7.7, 0.3, 2, 4.9, 1], [{ label: '1 cup (150g)', grams: 150 }]],
  ['blueberries', 'Blueberries', 'Fruit', 148, [57, 0.7, 14.5, 0.3, 2.4, 10, 1], [{ label: '1 cup (148g)', grams: 148 }]],
  ['grapes', 'Grapes', 'Fruit', 150, [69, 0.7, 18, 0.2, 0.9, 16, 2], [{ label: '1 cup (150g)', grams: 150 }]],
  ['pineapple', 'Pineapple', 'Fruit', 150, [50, 0.5, 13, 0.1, 1.4, 10, 1]],
  ['mango', 'Mango', 'Fruit', 165, [60, 0.8, 15, 0.4, 1.6, 14, 1], [{ label: '1 cup (165g)', grams: 165 }]],
  ['watermelon', 'Watermelon', 'Fruit', 150, [30, 0.6, 7.6, 0.2, 0.4, 6.2, 1]],
  ['kiwi', 'Kiwi', 'Fruit', 76, [61, 1.1, 15, 0.5, 3, 9, 3], [{ label: '1 kiwi (76g)', grams: 76 }]],
  ['pear', 'Pear', 'Fruit', 178, [57, 0.4, 15, 0.1, 3.1, 10, 1], [{ label: '1 medium (178g)', grams: 178 }]],
  ['peach', 'Peach', 'Fruit', 150, [39, 0.9, 9.5, 0.3, 1.5, 8.4, 0]],
  ['dates', 'Dates', 'Fruit', 24, [282, 2.5, 75, 0.4, 8, 63, 1], [{ label: '3 dates (24g)', grams: 24 }]],
  ['raisins', 'Raisins', 'Fruit', 40, [299, 3.1, 79, 0.5, 3.7, 59, 11]],

  ['almonds', 'Almonds', 'Nuts & Fats', 28, [579, 21, 22, 50, 12.5, 4.4, 1], [{ label: 'Handful (28g)', grams: 28 }]],
  ['peanut-butter', 'Peanut Butter', 'Nuts & Fats', 32, [588, 25, 20, 50, 6, 9, 17], [{ label: '2 tbsp (32g)', grams: 32 }]],
  ['walnuts', 'Walnuts', 'Nuts & Fats', 28, [654, 15, 14, 65, 6.7, 2.6, 2]],
  ['cashews', 'Cashews', 'Nuts & Fats', 28, [553, 18, 30, 44, 3.3, 5.9, 12]],
  ['olive-oil', 'Olive Oil', 'Nuts & Fats', 14, [884, 0, 0, 100, 0, 0, 2], [{ label: '1 tbsp (14g)', grams: 14 }]],
  ['butter', 'Butter', 'Nuts & Fats', 14, [717, 0.9, 0.1, 81, 0, 0.1, 11], [{ label: '1 tbsp (14g)', grams: 14 }]],
  ['hummus', 'Hummus', 'Nuts & Fats', 60, [166, 8, 14, 10, 6, 0.3, 379]],

  ['black-beans', 'Black Beans (cooked)', 'Legumes', 150, [132, 8.9, 24, 0.5, 8.7, 0.3, 1]],
  ['chickpeas', 'Chickpeas (cooked)', 'Legumes', 150, [164, 8.9, 27, 2.6, 7.6, 4.8, 7]],
  ['lentils', 'Lentils (cooked)', 'Legumes', 150, [116, 9, 20, 0.4, 7.9, 1.8, 2]],

  ['dark-chocolate', 'Dark Chocolate', 'Snacks', 30, [546, 4.9, 61, 31, 7, 48, 24], [{ label: '5 squares (30g)', grams: 30 }]],
  ['popcorn', 'Popcorn (air-popped)', 'Snacks', 30, [387, 12.9, 78, 4.5, 14.5, 0.9, 8]],
  ['french-fries', 'French Fries', 'Snacks', 130, [312, 3.4, 41, 15, 3.8, 0.3, 210]],
  ['pizza', 'Pizza (cheese)', 'Snacks', 110, [266, 11, 33, 10, 2.3, 3.6, 598], [{ label: '1 slice (110g)', grams: 110 }]],
  ['honey', 'Honey', 'Snacks', 21, [304, 0.3, 82, 0, 0.2, 82, 4], [{ label: '1 tbsp (21g)', grams: 21 }]],
  ['sugar-white', 'Sugar (white)', 'Snacks', 4, [387, 0, 100, 0, 0, 100, 1], [{ label: '1 tsp (4g)', grams: 4 }]],

  ['ketchup', 'Ketchup', 'Condiments', 17, [101, 1.2, 27, 0.1, 0.4, 22, 907], [{ label: '1 tbsp (17g)', grams: 17 }]],
  ['mayonnaise', 'Mayonnaise', 'Condiments', 14, [680, 1, 0.6, 75, 0, 0.6, 635], [{ label: '1 tbsp (14g)', grams: 14 }]],
  ['salsa', 'Salsa', 'Condiments', 36, [36, 1.6, 7, 0.2, 1.8, 4, 400]],
  ['soy-sauce', 'Soy Sauce', 'Condiments', 16, [60, 10.5, 5.6, 0.1, 0.8, 0.4, 5493], [{ label: '1 tbsp (16g)', grams: 16 }]],

  ['coffee-black', 'Coffee (black)', 'Beverages', 240, [2, 0.3, 0, 0, 0, 0, 5], [{ label: '1 cup (240ml)', grams: 240 }]],
  ['orange-juice', 'Orange Juice', 'Beverages', 240, [45, 0.7, 10.4, 0.2, 0.2, 8.4, 1], [{ label: '1 cup (240ml)', grams: 240 }]],
  ['soda-cola', 'Soda (Cola)', 'Beverages', 330, [41, 0, 10.6, 0, 0, 10.6, 4], [{ label: '1 can (330ml)', grams: 330 }]],
  ['beer', 'Beer', 'Beverages', 355, [43, 0.5, 3.6, 0, 0, 0, 4], [{ label: '1 can (355ml)', grams: 355 }]],
  ['red-wine', 'Red Wine', 'Beverages', 148, [85, 0.1, 2.6, 0, 0, 0.6, 4], [{ label: '1 glass (148ml)', grams: 148 }]],
]

export const FOOD_GROUPS = [...new Set(RAW.map((r) => r[2]))]

export const FOOD_DATABASE = RAW.map(([id, name, group, defaultGrams, m, commonServings]) => ({
  id,
  name,
  group,
  defaultGrams,
  commonServings: commonServings || [],
  per100: {
    calories: m[0],
    protein: m[1],
    carbs: m[2],
    fat: m[3],
    fiber: m[4],
    sugar: m[5],
    sodium: m[6],
  },
}))

export function getFoodById(id) {
  return FOOD_DATABASE.find((f) => f.id === id)
}

export function scaleFoodMacros(per100, grams) {
  const scale = grams / 100
  return {
    calories: Math.round(per100.calories * scale),
    protein: round1(per100.protein * scale),
    carbs: round1(per100.carbs * scale),
    fat: round1(per100.fat * scale),
    fiber: round1(per100.fiber * scale),
    sugar: round1(per100.sugar * scale),
    sodium: Math.round(per100.sodium * scale),
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

export function searchFoods(query, extra = []) {
  const q = query.trim().toLowerCase()
  const pool = [...FOOD_DATABASE, ...extra]
  if (!q) return pool
  return pool.filter((f) => f.name.toLowerCase().includes(q))
}
