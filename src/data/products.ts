// ─────────────────────────────────────────────────────────────────────────────
// VIRAAS product core — backed by the generated catalog (scripts/generate-catalog.mjs).
// Every apparel/beauty/accessory entry carries its own metadata and its own
// original SVG plate; nothing here reuses hero photography as product art.
// Prices/status are editorial scaffolding marked CHECK until manually verified
// against the retailer — never presented as live data.
// ─────────────────────────────────────────────────────────────────────────────
import catalog from './catalog/products.json'

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
  lastChecked?: string
  notes?: string
  imagePrompt?: string
  herProductId?: string
  hisProductId?: string
}

export const products: Product[] = catalog as unknown as Product[]

const byId = new Map(products.map((p) => [p.id, p]))
export const getProductById = (id: string): Product | undefined => byId.get(id)

export const APPAREL_CATEGORIES = ['sarees', 'kurta-sets', 'co-ord-sets', 'lehenga', 'garba', 'jackets', 'indowestern']
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
  sarees: 'Sarees', 'kurta-sets': 'Kurta & Anarkali Sets', 'co-ord-sets': 'Co-ord Sets',
  lehenga: 'Lehenga & Chaniya', garba: 'Garba & Navratri', jackets: 'Jackets & Bandhgala',
  indowestern: 'Indo-Western & Fusion', jewellery: 'Jewellery', bags: 'Bags & Clutches',
  footwear: 'Footwear', watches: 'Watches', accessories: 'Grooming & Carry',
  beauty: 'Beauty', 'couple-edit': 'Couple Sets', formals: 'Wedding Formals',
}

/** Categories that actually carry results for a gender — no dead chips. */
export function categoriesForGender(gender: Gender | 'accessories'): { key: string; label: string; count: number }[] {
  const pool = getProductsByGender(gender)
  const counts = new Map<string, number>()
  for (const p of pool) counts.set(p.category, (counts.get(p.category) || 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, label: CATEGORY_LABELS[key] || key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), count }))
}

export const OCCASION_TAGS = [
  'Wedding', 'Sangeet', 'Reception', 'Mehendi', 'Festive Party', 'Diwali Party', 'Navratri',
  'College Fest', 'Work-to-Dinner', 'Night Out', 'Destination Wedding', 'Daywear', 'Puja & Temple',
  'Engagement', 'Wedding Guest', 'Family Function', 'Date Night', 'Winter Festive',
] as const
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
  occasion?: string            // occasion tag, e.g. 'Sangeet'
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

const STOP_WORDS = new Set(['outfit', 'outfits', 'wear', 'look', 'looks', 'clothes', 'dress', 'set', 'sets']);
const tokens = (q: string) =>
  q
    .toLowerCase()
    .split(/[^a-z0-9₹&]+/i)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

