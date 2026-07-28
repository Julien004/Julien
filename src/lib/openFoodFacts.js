// Open Food Facts is free and keyless, so it can be called directly from the
// browser. FatSecret/Nutritionix both require a server-side secret and would
// need a proxy (e.g. a Netlify function) to call safely — not wired up here.
const OFF_FIELDS = 'product_name,brands,serving_size,serving_quantity,nutriments'
const OFF_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'

function round1(n) {
  return Math.round(n * 10) / 10
}

function normalizeProduct(product, barcode) {
  const n = product.nutriments || {}
  const per100 = {
    calories: Math.round(n['energy-kcal_100g'] ?? 0),
    protein: round1(n.proteins_100g ?? 0),
    carbs: round1(n.carbohydrates_100g ?? 0),
    fat: round1(n.fat_100g ?? 0),
    fiber: round1(n.fiber_100g ?? 0),
    sugar: round1(n.sugars_100g ?? 0),
    sodium: Math.round((n.sodium_100g ?? 0) * 1000),
  }
  const defaultGrams = product.serving_quantity ? Math.round(product.serving_quantity) : 100
  const name = product.product_name?.trim() || product.brands?.trim() || 'Unknown product'
  return { barcode, name, per100, defaultGrams, servingLabel: product.serving_size || null }
}

export async function fetchProductByBarcode(barcode) {
  const url = `${OFF_ENDPOINT}/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 1 || !data.product) return null
  return normalizeProduct(data.product, barcode)
}
