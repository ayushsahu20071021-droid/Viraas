/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RENDER SMOKE TEST (run via scripts/run-render-smoke.sh)
 *
 * Renders every component/page server-side with react-dom/server against the
 * REAL generated catalog. If any product/look/page throws during render
 * (e.g. the production `.toLocaleString()` crash on an undefined price),
 * this script exits non-zero with the offender id.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import productsJson from '../src/data/catalog/products.json'
import looksJson from '../src/data/catalog/looks.json'
import couplesJson from '../src/data/catalog/couples.json'
import ProductCard from '../src/components/ProductCard'
import TryOnModal from '../src/components/TryOnModal'
import Home from '../src/pages/Home'
import CategoryPage from '../src/pages/CategoryPage'
import ProductPage from '../src/pages/ProductPage'
import OccasionsPage from '../src/pages/OccasionsPage'
import TryOnPage from '../src/pages/TryOnPage'
import JournalPage from '../src/pages/JournalPage'
import SearchPage from '../src/pages/SearchPage'
import SavedPage from '../src/pages/SavedPage'
import LookPage from '../src/pages/LookPage'
import { AboutPage, ContactPage, FAQPage, PrivacyPage, TermsPage, AffiliateDisclosurePage, AITryOnPrivacyPage, CoupleEditPage, TrendingPage } from '../src/pages/StaticPages'

const products = productsJson as any[]
let failures = 0
const fail = (what: string, e: unknown) => { failures++; console.log(`FAIL ${what}: ${(e as Error)?.message || e}`) }
const ok = (what: string) => console.log(`OK   ${what}`)

// ── 1. ProductCard for ALL 595 products (the exact crash surface) ────────────
let cards = 0
for (const p of products) {
  try { renderToStaticMarkup(<MemoryRouter><ProductCard product={p} /></MemoryRouter>); cards++ } catch (e) { fail(`ProductCard ${p.id}`, e) }
}
if (failures === 0) ok(`ProductCard rendered for all ${cards}/${products.length} catalog products`)

// ── 2. Synthetic edge cases required by the fix brief ───────────────────────
const base: any = { id: 'x', title: 'Edge case', gender: 'women', category: 'sarees', brand: 'Test', price: 1234, styleTags: [], sizes: [], occasions: [], merchantUrl: 'https://example.com', merchantLabel: 'Myntra', status: 'CHECK', imageUrl: '/images/placeholder.svg', inHouseTryOn: false }
const cases: Array<[string, any]> = [
  ['price: undefined', { ...base, price: undefined }],
  ['price: null', { ...base, price: null }],
  ['price: NaN', { ...base, price: NaN }],
  ['mrp missing (no discount)', { ...base }],
  ['mrp present + higher (badge shown)', { ...base, originalPrice: 2000 }],
  ['affiliateUrl empty string', { ...base, affiliateUrl: '' }],
  ['merchantLabel missing', { ...base, merchantLabel: undefined }],
  ['imageUrl missing', { ...base, imageUrl: undefined }],
  ['styleTags missing', { ...base, styleTags: undefined }],
  ['title missing', { ...base, title: undefined }],
  ['brand missing', { ...base, brand: undefined }],
  ['everything broken', { ...base, price: undefined, merchantLabel: undefined, imageUrl: undefined, styleTags: undefined, title: undefined, brand: undefined }],
]
for (const [name, p] of cases) {
  try {
    const html = renderToStaticMarkup(<MemoryRouter><ProductCard product={p} /></MemoryRouter>)
    if (p.price === undefined || p.price === null || Number.isNaN(p.price)) {
      if (!html.includes('Price unavailable')) fail(`edge: ${name} (missing fallback label)`, 'expected "Price unavailable"')
      else ok(`edge: ${name} → "Price unavailable"`)
    } else ok(`edge: ${name}`)
  } catch (e) { fail(`edge: ${name}`, e) }
}