// ── search language ───────────────────────────────────────────────────────────
// Query words never appear verbatim in product metadata ("green kurta" vs
// "Emerald Chikankari Kurta Set"). Every token expands through a synonym family
// so plain-English queries land on the right shelf.
const SEARCH_SYNONYMS: Record<string, string[]> = {
  festive: ['festive', 'diwali', 'navratri', 'sangeet', 'party', 'celebration'],
  garba: ['garba', 'navratri', 'dandiya', 'raas', 'kediyu', 'chaniya'],
  navratri: ['navratri', 'garba', 'dandiya'],
  diwali: ['diwali', 'deepavali'],
  wedding: ['wedding', 'shaadi', 'vivah'],
  shaadi: ['shaadi', 'wedding'],
  jhumka: ['jhumka', 'jhumki', 'earring', 'earrings'],
  jhumki: ['jhumka', 'jhumki', 'earring', 'earrings'],
  earring: ['earring', 'jhumka', 'jhumki'],
  earrings: ['earring', 'jhumka', 'jhumki'],
  kurta: ['kurta', 'kurti', 'kurtaset', 'anarkali'],
  kurti: ['kurti', 'kurta'],
  jacket: ['jacket', 'bandhgala', 'nehru', 'shrug', 'layer'],
  bandhgala: ['bandhgala', 'jacket', 'blazer'],
  nehru: ['nehru', 'jacket'],
  blazer: ['blazer', 'jacket', 'suit'],
  suit: ['suit', 'blazer', 'tuxedo', 'formals'],
  tuxedo: ['tuxedo', 'suit', 'formals'],
  formals: ['formals', 'suit', 'blazer', 'tuxedo'],
  draped: ['draped', 'drape', 'pre-draped', 'predraped', 'pre-stitched'],
  predraped: ['pre-draped', 'predraped', 'draped', 'drape'],
  saree: ['saree', 'sari'],
  sari: ['saree', 'sari'],
  lehenga: ['lehenga', 'chaniya', 'ghagra'],
  chikankari: ['chikankari', 'chikan'],
  chikan: ['chikan', 'chikankari'],
  bandhani: ['bandhani', 'bandhej'],
  banarasi: ['banarasi', 'benarasi'],
  green: ['green', 'emerald', 'jade', 'sage', 'olive', 'bottle', 'forest', 'mint', 'parrot'],
  emerald: ['emerald', 'green'],
  black: ['black', 'onyx', 'charcoal'],
  white: ['white', 'ivory', 'cream'],
  ivory: ['ivory', 'cream', 'off-white', 'oat'],
  cream: ['cream', 'ivory', 'oat'],
  blue: ['blue', 'navy', 'royal', 'powder', 'cobalt', 'ice', 'turquoise', 'teal', 'peacock'],
  navy: ['navy', 'blue'],
  red: ['red', 'maroon', 'wine', 'rani', 'burgundy', 'scarlet'],
  maroon: ['maroon', 'wine', 'red'],
  wine: ['wine', 'maroon', 'burgundy'],
  pink: ['pink', 'blush', 'rose', 'rani', 'fuchsia'],
  yellow: ['yellow', 'mustard', 'marigold', 'butter', 'haldi', 'sunflower', 'amber'],
  gold: ['gold', 'champagne', 'antique', 'zari', 'tissue'],
  silver: ['silver', 'oxidised', 'steel'],
  purple: ['purple', 'plum', 'lilac', 'lavender', 'aubergine'],
  orange: ['orange', 'rust', 'terracotta', 'tangerine', 'copper'],
  brown: ['brown', 'chocolate', 'coffee', 'bronze', 'tan'],
  ethnic: ['ethnic', 'traditional', 'desi'],
  traditional: ['traditional', 'ethnic', 'heirloom', 'classic'],
  modern: ['modern', 'contemporary', 'indo-western', 'fusion'],
  indo: ['indo-western', 'fusion'],
  western: ['indo-western', 'fusion'],
  fusion: ['fusion', 'indo-western'],
  couple: ['couple', 'pair', 'duo', 'her+him'],
  couples: ['couple', 'pair', 'duo', 'her+him'],
  pair: ['pair', 'couple', 'duo'],
  guest: ['guest'],
  winter: ['winter', 'velvet', 'pashmina', 'shawl'],
  summer: ['summer', 'linen', 'cotton'],
  budget: ['budget'],
  office: ['office', 'work'],
  work: ['work', 'office'],
  college: ['college', 'campus', 'fest'],
  party: ['party', 'night'],
  perfume: ['perfume', 'fragrance', 'attar', 'itr', 'mist'],
  fragrance: ['fragrance', 'perfume', 'attar'],
  watch: ['watch', 'watches'],
  watches: ['watch', 'watches'],
  mojari: ['mojari', 'jutti'],
  jutti: ['jutti', 'mojari'],
  potli: ['potli', 'bag'],
  clutch: ['clutch', 'bag'],
  dupatta: ['dupatta', 'odhani', 'stole', 'drape'],
  stole: ['stole', 'dupatta', 'scarf'],
  sharara: ['sharara', 'garara'],
  anarkali: ['anarkali'],
  organza: ['organza'],
  silk: ['silk'],
  cotton: ['cotton'],
  men: ['men'],
  mens: ['men'],
  man: ['men'],
  him: ['men'],
  he: ['men'],
  male: ['men'],
  boys: ['men'],
  women: ['women'],
  womens: ['women'],
  woman: ['women'],
  her: ['women'],
  she: ['women'],
  female: ['women'],
  girls: ['women'],
}

/** gender-word tokens resolve to a product gender instead of a text match */
const GENDER_WORDS: Record<string, 'men' | 'women'> = {
  men: 'men', mens: 'men', man: 'men', him: 'men', male: 'men', boys: 'men', he: 'men',
  women: 'women', womens: 'women', woman: 'women', her: 'women', female: 'women', girls: 'women', she: 'women',
}

