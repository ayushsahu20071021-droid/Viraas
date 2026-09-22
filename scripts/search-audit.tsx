/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SEARCH AUDIT (directive §40) — runs the REAL searchProducts over the real
 * catalog and requires each query to return category-relevant results.
 * Bundle with esbuild exactly like render-smoke, then run the output.
 */
import { searchProducts } from '../src/data/products'

interface Query { q: string; mustInclude?: RegExp; minHits?: number }
const QUERIES: Query[] = [
  { q: 'green kurta', minHits: 3 },
  { q: 'diwali outfit', minHits: 5 },
  { q: 'pre draped saree', mustInclude: /pre-draped|predraped|drape/i, minHits: 3 },
  { q: 'lehenga', mustInclude: /lehenga/i, minHits: 5 },
  { q: 'sharara', mustInclude: /sharara/i, minHits: 3 },
  { q: 'gharara', mustInclude: /gharara/i, minHits: 2 },
  { q: 'chaniya choli', mustInclude: /chaniya/i, minHits: 5 },
  { q: 'garba', mustInclude: /garba|kediyu|kafni|chaniya/i, minHits: 5 },
  { q: 'kediyu', mustInclude: /kediyu/i, minHits: 3 },
  { q: 'ethnic shirt', mustInclude: /shirt/i, minHits: 3 },
  { q: 'kurta jacket', mustInclude: /jacket/i, minHits: 3 },
  { q: 'black festive jacket', mustInclude: /jacket|bandhgala/i, minHits: 2 },
  { q: 'navratri men', minHits: 5 },
  { q: 'couple outfit', minHits: 5 },
  { q: 'festive co ord', mustInclude: /co-?ord/i, minHits: 3 },
  { q: 'bandhgala', mustInclude: /bandhgala/i, minHits: 2 },
]

let failures = 0
for (const { q, mustInclude, minHits = 1 } of QUERIES) {
  const hits = searchProducts(q, 20) as any[]
  const relevant = mustInclude ? hits.filter((p) => mustInclude.test(`${p.title} ${p.category} ${p.subCategory} ${p.styleTags?.join(' ') || ''}`)) : hits
  const ok = relevant.length >= minHits
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  "${q}" → ${hits.length} hits, ${relevant.length} relevant (need ${minHits})${ok ? '' : '  top: ' + hits.slice(0, 3).map((p) => p.id).join(',')}`)
}
console.log(failures === 0 ? '✓ search audit: all ' + QUERIES.length + ' queries relevant' : `✗ search audit: ${failures} query(ies) failed`)
if (failures) process.exit(2)
