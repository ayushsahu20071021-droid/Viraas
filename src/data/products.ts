// ─────────────────────────────────────────────────────────────────────────────
// VIRAAS product core — backed by the generated catalog (scripts/generate-catalog.mjs).
// Every catalog entry carries structured metadata and a production raster
// primary image. Original SVG plates remain on disk as preserved fallbacks,
// but are never used as the primary product visual.
// Prices/status are editorial scaffolding marked CHECK until manually verified
// against the retailer — never presented as live data.
// ─────────────────────────────────────────────────────────────────────────────
import catalog from './catalog/products.json'
import { searchIntent, textMatches } from '../utils/search-intent'

export type Gender = 'women' | 'men' | 'couple'

export interface Product {
  id: string
  title: string
  gender: Gender
  category: string
  subCategory: string
  price: number
  originalPrice: number | null
  brand: string
  ageGroup: number[]
  colour: string
  secondaryColour?: string
  fabric: string
  embroidery?: string
  pattern?: string
  weave?: string
  silhouette: string
  occasions: string[]
  styleTags: string[]
  description: string
  imageUrl: string
  gallery?: string[]
  sizes: string[]
  inHouseTryOn: boolean
  affiliateUrl?: string
  merchantUrl: string
  merchantLabel: string
  status: 'LIVE' | 'CHECK' | 'DRAFT'
  lastChecked?: string | null
  notes?: string
  priceBasis?: string
  priceEvidenceId?: string | null
  visualStatus?: string
  imagePrompt?: string
  herProductId?: string
  hisProductId?: string
}

export const products: Product[] = catalog as unknown as Product[]

const byId = new Map(products.map((p) => [p.id, p]))
export const getProductById = (id: string): Product | undefined => byId.get(id)

export const APPAREL_CATEGORIES = ['sarees', 'pre-draped-saree', 'chaniya-choli', 'lehenga', 'sharara', 'gharara', 'anarkali', 'kurta-sets', 'traditional-kurta', 'festive-kurta-set', 'printed-ethnic-shirt', 'embroidered-ethnic-shirt', 'traditional-festive-set', 'garba-navratri-traditional']
export const isApparel = (p: Product) => APPAREL_CATEGORIES.includes(p.category)
export const isCouple = (p: Product) => p.category === 'couple-edit'

export const getProductsByGender = (gender: Gender | 'accessories'): Product[] =>
  gender === 'accessories'
    ? products.filter((p) => ['jewellery', 'bags', 'footwear', 'watches', 'accessories', 'beauty'].includes(p.category) && !isCouple(p))
    : products.filter((p) => p.gender === gender && !isCouple(p))

export const getProductsByCategory = (gender: Gender | 'accessories', category: string): Product[] =>
  getProductsByGender(gender).filter((p) => p.category === category)

export const getProductsByOccasion = (occasionTag: string): Product[] =>
  products.filter((p) => p.occasions.includes(occasionTag) && !isCouple(p))

// ── taxonomy for the storefront ───────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
 'chaniya-choli': 'Chaniya Choli', lehenga: 'Lehenga', sharara: 'Sharara', gharara: 'Gharara', sarees: 'Saree', 'pre-draped-saree': 'Pre-Draped Saree', anarkali: 'Anarkali', 'kurta-sets': 'Kurta Set', jewellery: 'Jewellery', bags: 'Bags', footwear: 'Footwear', beauty: 'Beauty', 'traditional-kurta': 'Traditional Kurta', 'festive-kurta-set': 'Festive Kurta Set', 'printed-ethnic-shirt': 'Printed Ethnic Shirt', 'embroidered-ethnic-shirt': 'Embroidered Ethnic Shirt', 'traditional-festive-set': 'Traditional Festive Set', 'garba-navratri-traditional': 'Garba/Navratri Traditional', accessories: 'Accessories',
}

/** Categories that actually carry results for a gender — no dead chips. */
export function categoriesForGender(gender: Gender | 'accessories'): { key: string; label: string; count: number }[] {
  const pool = getProductsByGender(gender)
  const counts = new Map<string, number>()
  for (const p of pool) counts.set(p.category, (counts.get(p.category) || 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => Object.keys(CATEGORY_LABELS).indexOf(a[0]) - Object.keys(CATEGORY_LABELS).indexOf(b[0]))
    .map(([key, count]) => ({ key, label: CATEGORY_LABELS[key] || key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), count }))
}