/** colour tokens must rank products whose actual COLOUR field matches highest */
const COLOUR_WORDS = new Set([
  'green', 'emerald', 'jade', 'sage', 'olive', 'mint', 'black', 'white', 'ivory', 'cream',
  'blue', 'navy', 'teal', 'red', 'maroon', 'wine', 'burgundy', 'pink', 'blush', 'rose',
  'yellow', 'mustard', 'marigold', 'gold', 'silver', 'purple', 'plum', 'lilac', 'lavender',
  'orange', 'rust', 'terracotta', 'copper', 'brown', 'chocolate', 'peach', 'coral', 'grey', 'charcoal',
])

/** shelf weight — apparel outranks accessories, beauty stays out of generic results */
const SHELF_WEIGHT: Record<string, number> = {
  sarees: 6, 'kurta-sets': 6, lehenga: 6, garba: 6, jackets: 6, indowestern: 6, 'co-ord-sets': 6, formals: 6,
  'couple-edit': 4, jewellery: 3, bags: 3, footwear: 3, watches: 3, accessories: 3, beauty: 0,
}

const searchHay = (p: Product) =>
  `${p.title} ${p.brand} ${p.category} ${p.subCategory} ${p.colour} ${p.secondaryColour || ''} ${p.fabric} ${p.embroidery || ''} ${p.pattern || ''} ${p.weave || ''} ${p.silhouette} ${p.occasions.join(' ')} ${p.styleTags.join(' ')} ${p.gender === 'men' ? 'men him his' : p.gender === 'women' ? 'women her hers' : 'couple her+him pair duo'} ${p.category === 'couple-edit' ? 'couple pair duo her+him' : ''}`.toLowerCase()

/** a token is satisfied when it, a synonym family member, or its gender word appears */
function tokenHits(token: string, hay: string, p: Product): boolean {
  if (hay.includes(token)) return true
  const syn = SEARCH_SYNONYMS[token]
  if (syn && syn.some((s) => hay.includes(s))) return true
  const g = GENDER_WORDS[token]
  if (g && p.gender === g) return true
  return false
}

function matchesQuery(p: Product, q?: string): boolean {
  if (!q || !q.trim()) return true
  const hay = searchHay(p)
  return tokens(q).every((t) => tokenHits(t, hay, p))
}

/** Synonym-aware query matcher for non-product search surfaces (looks, couple edits). */
export function textMatchesQuery(text: string, q: string): boolean {
  const toks = tokens(q)
  if (!toks.length) return true
  const hay = text.toLowerCase()
  return toks.every((t) => hay.includes(t) || (SEARCH_SYNONYMS[t]?.some((s) => hay.includes(s)) ?? false))
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
    { key: 'budget', label: 'Budget', valueOf: (p) => (budgetTile(p.price) ? [budgetTile(p.price)!] : []) },
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
    const threshold = opts.facetThreshold ?? (g.key === 'occasion' ? 6 : g.key === 'craft' ? 4 : 3)
    const options = [...counts.entries()]
      .filter(([v, n]) => n >= threshold || v === (f as Record<string, unknown>)[g.key])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, g.key === 'budget' ? 8 : 12)
      .map(([value, count]) => ({ value, label: g.key === 'category' ? CATEGORY_LABELS[value] || value : value, count }))
    return { key: g.key, label: g.label, options }
  }).filter((g) => g.options.length > 1)

  const sort = f.sort || 'recommended'
  pool.sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price :
    sort === 'price-desc' ? b.price - a.price :
    sort === 'newest' ? (b.styleTags.includes('New In') ? 1 : 0) - (a.styleTags.includes('New In') ? 1 : 0) || b.price - a.price :
    (b.styleTags.length - a.styleTags.length) || (b.occasions.length - a.occasions.length) || b.price - a.price,
  )
  // Silhouette-diversity presentation (visual-mix directive): the default
  // "recommended" view interleaves categories round-robin so no first page
  // reads as a wall of one garment type. Filters/sorting still order normally
  // within their pools; search ranking is untouched.
  if (sort === 'recommended' && pool.length > 6) {
    const byCat = new Map<string, Product[]>()
    for (const p of pool) {
      const arr = byCat.get(p.category)
      if (arr) arr.push(p)
      else byCat.set(p.category, [p])
    }
    if (byCat.size > 1) {
      const cats = [...byCat.values()].sort((a, b) => b.length - a.length)
      const mixed: Product[] = []
      let added = true
      while (added) {
        added = false
        for (const c of cats) {
          const next = c.shift()
          if (next) { mixed.push(next); added = true }
        }
      }
      pool.length = 0
      pool.push(...mixed)
    }
  }
  const pageSize = opts.pageSize ?? pool.length
  const pages = Math.max(1, Math.ceil(pool.length / pageSize))
  const page = Math.min(Math.max(1, opts.page ?? 1), pages)
  return { items: pool.slice((page - 1) * pageSize, page * pageSize), total: pool.length, facets, pages }
}

