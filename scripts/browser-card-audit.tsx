/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * BROWSER CARD AUDIT — renders the REAL pages exactly as the browser would
 * (same components, same catalog) and extracts every <img src="..."> that
 * appears in the product/look grids, classifying raster (generated premium
 * photography) vs SVG (legacy plate). This is the rendered-output audit:
 * an image file existing on disk is NOT enough — only imgs that actually
 * render on the page count.
 *
 * Usage: npx esbuild scripts/browser-card-audit.tsx --bundle --platform=node
 *        --format=cjs --jsx=automatic --define:process.env.NODE_ENV='"production"'
 *        --define:import.meta.env='{"VITE_TRYON_MODE":"demo"}'
 *        --outfile=node_modules/.cache/viraas-card-audit.cjs --log-level=error
 *        && node node_modules/.cache/viraas-card-audit.cjs
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductCard from '../src/components/ProductCard'
import Home from '../src/pages/Home'
import CategoryPage from '../src/pages/CategoryPage'
import OccasionsPage from '../src/pages/OccasionsPage'
import { CoupleEditPage } from '../src/pages/StaticPages'

const htmlOf = (route: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/women" element={<CategoryPage gender="women" />} />
        <Route path="/men" element={<CategoryPage gender="men" />} />
        <Route path="/accessories" element={<CategoryPage gender="all" />} />
        <Route path="/occasions/:id" element={<OccasionsPage />} />
        <Route path="/couple-edit" element={<CoupleEditPage />} />
      </Routes>
    </MemoryRouter>,
  )

const imgRe = /<img[^>]*?src="([^"]+)"/g
const ROUTES = [
  '/men',
  '/men?category=garba',
  '/men?category=formals',
  '/women',
  '/occasions/navratri',
  '/occasions/garba',
  '/occasions/wedding',
  '/couple-edit',
  '/accessories',
]

let totalImg = 0
let totalSvg = 0
const svgByRoute: Record<string, string[]> = {}

for (const route of ROUTES) {
  const html = htmlOf(route)
  const srcs: string[] = []
  let m: RegExpExecArray | null
  while ((m = imgRe.exec(html)) !== null) srcs.push(m[1])
  imgRe.lastIndex = 0
  const svg = srcs.filter((s) => s.endsWith('.svg'))
  totalImg += srcs.length
  totalSvg += svg.length
  if (svg.length) svgByRoute[route] = svg
  console.log(
    `${route}  →  imgs: ${srcs.length}  jpg: ${srcs.length - svg.length}  svg: ${svg.length}`,
  )
}

console.log('\n══ RENDERED CARD AUDIT ══')
console.log(`total <img> across audited routes: ${totalImg}`)
console.log(`rendered SVG plates: ${totalSvg}`)
if (totalSvg) {
  console.log('\n── routes still rendering SVG ──')
  for (const [r, srcs] of Object.entries(svgByRoute)) {
    console.log(`${r}: ${srcs.length}`)
    for (const s of [...new Set(srcs)].slice(0, 12)) console.log('   ' + s)
    if (srcs.length > 12) console.log(`   … +${srcs.length - 12} more`)
  }
  process.exit(2)
}
console.log('✓ every rendered card on audited routes uses generated photography')