export const OCCASION_TAGS = ['Garba', 'Navratri', 'Diwali', 'Festive Party', 'College Fest'] as const
export type OccasionTag = (typeof OCCASION_TAGS)[number]

/** Budget tiles/rail keys — labels are exact product-side copy. */
export const BUDGET_RANGES = [
  { key: 'Under ₹499', label: 'Under ₹499', min: 0, max: 499 },
  { key: 'Under ₹799', label: 'Under ₹799', min: 0, max: 799 },
  { key: 'Under ₹999', label: 'Under ₹999', min: 0, max: 999 },
  { key: 'Under ₹1,499', label: 'Under ₹1,499', min: 0, max: 1499 },
  { key: 'Under ₹1,999', label: 'Under ₹1,999', min: 0, max: 1999 },
  { key: '₹1,999–₹2,999', label: '₹1,999 – ₹2,999', min: 1999, max: 2999 },
  { key: '₹2,999–₹4,999', label: '₹2,999 – ₹4,999', min: 2999, max: 4999 },
  { key: '₹5,000+', label: '₹5,000+', min: 5000, max: Number.POSITIVE_INFINITY },
] as const
export type BudgetKey = (typeof BUDGET_RANGES)[number]['key']

export const budgetOf = (price: number): BudgetKey | undefined =>
  BUDGET_RANGES.map((r) => ({ ...r, max: r.max })).find((r) => price >= r.min && price <= r.max)?.key
/** Cheapest matching tile label, for cards/rails. */
export function budgetTile(price: number): BudgetKey | undefined {
  const inRange = BUDGET_RANGES.filter((r) => price >= r.min && price <= r.max)
  if (!inRange.length) return undefined
  const under = inRange.filter((r) => r.key.startsWith('Under')).sort((a, b) => a.max - b.max)
  return (under[0] || inRange[inRange.length - 1]).key as BudgetKey
}

// ── filter engine (result-aware facets) ───────────────────────────────────────
export interface FilterParams {
  scope?: Gender | 'accessories'
  gender?: Gender
  category?: string
  occasion?: string            // occasion tag from the five public worlds
  occasionId?: string           // occasion page id — mapped to tag
  colour?: string
  budget?: BudgetKey
  style?: string
  craft?: string
  age?: number
  tryOn?: boolean
  curated?: boolean
  newArrivals?: boolean
  premium?: boolean
  query?: string
  sort?: 'recommended' | 'price-asc' | 'price-desc' | 'newest'
}

export const AGE_BUCKETS = ['16-18', '19-24', '25-30', '31+'] as const
export const ageBucketOf = (n: number) => (n <= 18 ? '16-18' : n <= 24 ? '19-24' : n <= 30 ? '25-30' : '31+')

export interface FacetGroup {
  key: 'category' | 'occasion' | 'colour' | 'budget' | 'style' | 'craft' | 'age'
  label: string
  options: { value: string; label: string; count: number }[]
}

function matchesQuery(p: Product, q?: string): boolean {
  if (!q?.trim()) return true
  const intent = searchIntent(q)
  if (intent.couple || (intent.gender && p.gender !== intent.gender)) return false
  if (intent.occasion && !p.occasions.includes(intent.occasion)) return false
  if (intent.budget !== undefined && p.price > intent.budget) return false
  return textMatches(`${p.title} ${p.brand} ${p.category} ${p.subCategory} ${p.colour} ${p.fabric} ${p.embroidery || ''} ${p.pattern || ''} ${p.weave || ''} ${p.occasions.join(' ')} ${p.styleTags.join(' ')} ${p.silhouette}`, intent.tokens)
}

