/**
 * Money-safe formatters.
 *
 * The catalog is a generated artifact — if a future regeneration ever ships a
 * product with a missing/invalid price, pages must degrade to a clean
 * "Price unavailable" label instead of crashing the React tree with
 * `Cannot read properties of undefined (reading 'toLocaleString')`.
 */

/** True only for a usable price: finite, positive number. */
export const isMoney = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0

/**
 * Formats a price in Indian locale with the ₹ symbol.
 * Never throws: any non-finite/missing value renders the fallback label.
 */
export const formatPrice = (v: unknown): string =>
  isMoney(v) ? `₹${v.toLocaleString('en-IN')}` : 'Price unavailable'

/**
 * Discount percentage for a badge — only when BOTH values are real money and
 * the original is genuinely higher. Returns null for missing/unverified data
 * so no fake MRP/discount badge is ever rendered.
 */
export const discountPct = (price: unknown, originalPrice: unknown): number | null => {
  if (!isMoney(price) || !isMoney(originalPrice) || originalPrice <= price) return null
  const pct = Math.round((1 - price / originalPrice) * 100)
  return pct > 0 && pct < 100 ? pct : null
}

/** Sums only valid prices; safe for look/board totals that mix catalog items. */
export const sumPrices = (values: readonly unknown[]): number =>
  values.reduce<number>((s, v) => s + (isMoney(v) ? v : 0), 0)
