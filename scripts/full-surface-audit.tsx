/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FULL-SURFACE AUDIT — complements browser-card-audit.tsx by sweeping every
 * OTHER rendered surface (home, trending, search, looks, product pages,
 * occasions index, journal, saved) and counting any <img src="*.svg"> that
 * actually renders. Together the two audits cover every route in the app.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Home from '../src/pages/Home'
import ProductPage from '../src/pages/ProductPage'
import OccasionsPage from '../src/pages/OccasionsPage'
import JournalPage from '../src/pages/JournalPage'
import SearchPage from '../src/pages/SearchPage'
import SavedPage from '../src/pages/SavedPage'
import LookPage from '../src/pages/LookPage'
import { TrendingPage } from '../src/pages/StaticPages'
import productsJson from '../src/data/catalog/products.json'
import looksJson from '../src/data/catalog/looks.json'

const products = productsJson as any[]
const looks = (looksJson as any).looks ?? looksJson

const htmlOf = (route: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/occasions" element={<OccasionsPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/look/:id" element={<LookPage />} />
      </Routes>
    </MemoryRouter>,
  )

const imgRe = /<img[^>]*?src="([^"]+)"/g
const sampleProducts = [
  'w-saree-banarasi-03', 'w-kurtiset-sharara-03', 'w-leh-classic-06', 'w-coord-silk-01',
  'm-kurt-set-dupatta-02', 'm-dhoti-kurta-01', 'm-jacket-velvet-03', 'm-waistcoat-set-04',
  'b-stick-lip-01', 'b-eye-palette-02', 'w-ear-thread-02', 'm-scarf-02',
].filter((id) => products.some((p) => p.id === id))
const sampleLooks = (looks as any[]).slice(0, 4).map((l) => l.id)

const routes = [
  '/',
  '/trending',
  '/search?q=saree',
  '/search?q=garba',
  '/search?q=couple%20outfit',
  '/search?q=formals',
  '/saved',
  '/journal',
  '/occasions',
  ...sampleProducts.map((id) => `/product/${id}`),
  ...sampleLooks.map((id) => `/look/${id}`),
]

let total = 0
let svg = 0
const offenders: Array<{ route: string; srcs: string[] }> = []
for (const route of routes) {
  let html = ''
  try {
    html = htmlOf(route)
  } catch (e) {
    console.log(`RENDER FAIL ${route}: ${(e as Error).message}`)
    process.exit(3)
  }
  const srcs: string[] = []
  let m: RegExpExecArray | null
  while ((m = imgRe.exec(html)) !== null) srcs.push(m[1])
  imgRe.lastIndex = 0
  const bad = srcs.filter((s) => s.endsWith('.svg'))
  total += srcs.length
  svg += bad.length
  if (bad.length) offenders.push({ route, srcs: bad })
}

console.log(`full-surface sweep: ${routes.length} routes · ${total} rendered imgs · svg: ${svg}`)
if (svg > 0) {
  for (const o of offenders) console.log(`${o.route}: ${o.srcs.join(', ')}`)
  process.exit(2)
}
console.log('✓ zero SVG imgs render on any swept surface')