function matches(p: Product, f: FilterParams, curatedIds?: ReadonlySet<string>, skip?: FilterParams['scope'] | string): boolean {
  const s = (k: string) => !skip || skip !== k
  if (isCouple(p)) return false
  if (s('scope') && f.scope) {
    if (f.scope === 'accessories') {
      if (!['jewellery', 'bags', 'footwear', 'watches', 'accessories', 'beauty'].includes(p.category)) return false
    } else if (f.scope === 'women' || f.scope === 'men') {
      if (p.gender !== f.scope) return false
      if (f.scope === 'men' && f.category === undefined && p.category === 'beauty') return false
    }
  }
  if (s('gender') && f.gender && p.gender !== f.gender) return false
  if (s('category') && f.category && p.category !== f.category) return false
  const occTag = f.occasion || OCCASION_TAG_BY_ID[f.occasionId || '']
  if (s('occasion') && occTag && !p.occasions.includes(occTag)) return false
  if (s('colour') && f.colour && p.colour !== f.colour) return false
  if (s('budget') && f.budget) {
    const r = BUDGET_RANGES.find((x) => x.key === f.budget)
    if (!r || p.price < r.min || p.price > r.max) return false
  }
  if (s('style') && f.style && !p.styleTags.includes(f.style)) return false
  if (s('craft') && f.craft) {
    const craft = p.embroidery || p.pattern || p.weave
    if (craft !== f.craft) return false
  }
  if (s('age') && f.age !== undefined && !p.ageGroup.some((a) => ageBucketOf(a) === ageBucketOf(f.age!))) return false
  if (s('tryOn') && f.tryOn && !p.inHouseTryOn) return false
  if (s('curated') && f.curated && curatedIds && !curatedIds.has(p.id)) return false
  if (s('newArrivals') && f.newArrivals && !p.styleTags.includes('New In')) return false
  if (s('premium') && f.premium && p.price < 5000) return false
  if (s('query') && !matchesQuery(p, f.query)) return false
  return true
}

/** Every product field VIRAAS knows for the craft chips. */
export function allCrafts(): string[] {
  const set = new Set<string>()
  for (const p of products) { const c = p.embroidery || p.pattern || p.weave; if (c) set.add(c) }
  return [...set].sort()
}
export function allStyles(scope?: Gender | 'accessories'): string[] {
  const pool = scope ? getProductsByGender(scope) : products
  const set = new Set<string>()
  for (const p of pool) for (const t of p.styleTags) set.add(t)
  return [...set].sort()
}
export function allColours(scope?: Gender | 'accessories'): string[] {
  const pool = scope ? getProductsByGender(scope) : products
  const counts = new Map<string, number>()
  for (const p of pool) counts.set(p.colour, (counts.get(p.colour) || 0) + 1)
  return [...counts.entries()].filter(([, n]) => n >= 3).map(([c]) => c).sort()
}

export function filterProducts(
  f: FilterParams,
  opts: { curatedIds?: ReadonlySet<string>; facetThreshold?: number; page?: number; pageSize?: number } = {},
): { items: Product[]; total: number; facets: FacetGroup[]; pages: number } {
  const pool = products.filter((p) => matches(p, f, opts.curatedIds))
  const groups: { key: FacetGroup['key']; label: string; valueOf: (p: Product) => string[] }[] = [
    { key: 'category', label: 'Category', valueOf: (p) => [p.category] },
    { key: 'occasion', label: 'Occasion', valueOf: (p) => p.occasions },
    { key: 'budget', label: 'Budget', valueOf: (p) => BUDGET_RANGES.filter(r => p.price >= r.min && p.price <= r.max).map(r => r.key) },
    { key: 'style', label: 'Style', valueOf: (p) => p.styleTags },
    { key: 'craft', label: 'Craft', valueOf: (p) => [p.embroidery || p.pattern || p.weave].filter(Boolean) as string[] },
    { key: 'age', label: 'Age', valueOf: (p) => [...new Set(p.ageGroup.map((a) => ageBucketOf(a)))] },
  ]
  if (f.scope !== 'accessories') groups.splice(2, 0, { key: 'colour', label: 'Colour', valueOf: (p) => [p.colour] })
  const facets: FacetGroup[] = groups.map((g) => {
    // result-aware: counts computed with *this* group's own selection ignored
    const cleared: FilterParams = { ...f }
    delete (cleared as Record<string, unknown>)[g.key === 'craft' ? 'craft' : g.key]
    const base = products.filter((p) => matches(p, cleared, opts.curatedIds, g.key))
    const counts = new Map<string, number>()
    for (const p of base) for (const v of g.valueOf(p)) counts.set(v, (counts.get(v) || 0) + 1)
    const threshold = opts.facetThreshold ?? 1
    const options = [...counts.entries()]
      .filter(([v, n]) => n >= threshold || v === (f as Record<string, unknown>)[g.key])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, g.key === 'budget' ? 8 : 12)
      .map(([value, count]) => ({ value, label: g.key === 'category' ? CATEGORY_LABELS[value] || value : value, count }))
    return { key: g.key, label: g.label, options }
  }).filter((g) => g.options.length > 1)

  const occasionPriority = (p: Product) => Math.min(...p.occasions.map(o => ['Garba','Navratri','College Fest','Diwali','Festive Party'].indexOf(o)));
  const sort = f.sort || 'recommended'
  pool.sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price :
    sort === 'price-desc' ? b.price - a.price :
    sort === 'newest' ? (b.styleTags.includes('New In') ? 1 : 0) - (a.styleTags.includes('New In') ? 1 : 0) || b.price - a.price :
    Number(!isApparel(a)) - Number(!isApparel(b)) || occasionPriority(a) - occasionPriority(b) || a.id.localeCompare(b.id),
  )
  const pageSize = Math.max(1, opts.pageSize ?? pool.length)
  const pages = Math.max(1, Math.ceil(pool.length / pageSize))
  const page = Math.min(Math.max(1, opts.page ?? 1), pages)
  return { items: pool.slice((page - 1) * pageSize, page * pageSize), total: pool.length, facets, pages }
}