// ── 3. Pages via router (real ids incl. previously-broken products) ──────────
const brokenId = products.find((p) => !('price' in p) || typeof p.price !== 'number')?.id || 'w-saree-drape-03'
const pages: Array<[string, React.ReactElement]> = [
  ['/', <Home />],
  ['/women', <CategoryPage gender="women" title="For Her" subtitle="s" heroImage="/images/hero-women.jpg" />],
  ['/men', <CategoryPage gender="men" title="For Him" subtitle="s" heroImage="/images/hero-men.jpg" />],
  ['/accessories', <CategoryPage gender="accessories" title="Accessories" subtitle="s" heroImage="/images/accessories-flatlay.jpg" />],
  ['/trending', <TrendingPage />],
  ['/couple-edit', <CoupleEditPage />],
  ['/search?q=saree', <SearchPage />],
  ['/saved', <SavedPage />],
  ['/try-on', <TryOnPage />],
  ['/occasions', <OccasionsPage />],
  ['/occasions/diwali', <OccasionsPage />],
  ['/occasions/garba', <OccasionsPage />],
  ['/occasions/navratri', <OccasionsPage />],
  ['/occasions/festive-party', <OccasionsPage />],
  ['/occasions/college-fest', <OccasionsPage />],
  ['/journal', <JournalPage />],
  ['/journal/the-organza-decode', <JournalPage />],
  ['/about', <AboutPage />], ['/contact', <ContactPage />], ['/faq', <FAQPage />], ['/privacy', <PrivacyPage />],
  ['/terms', <TermsPage />], ['/affiliate-disclosure', <AffiliateDisclosurePage />], ['/ai-try-on-privacy', <AITryOnPrivacyPage />],
].map(([name, el], i): [string, React.ReactElement] => [name as string, el as React.ReactElement])

const routesFor = (name: string): React.ReactElement => {
  const p = name.split('?')[0]
  if (p === '/product-x') return <></>
  return <>{el}</>
}
for (const [name, el] of pages) {
  try {
    let route = <Route path={name.split('?')[0]} element={el} />
    let initial = name
    if (name === '/search?q=saree') { route = <Route path="/search" element={el} />; initial = '/search?q=saree' }
    if (name.startsWith('/occasions/')) { route = <Route path="/occasions/:id" element={el} />; initial = name }
    if (name === '/journal/the-organza-decode') { route = <Route path="/journal/:slug" element={el} />; initial = '/journal/the-organza-decode' }
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={[initial]}><Routes>{route}</Routes></MemoryRouter>)
    if (!html || html.length < 50) fail(`page ${name} (empty output)`, 'too short')
    else ok(`page ${name} (${html.length.toLocaleString()} chars)`)
  } catch (e) { fail(`page ${name}`, e) }
}
void routesFor

// product pages — a known-good id AND the id that used to be price-less
for (const id of ['w-saree-drape-01', brokenId, 'cp-set-01', products[0].id]) {
  try {
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/product/${id}`]}>
        <Routes><Route path="/product/:id" element={<ProductPage />} /></Routes>
      </MemoryRouter>
    )
    ok(`page /product/${id}`)
  } catch (e) { fail(`page /product/${id}`, e) }
}

// look pages — normal + couple
for (const lid of [looksJson[0]?.id, 'couple-sage-silk', couplesJson[0]?.id].filter(Boolean)) {
  try {
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[`/look/${lid}`]}>
        <Routes><Route path="/look/:id" element={<LookPage />} /></Routes>
      </MemoryRouter>
    )
    ok(`page /look/${lid}`)
  } catch (e) { fail(`page /look/${lid}`, e) }
}

// Required production priority route: Garba category filter.
try {
  renderToStaticMarkup(<MemoryRouter initialEntries={['/men?category=garba']}><Routes><Route path="/men" element={<CategoryPage gender="men" title="For Him" subtitle="s" heroImage="/images/hero-men.jpg" />} /></Routes></MemoryRouter>)
  ok('page /men?category=garba')
} catch (e) { fail('page /men?category=garba', e) }

// filtered category page (all query facets at once)
try {
  renderToStaticMarkup(<MemoryRouter initialEntries={['/women?category=sarees&occasion=diwali&colour=Ivory&budget=' + encodeURIComponent('Under ₹1,999')]}><Routes><Route path="/women" element={<CategoryPage gender="women" title="For Her" subtitle="s" heroImage="/images/hero-women.jpg" />} /></Routes></MemoryRouter>)
  ok('page /women?category+occasion+colour+budget (filtered)')
} catch (e) { fail('page /women filtered', e) }

// TryOnModal with a minimal product
try { renderToStaticMarkup(<MemoryRouter><TryOnModal product={base} onClose={() => {}} /></MemoryRouter>); ok('TryOnModal render') } catch (e) { fail('TryOnModal', e) }

console.log(failures ? `\n✗ ${failures} RENDER FAILURE(S)` : '\n✓ ALL RENDER TESTS PASSED')
process.exit(failures ? 1 : 0)
