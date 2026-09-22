#!/usr/bin/env node
/**
 * VIRAAS image audit — the section-47/50 gate.
 *
 *   node scripts/check-images.mjs
 *
 * For EVERY visual referenced by the catalog (products, gallery, looks, couple
 * looks):
 *   1. file exists           2. decodes (ImageMagick identify for rasters,
 *      well-formed SVG markup for plates)
 *   3. correct path          4. sane dimensions / aspect
 * Plus production-count reporting against the final 490-asset queue:
 *   60 couple · 2 occasion heroes · 123 men · 166 women · 139 accessories/beauty
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const products = readJson('src/data/catalog/products.json')
const looks = readJson('src/data/catalog/looks.json')
const couples = readJson('src/data/catalog/couples.json')

const APPAREL = ['sarees', 'kurta-sets', 'lehenga', 'co-ord-sets', 'indowestern', 'garba', 'jackets', 'formals', 'sharara-gharara', 'ethnic-shirts']
const ACC = ['jewellery', 'bags', 'footwear', 'watches', 'accessories', 'beauty']

const refs = new Map() // file → [referrers]
const ref = (file, who) => {
  if (!refs.has(file)) refs.set(file, [])
  refs.get(file).push(who)
}

const RASTER = /\.(jpe?g|png|webp|avif)$/i
const dims = (file) => {
  try {
    if (RASTER.test(file)) {
      const out = execFileSync('identify', ['-format', '%w %h', join(ROOT, 'public', file)], { encoding: 'utf8', timeout: 20000 })
      const [w, h] = out.trim().split(/\s+/).map(Number)
      return Number.isFinite(w) && Number.isFinite(h) && w > 0 ? { w, h } : null
    }
    // SVG plate: existence + well-formed markup is the gate here
    const txt = readFileSync(join(ROOT, 'public', file), 'utf8')
    return txt.includes('<svg') && txt.includes('</svg>') ? { w: 800, h: 1067 } : null
  } catch {
    return null
  }
}

const errors = []
const err = (m) => errors.length < 40 && errors.push(m)

for (const p of products) {
  ref(p.imageUrl, p.id)
  for (const g of p.gallery || []) if (g.startsWith('/images')) ref(g, `${p.id} (gallery)`)
}
for (const l of looks) ref(l.imageUrl, l.id)
for (const c of couples) ref(c.imageUrl, c.id)

let checked = 0
for (const [file, whos] of refs) {
  const path = join(ROOT, 'public', file)
  if (!existsSync(path)) { err(`missing file ${file} ← ${whos.slice(0, 3).join(', ')}`); continue }
  const d = dims(file)
  if (!d) { err(`does not decode / unreadable ${file}`); continue }
  checked++
  const ratio = d.w / d.h
  const isCoupleImg = file.startsWith('/images/couple-plates/')
  const isHero = file.startsWith('/images/occasion-') || file.startsWith('/images/hero')
  const isRaster = RASTER.test(file)
  if (!isRaster) continue // plate aspect is authored, not photographic
  if (isHero) {
    if (d.w < 1000) err(`${file} hero too narrow (${d.w}w)`)
  } else if (!isCoupleImg) {
    // product art should be portrait-ish 3:4 (±6%)
    if (Math.abs(ratio - 0.75) > 0.06) err(`${file} aspect ${ratio.toFixed(2)} not portrait 3:4 (${d.w}x${d.h})`)
  }
}

const stat = (label, n, target) => {
  const mark = n >= target ? '✓' : '…'
  console.log(`  ${mark} ${label}: ${n}/${target}`)
  return n >= target
}

console.log('── production image counts (final queue: 653) ──')
const premiumOf = (pred) => products.filter((p) => pred(p) && p.imageUrl.endsWith('.jpg')).length
const poolOf = (pred) => products.filter((p) => pred(p)).length
const couplePhotos = couples.filter((c) => c.imageUrl.endsWith('.jpg')).length
const heroPhotos = readdirSync(join(ROOT, 'public/images')).filter((f) => /^occasion-(garba|haldi)\.jpg$/.test(f)).length
const menP = premiumOf((p) => p.gender === 'men' && APPAREL.includes(p.category))
const womenP = premiumOf((p) => p.gender === 'women' && APPAREL.includes(p.category))
const accP = premiumOf((p) => ACC.includes(p.category))
const total = couplePhotos + heroPhotos + menP + womenP + accP

stat('Couple Edit', couplePhotos, couples.length)
stat('Occasion heroes (garba+haldi)', heroPhotos, 2)
stat('Men apparel', menP, poolOf((p) => p.gender === 'men' && APPAREL.includes(p.category)))
stat('Women apparel', womenP, poolOf((p) => p.gender === 'women' && APPAREL.includes(p.category)))
stat('Accessories & Beauty', accP, poolOf((p) => ACC.includes(p.category)))
console.log(`  ── TOTAL premium assets: ${total}/${60 + 2 + poolOf((p) => p.gender === 'men' && APPAREL.includes(p.category)) + poolOf((p) => p.gender === 'women' && APPAREL.includes(p.category)) + poolOf((p) => ACC.includes(p.category))}`)

// duplicate-photo guard: one photo shared by products with conflicting colours
const byFile = new Map()
for (const p of products) {
  const list = byFile.get(p.imageUrl) || []
  list.push(p)
  byFile.set(p.imageUrl, list)
}
for (const [file, list] of byFile) {
  if (list.length > 1) {
    const colours = new Set(list.map((p) => p.colour))
    if (colours.size > 1) err(`photo ${file} shared by conflicting colours (${[...colours].join(' / ')}): ${list.map((p) => p.id).join(', ')}`)
  }
}

console.log(`audit: ${checked} referenced files checked, decode + aspect OK`)
if (errors.length) {
  console.error(`✗ ${errors.length} image problem(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log('✓ images: all referenced visuals exist, decode and frame correctly')