// ── occasion page ids ↔ product tags ─────────────────────────────────────────
export const OCCASION_TAG_BY_ID: Record<string, string> = {
  garba: 'Garba',
  navratri: 'Navratri',
  diwali: 'Diwali',
  'festive-party': 'Festive Party',
  'college-fest': 'College Fest',
}

// ── search across products, looks & couple edits ─────────────────────────────
export function searchProducts(q: string, limit = 60): Product[] {
  if (!q.trim()) return []
  const intent = searchIntent(q)
  return products.filter(p => !isCouple(p) && matchesQuery(p, q))
    .sort((a,b) => Number(textMatches(b.title,intent.tokens)) - Number(textMatches(a.title,intent.tokens)))
    .slice(0,limit)
}

// ── Complete-the-Look: tag-based pairing ─────────────────────────────────────
const NEED_BY_CATEGORY: Record<string, string[]> = {
  sarees: ['footwear', 'jewellery', 'bags', 'beauty'],
  'pre-draped-saree': ['footwear', 'jewellery', 'bags'],
  'chaniya-choli': ['jewellery', 'footwear', 'bags'],
  lehenga: ['jewellery', 'footwear', 'bags'],
  sharara: ['footwear', 'jewellery'], gharara: ['footwear', 'jewellery'],
  anarkali: ['footwear', 'jewellery'], 'kurta-sets': ['footwear', 'jewellery', 'bags'],
  'traditional-kurta': ['footwear', 'accessories'], 'festive-kurta-set': ['footwear', 'accessories'],
  'printed-ethnic-shirt': ['footwear', 'accessories'], 'embroidered-ethnic-shirt': ['footwear', 'accessories'],
  'traditional-festive-set': ['footwear', 'accessories'], 'garba-navratri-traditional': ['footwear', 'accessories'],
  jewellery: ['footwear', 'bags'], bags: ['footwear', 'jewellery'],
  footwear: ['jewellery', 'bags'], accessories: ['footwear'], beauty: ['jewellery', 'footwear'],
}
export function completeTheLook(anchor: Product, limit = 4): Product[] {
  const wanted = NEED_BY_CATEGORY[anchor.category] || ['footwear', 'jewellery']
  const out: Product[] = []
  const share = (p: Product) =>
    (p.colour === anchor.colour || p.colour === anchor.secondaryColour || p.secondaryColour === anchor.colour ? 3 : 0) +
    p.occasions.filter((o) => anchor.occasions.includes(o)).length * 2 +
    p.styleTags.filter((t) => anchor.styleTags.includes(t)).length
  for (const cat of wanted) {
    const pool = products.filter((p) => p.category === cat && (p.gender === anchor.gender || p.category === 'beauty') && !isCouple(p))
    if (!pool.length) continue
    const best = pool.sort((a, b) => share(b) - share(a))[0]
    if (best && out.length < limit && !out.some((o) => o.id === best.id)) out.push(best)
  }
  return out
}

/** Trending = editorial-style pools (no fake popularity metrics). */
export const TRENDING_STYLE_TAGS = ['Festive', 'Traditional', 'Printed', 'Statement']
