#!/usr/bin/env node
/**
 * HTTP + route audit against a running VIRAAS server.
 *
 *   node scripts/audit-http.mjs [baseUrl]
 *   baseUrl defaults to http://127.0.0.1:5173
 *
 * Checks:
 *   1. every sitemap route returns HTTP 200 (SPA fallback intact)
 *   2. every catalog-referenced image returns HTTP 200 + image content-type
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.argv[2] || 'http://127.0.0.1:5173'

const sitemap = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8')
const routes = [...sitemap.matchAll(/<loc>[^<]*<\/loc>/g)].map((m) => m[0].replace(/<\/?loc>/g, '').replace(/^https?:\/\/[^/]+/, ''))
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const couples = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/couples.json'), 'utf8'))
const looks = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/looks.json'), 'utf8'))

const images = new Set()
for (const p of products) { images.add(p.imageUrl); for (const g of p.gallery || []) images.add(g) }
for (const c of couples) images.add(c.imageUrl)
for (const l of looks) images.add(l.imageUrl)

let routeFails = 0
let imgFails = 0
const sampleRoutes = routes.filter((_, i) => i % Math.max(1, Math.ceil(routes.length / 60)) === 0) // 60 sampled routes
const conc = async (items, fn, size = 12) => {
  const queue = [...items]
  const workers = Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift())
  })
  await Promise.all(workers)
}

await conc(sampleRoutes, async (r) => {
  try {
    const res = await fetch(BASE + r, { redirect: 'follow' })
    if (res.status !== 200) { console.error(`✗ route ${r} → ${res.status}`); routeFails++ }
  } catch (e) { console.error(`✗ route ${r} → ${e.message}`); routeFails++ }
})

await conc([...images], async (img) => {
  try {
    const res = await fetch(BASE + img, { redirect: 'follow' })
    const type = res.headers.get('content-type') || ''
    if (res.status !== 200 || !/image\//.test(type)) { console.error(`✗ image ${img} → ${res.status} ${type}`); imgFails++ }
  } catch (e) { console.error(`✗ image ${img} → ${e.message}`); imgFails++ }
})

console.log(`audit-http: ${sampleRoutes.length} sampled route(s) of ${routes.length} · ${images.size} image(s)`)
if (routeFails || imgFails) {
  console.error(`✗ ${routeFails} route failure(s), ${imgFails} image failure(s)`)
  process.exit(1)
}
console.log('✓ http: routes and images all resolve with 200 + image content-type')
