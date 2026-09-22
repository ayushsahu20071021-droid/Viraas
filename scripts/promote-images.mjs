#!/usr/bin/env node
/**
 * VIRAAS image promotion — maps premium generated photography into the catalog.
 *
 *   node scripts/promote-images.mjs
 *
 * For every product id with public/images/products/{id}.jpg on disk:
 *   - imageUrl      → the photograph
 *   - gallery       → [photo, ...extra photo views] (flat SVG plates drop out)
 *   - the now-unreferenced {id}.svg / {id}-b.svg / {id}-c.svg plates are removed
 * For every couple look with public/images/couple-plates/{cid}.jpg:
 *   - imageUrl      → the photograph (couple-set products inherit it)
 * looks.json anchors inherit product imageUrls automatically.
 * Exit code is non-zero if a referenced file is missing afterwards.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync, renameSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMG_DIR = join(ROOT, 'public/images/products')
const COUPLE_DIR = join(ROOT, 'public/images/couple-plates')

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const products = readJson('src/data/catalog/products.json')
const looks = readJson('src/data/catalog/looks.json')
const couples = readJson('src/data/catalog/couples.json')

const productJpgs = new Set(readdirSync(IMG_DIR).filter((f) => f.endsWith('.jpg')))
const coupleJpgs = new Set(existsSync(COUPLE_DIR) ? readdirSync(COUPLE_DIR).filter((f) => f.endsWith('.jpg')) : [])

let promotedProducts = 0
let promotedCouples = 0
let prunedPlates = 0
const missing = []

for (const p of products) {
  const main = `${p.id}.jpg`
  if (productJpgs.has(main)) {
    const alts = [`${p.id}-b.jpg`, `${p.id}-c.jpg`].filter((f) => productJpgs.has(f))
    p.imageUrl = `/images/products/${main}`
    p.gallery = [`/images/products/${main}`, ...alts.map((f) => `/images/products/${f}`)]
    promotedProducts++
    // prune replaced plates
    for (const svg of [`${p.id}.svg`, `${p.id}-b.svg`, `${p.id}-c.svg`]) {
      const path = join(IMG_DIR, svg)
      if (existsSync(path)) { unlinkSync(path); prunedPlates++ }
    }
  } else {
    // photo not generated yet — catalog must still point at existing files
    if (!existsSync(join(ROOT, 'public', p.imageUrl)) && p.category !== 'couple-edit') missing.push(`${p.id}: ${p.imageUrl}`)
  }
}

// occasion hero photos are delivered by the batch pipeline into products/; relocate to public/images
const HERO_RE = /^occasion-(garba|haldi)\.jpg$/
for (const f of readdirSync(IMG_DIR).filter((x) => HERO_RE.test(x))) {
  renameSync(join(IMG_DIR, f), join(ROOT, 'public/images', f))
}

for (const c of couples) {
  const jpg = `${c.coupleId}.jpg`
  if (coupleJpgs.has(jpg)) {
    c.imageUrl = `/images/couple-plates/${jpg}`
    promotedCouples++
    const svg = join(COUPLE_DIR, `${c.coupleId}.svg`)
    if (existsSync(svg)) { unlinkSync(svg); prunedPlates++ }
  }
  if (!existsSync(join(ROOT, 'public', c.imageUrl))) missing.push(`couple ${c.id}: ${c.imageUrl}`)
}

// couple-set products inherit the couple photo + her/his product photos
for (const p of products) {
  if (p.category !== 'couple-edit') continue
  const couple = couples.find((c) => p.imageUrl === `/images/couple-plates/${c.coupleId}.svg`)
  if (couple) p.imageUrl = couple.imageUrl
  p.gallery = [p.imageUrl, ...(p.herProductIds || []), ...(p.hisProductIds || [])]
    .slice(1)
    .map((id) => products.find((x) => x.id === id)?.imageUrl)
    .filter((u, i, arr) => u && arr.indexOf(u) === i)
    .slice(0, 3)
  if (!existsSync(join(ROOT, 'public', p.imageUrl))) missing.push(`${p.id}: ${p.imageUrl}`)
}

// looks anchor imageUrls follow their first product
for (const l of looks) {
  const anchor = products.find((p) => p.id === l.productIds[0])
  if (anchor) l.imageUrl = anchor.imageUrl
  if (!existsSync(join(ROOT, 'public', l.imageUrl))) missing.push(`look ${l.id}: ${l.imageUrl}`)
}

writeFileSync(join(ROOT, 'src/data/catalog/products.json'), JSON.stringify(products, null, 1))
writeFileSync(join(ROOT, 'src/data/catalog/looks.json'), JSON.stringify(looks, null, 1))
writeFileSync(join(ROOT, 'src/data/catalog/couples.json'), JSON.stringify(couples, null, 1))

console.log(`promote-images: ${promotedProducts} product photos · ${promotedCouples} couple photos · ${prunedPlates} svg plates pruned`)
if (missing.length) {
  console.error(`✗ ${missing.length} referenced image(s) missing:`)
  for (const m of missing.slice(0, 20)) console.error('  - ' + m)
  process.exit(1)
}
console.log('✓ every catalog imageUrl/gallery entry resolves to a file on disk')
