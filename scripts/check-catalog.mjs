#!/usr/bin/env node
/**
 * Catalog integrity gate — validates the generated data the same way the
 * browser will consume it. Run via `npm run check-catalog`.
 * Exits non-zero (failing CI/deploys) on anything that could crash a render.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const products = read('src/data/catalog/products.json')
const looks = read('src/data/catalog/looks.json')
const couples = read('src/data/catalog/couples.json')

const MERCHANTS = ['Myntra', 'AJIO', 'Flipkart', 'Shopsy', 'Meesho', 'Nykaa', 'VIRAAS Curated']
const errors = []
const err = (m) => errors.length < 50 && errors.push(m)
const badNum = (v) => typeof v !== 'number' || !Number.isFinite(v) || !(v > 0)

for (const p of products) {
  if (badNum(p.price)) err(`[${p.id}] price must be a finite positive number, got ${JSON.stringify(p.price)}`)
  if (p.originalPrice != null && badNum(p.originalPrice)) err(`[${p.id}] originalPrice present but invalid`)
  if (p.originalPrice != null && typeof p.price === 'number' && p.originalPrice < p.price) err(`[${p.id}] originalPrice below price`)
  if (typeof p.title !== 'string' || !p.title) err(`[${p.id}] missing title`)
  if (typeof p.brand !== 'string' || !p.brand) err(`[${p.id}] missing brand`)
  if (typeof p.imageUrl !== 'string' || !/^\/images\/[^\s]+/.test(p.imageUrl)) err(`[${p.id}] bad imageUrl`)
  if (p.imageUrl && !existsSync(join(ROOT, 'public', p.imageUrl))) err(`[${p.id}] imageUrl not on disk: ${p.imageUrl}`)
  if (p.imageUrl && /\.svg$/.test(p.imageUrl)) err(`[${p.id}] primary visual is a flat SVG plate — apparel/accessory cards must use photographic editorial assets (see scripts/photos/)`)
  for (const g of p.gallery || []) if (typeof g === 'string' && g.startsWith('/images') && !existsSync(join(ROOT, 'public', g))) err(`[${p.id}] gallery image missing: ${g}`)
  if (!MERCHANTS.includes(p.merchantLabel)) err(`[${p.id}] merchantLabel not whitelisted: ${p.merchantLabel}`)
  if (typeof p.merchantUrl !== 'string' || !/^https:\/\/.+/.test(p.merchantUrl)) err(`[${p.id}] merchantUrl is not a real deep link`)
  if (/^https:\/\/[^/]+\/?$/.test(p.merchantUrl || '')) err(`[${p.id}] merchantUrl is a bare homepage`)
  if (/amazon/i.test(JSON.stringify(p))) err(`[${p.id}] contains a banned 'amazon' reference`)
  if (p.affiliateUrl) err(`[${p.id}] affiliateUrl must be empty until real EarnKaro links are pasted`)
  if (!Array.isArray(p.styleTags)) err(`[${p.id}] styleTags must be an array`)
  if (!Array.isArray(p.sizes) || !p.sizes.length) err(`[${p.id}] sizes must be a non-empty array`)
  if (p.status !== 'CHECK' && p.status !== 'VERIFIED') err(`[${p.id}] unexpected status: ${p.status}`)
}

const byId = new Map(products.map((p) => [p.id, p]))
for (const l of looks) {
  if (badNum(l.price)) err(`[look ${l.id}] invalid price`)
  const sum = l.productIds.reduce((s, id) => s + (byId.get(id)?.price ?? 0), 0)
  if (l.price !== sum) err(`[look ${l.id}] price ${l.price} != item sum ${sum}`)
  if (typeof l.imageUrl !== 'string' || !existsSync(join(ROOT, 'public', l.imageUrl))) err(`[look ${l.id}] plate image missing on disk`)
}
if (couples.length < 60) err(`couple edit must ship at least 60 unique looks, found ${couples.length}`)
const coupleImages = new Set()
for (const c of couples) {
  if (badNum(c.price)) err(`[couple ${c.id}] invalid price`)
  if (typeof c.imageUrl !== 'string' || !existsSync(join(ROOT, 'public', c.imageUrl))) err(`[couple ${c.id}] image missing on disk: ${c.imageUrl}`)
  if (/\.svg$/.test(c.imageUrl || '')) err(`[couple ${c.id}] still on an SVG plate — every couple look needs a photographic editorial visual`)
  if (coupleImages.has(c.imageUrl)) err(`[couple ${c.id}] reuses another couple's image (${c.imageUrl})`)
  coupleImages.add(c.imageUrl)
  const refs = [...(c.herProductIds || []), ...(c.hisProductIds || [])]
  if (refs.length < 4 || refs.length > 6) err(`[couple ${c.id}] should reference 4-6 real products, found ${refs.length}`)
  for (const id of refs) if (!byId.has(id)) err(`[couple ${c.id}] references missing product ${id}`)
  for (const id of c.herProductIds || []) if (byId.get(id)?.gender !== 'women') err(`[couple ${c.id}] her ref ${id} is not a women product`)
  for (const id of c.hisProductIds || []) if (byId.get(id)?.gender !== 'men') err(`[couple ${c.id}] his ref ${id} is not a men product`)
}

const formals = products.filter((p) => p.category === 'formals')
if (formals.length < 8) err(`wedding formals subcategory must exist with at least 8 pieces, found ${formals.length}`)
for (const p of formals) {
  if (p.gender !== 'men') err(`[formals ${p.id}] must be a men subcategory`)
  if (!p.occasions.includes('Wedding')) err(`[formals ${p.id}] must be tagged Wedding`)
}

// ── central affiliate link file ───────────────────────────────────────────────
const affSrc = readFileSync(join(ROOT, 'src/data/affiliate-links.ts'), 'utf8')
if (!/export function getAffiliateUrl/.test(affSrc)) err('affiliate-links.ts must export getAffiliateUrl(productId)')
const affEntries = new Map()
for (const m of affSrc.matchAll(/"([^"]+)":\s*"([^"]*)"/g)) affEntries.set(m[1], m[2])
const missingAff = products.filter((p) => !affEntries.has(p.id)).map((p) => p.id)
if (missingAff.length) err(`affiliate-links.ts is missing ${missingAff.length} product id(s): ${missingAff.slice(0, 8).join(', ')}…`)
const extraAff = [...affEntries.keys()].filter((id) => !byId.has(id))
if (extraAff.length) err(`affiliate-links.ts has ${extraAff.length} key(s) not in the catalog: ${extraAff.slice(0, 8).join(', ')}…`)
for (const [id, url] of affEntries) {
  if (url && !/^https:\/\//.test(url)) err(`[affiliate ${id}] value must be a full https URL or empty`)
  if (/amazon/i.test(url)) err(`[affiliate ${id}] Amazon links are banned on VIRAAS`)
}

const titles = products.map((p) => p.id)
if (new Set(titles).size !== titles.length) err('duplicate product ids')

console.log(`check-catalog: ${products.length} products · ${looks.length} looks · ${couples.length} couple looks · ${formals.length} wedding formals · ${affEntries.size} affiliate entries`)
if (errors.length) {
  console.error(`✗ ${errors.length} integrity error(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log('✓ catalog integrity: all required fields valid, links whitelisted, images on disk')
