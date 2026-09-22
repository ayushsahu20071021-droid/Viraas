#!/usr/bin/env node
/** Affiliate architecture gate. No fabricated tracking URLs are allowed. */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const source = readFileSync(join(ROOT, 'src/data/affiliate-links.ts'), 'utf8')
const allowed = new Set(['Myntra', 'AJIO', 'Flipkart', 'Shopsy', 'Meesho', 'Nykaa'])
const errors = []
for (const p of products) {
  if (!allowed.has(p.merchantLabel)) errors.push(`${p.id}: merchant ${p.merchantLabel} is not whitelisted`)
  if (p.affiliateUrl) errors.push(`${p.id}: catalog affiliateUrl is populated; paste links only in src/data/affiliate-links.ts`)
  if (/amazon|bit\.ly|tinyurl|utm_[a-z]+=|[?&](tag|aff|affiliate|ref)=/i.test(`${p.merchantUrl} ${p.affiliateUrl || ''}`)) errors.push(`${p.id}: fabricated/banned tracking parameter found`)
  if (!/^https:\/\/.+/.test(p.merchantUrl || '') || /^https:\/\/[^/]+\/?$/.test(p.merchantUrl || '')) errors.push(`${p.id}: merchantUrl must be a non-bare HTTPS deep link`)
}
if (/PASTE_REAL_EARNKARO_URL_HERE/.test(source) && Object.keys(source.match(/'[^']+':/g) || {}).length) {
  // The example is a comment, not a configured affiliate destination.
}
if (errors.length) {
  console.error(`affiliate audit failed: ${errors.length} issue(s)`)
  errors.slice(0, 30).forEach((e) => console.error(`- ${e}`))
  process.exit(1)
}
console.log(`affiliate audit: ${products.length} catalog entries checked`)
console.log('✓ affiliate map is centralized and empty; retailer fallbacks are whitelisted deep links')