// ── occasion page ids ↔ product tags ─────────────────────────────────────────
export const OCCASION_TAG_BY_ID: Record<string, string> = {
  wedding: 'Wedding', sangeet: 'Sangeet', reception: 'Reception', mehendi: 'Mehendi',
  haldi: 'Haldi', garba: 'Garba',
  'festive-party': 'Festive Party', diwali: 'Diwali Party', navratri: 'Navratri',
  'college-fest': 'College Fest', workwear: 'Work-to-Dinner', 'night-out': 'Night Out',
  'destination-wedding': 'Destination Wedding', daywear: 'Daywear', puja: 'Puja & Temple',
  engagement: 'Engagement', 'wedding-guest': 'Wedding Guest', 'family-function': 'Family Function',
  'date-night': 'Date Night', winter: 'Winter Festive',
}

// ── search across products, looks & couple edits ─────────────────────────────
export function searchProducts(q: string, limit = 60): Product[] {
  if (!q.trim()) return []
  const toks = tokens(q)
  if (!toks.length) return []
  const wantsCouple = toks.some((t) => ['couple', 'couples', 'pair', 'duo'].includes(t))
  const scored = products
    .filter((p) => (isCouple(p) ? wantsCouple : true))
    .map((p) => {
      const title = p.title.toLowerCase(), brand = p.brand.toLowerCase(), cat = `${p.category} ${p.subCategory}`.toLowerCase()
      const hay = `${searchHay(p)} ${p.description.toLowerCase()}`
      const colourField = `${p.colour} ${p.secondaryColour || ''}`.toLowerCase()
      let score = SHELF_WEIGHT[p.category] ?? 1
      let satisfied = 0
      for (const t of toks) {
        const isColour = COLOUR_WORDS.has(t)
        const inColourField = colourField.includes(t) || (SEARCH_SYNONYMS[t]?.some((s) => colourField.includes(s)) ?? false)
        const inTitle = title.includes(t) || (SEARCH_SYNONYMS[t]?.some((s) => title.includes(s)) ?? false)
        // A colour token is only satisfied by the product's actual colour or its
        // title — a stray "black" in the description no longer counts.
        const direct = isColour ? (inColourField || inTitle) : hay.includes(t)
        const viaSyn = !direct && !isColour && tokenHits(t, hay, p)
        if (direct || viaSyn) satisfied++
        if (inTitle) score += 6
        if (brand === t) score += 4
        if (cat.includes(t)) score += 3
        if (isColour && inColourField) score += 8
        if (hay.includes(t)) score += 2
        else if (viaSyn) score += 1
        const g = GENDER_WORDS[t]
        if (g && p.gender === g) score += 3
        if (isCouple(p) && wantsCouple) score += 2
      }
      return { p, score, hit: satisfied === toks.length }
    })
    .filter((x) => x.hit)
    .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id))
    .slice(0, limit)
  return scored.map((s) => s.p)
}

// ── Complete-the-Look: tag-based pairing ─────────────────────────────────────
const NEED_BY_CATEGORY: Record<string, string[]> = {
  sarees: ['footwear', 'jewellery', 'bags', 'beauty'],
  'kurta-sets': ['footwear', 'jewellery', 'bags', 'watches'],
  'co-ord-sets': ['footwear', 'jewellery', 'bags'],
  lehenga: ['jewellery', 'footwear', 'bags'],
  garba: ['footwear', 'jewellery'],
  jackets: ['footwear', 'watches', 'accessories'],
  indowestern: ['footwear', 'bags', 'watches', 'jewellery'],
  formals: ['footwear', 'watches', 'accessories'],
  jewellery: ['footwear', 'bags'],
  bags: ['footwear', 'jewellery'],
  footwear: ['jewellery', 'bags'],
  watches: ['footwear', 'accessories'],
  accessories: ['footwear', 'watches'],
  beauty: ['jewellery', 'footwear'],
  'couple-edit': [],
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
export const TRENDING_STYLE_TAGS = ['Pinterest Inspired', 'Statement', 'Modern Luxury', 'Handloom & Artisan', 'Indo-Western', 'New In']
