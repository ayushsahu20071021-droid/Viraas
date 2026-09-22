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
const imageManifest = read('src/data/catalog/image-manifest.json')

const MERCHANTS = ['Myntra', 'AJIO', 'Flipkart', 'Shopsy', 'Meesho', 'Nykaa']
const errors = []
const err = (m) => errors.length < 50 && errors.push(m)
const badNum = (v) => typeof v !== 'number' || !Number.isFinite(v) || !(v > 0)
if (products.length !== 653) err(`production catalog must contain exactly 653 products, got ${products.length}`)
if (couples.length !== 60) err(`production Couple Edit must contain exactly 60 looks, got ${couples.length}`)
if (imageManifest.productPrimaryCount !== products.length || imageManifest.productPrimaryFormat !== 'jpg') err('image manifest does not match product primary photography')
if (imageManifest.couplePrimaryCount !== couples.length || imageManifest.couplePrimaryFormat !== 'jpg') err('image manifest does not match Couple Edit photography')
if (imageManifest.productPrimaries?.length !== products.length) err('image manifest product index is incomplete')
if (imageManifest.couplePrimaries?.length !== couples.length) err('image manifest couple index is incomplete')

for (const p of products) {
  if (badNum(p.price)) err(`[${p.id}] price must be a finite positive number, got ${JSON.stringify(p.price)}`)
  if (p.price > 8000) err(`[${p.id}] price exceeds production ceiling of ₹8,000`)
  if (!/\.jpg$/i.test(p.imageUrl || '')) err(`[${p.id}] primary image must be a raster JPG, got ${p.imageUrl}`)
  if (p.originalPrice != null && badNum(p.originalPrice)) err(`[${p.id}] originalPrice present but invalid`)
  if (p.originalPrice != null && typeof p.price === 'number' && p.originalPrice < p.price) err(`[${p.id}] originalPrice below price`)
  if (typeof p.title !== 'string' || !p.title) err(`[${p.id}] missing title`)
  if (typeof p.brand !== 'string' || !p.brand) err(`[${p.id}] missing brand`)
  if (typeof p.imageUrl !== 'string' || !/^\/images\/[^\s]+/.test(p.imageUrl)) err(`[${p.id}] bad imageUrl`)
  if (p.imageUrl && !existsSync(join(ROOT, 'public', p.imageUrl))) err(`[${p.id}] imageUrl not on disk: ${p.imageUrl}`)
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
  if (/\.svg$/i.test(l.imageUrl || '')) err(`[look ${l.id}] primary image must not be SVG`)
}
for (const c of couples) {
  if (badNum(c.price)) err(`[couple ${c.id}] invalid price`)
  if (c.price > 8000) err(`[couple ${c.id}] price exceeds production ceiling of ₹8,000`)
  if (!/\.jpg$/i.test(c.imageUrl || '') || !existsSync(join(ROOT, 'public', c.imageUrl))) err(`[couple ${c.id}] human-couple JPG missing on disk`)
  for (const id of [...(c.herProductIds || []), ...(c.hisProductIds || [])]) if (!byId.has(id)) err(`[couple ${c.id}] references missing product ${id}`)
}

const titles = products.map((p) => p.id)
if (new Set(titles).size !== titles.length) err('duplicate product ids')

console.log(`check-catalog: ${products.length} products · ${looks.length} looks · ${couples.length} couple looks`)
if (errors.length) {
  console.error(`✗ ${errors.length} integrity error(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log('✓ catalog integrity: all required fields valid, links whitelisted, images on disk')
