// Curated looks + couple-edit looks, backed by the generated catalog.
import { searchIntent, textMatches } from '../utils/search-intent'
import looksJson from './catalog/looks.json'
import couplesJson from './catalog/couples.json'
import { getProductById, isApparel, type Product } from './products'

export interface Look {
  id: string
  title: string
  mood: string
  occasions: string[]
  productIds: string[]
  imageUrl: string
  altImages?: string[]
  price: number
  description: string
  merchantUrls: string[]
  merchantLabels: string[]
  budgetTier?: string
  gender: 'women' | 'men' | 'couple'
  coupleId?: string
  herProductIds?: string[]
  hisProductIds?: string[]
}

type RawLook = Omit<Look, 'gender' | 'herProductIds' | 'hisProductIds' | 'coupleId' | 'altImages'> & { altImages?: string[] }

export const looks: Look[] = (looksJson as unknown as RawLook[]).map((l) => {
  const first = getProductById(l.productIds[0])
  return { ...l, gender: first?.gender === 'men' ? 'men' : 'women' }
})

export const coupleLooks: Look[] = (couplesJson as unknown as { id: string; title: string; mood: string; occasions: string[]; herProductIds: string[]; hisProductIds: string[]; price: number; description: string; imageUrl: string; coupleId: string }[]).map((c) => ({
  id: c.id,
  title: c.title,
  mood: c.mood,
  occasions: c.occasions,
  productIds: [...c.herProductIds, ...c.hisProductIds],
  imageUrl: c.imageUrl,
  price: [...c.herProductIds, ...c.hisProductIds].reduce((sum, id) => sum + (getProductById(id)?.price || 0), 0),
  description: c.description,
  merchantUrls: [...new Set([...c.herProductIds, ...c.hisProductIds].map((id: string) => getProductById(id)?.merchantUrl).filter(Boolean))] as string[],
  merchantLabels: [...new Set([...c.herProductIds, ...c.hisProductIds].map(id => getProductById(id)?.merchantLabel).filter(Boolean))] as string[],
  gender: 'couple' as const,
  coupleId: c.coupleId,
  herProductIds: c.herProductIds,
  hisProductIds: c.hisProductIds,
}))

export const allLooks: Look[] = [...looks, ...coupleLooks]

export const getLookById = (id: string): Look | undefined => allLooks.find((l) => l.id === id)

export const getLooksForProduct = (productId: string): Look[] => allLooks.filter((l) => l.productIds.includes(productId))

export const looksForOccasion = (occasion: string, gender?: 'women' | 'men' | 'couple'): Look[] =>
  allLooks.filter((l) => l.occasions.includes(occasion) && (!gender || l.gender === gender))

export const looksForBudget = (maxPrice: number, gender?: 'women' | 'men'): Look[] =>
  allLooks.filter((l) => l.price <= maxPrice && (!gender || l.gender === gender))

/** ids of every product that appears in at least one curated look — powers the
 *  "Curated" filter chip so shoppers can jump from a look straight to a filter. */
export const curatedProductIds: ReadonlySet<string> = new Set(allLooks.flatMap((l) => l.productIds))

export const lookItems = (look: Look): Product[] => look.productIds.map((id) => getProductById(id)).filter(Boolean) as Product[]
export const lookAnchors = (look: Look): Product[] => lookItems(look).filter(isApparel)

export function searchLooks(query: string, limit = 100): Look[] {
 const intent=searchIntent(query)
 return allLooks.filter(l=> {
  if(intent.couple && l.gender!=='couple') return false
  if(intent.occasion && !l.occasions.includes(intent.occasion)) return false
  if(intent.gender && l.gender!==intent.gender) return false
  if(intent.budget!==undefined && l.price>intent.budget) return false
  const garments=lookItems(l).map(p=>`${p.title} ${p.styleTags.join(' ')}`).join(' ')
  return textMatches(`${l.title} ${l.occasions.join(' ')} ${l.mood} ${garments}`,intent.tokens)
 }).slice(0,limit)
}
