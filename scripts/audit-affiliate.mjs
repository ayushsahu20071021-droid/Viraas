#!/usr/bin/env node
/**
 * Affiliate governance audit.
 *
 *   node scripts/audit-affiliate.mjs
 *
 * Verifies:
 *   1. every catalog product id has a key in src/data/affiliate-links.ts
 *   2. every shop CTA in src/ resolves through getAffiliateUrl() — no component
 *      reads product.affiliateUrl directly for navigation
 *   3. no 'amazon' reference anywhere in src/, scripts/ or netlify/
 *   4. configured (non-empty) affiliate URLs only use supported merchant domains
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const affSrc = readFileSync(join(ROOT, 'src/data/affiliate-links.ts'), 'utf8')

const errors = []
const err = (m) => errors.push(m)

// 1. coverage — every product id represented
const missingIds = products.filter((p) => !affSrc.includes(`"${p.id}"`))
if (missingIds.length) err(`${missingIds.length} product id(s) missing from affiliate-links.ts: ${missingIds.slice(0, 8).map((p) => p.id).join(', ')}…`)

// 2. direct affiliateUrl navigation in components/pages
const walk = (dir) => {
  const out = []
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.(tsx?|jsx?)$/.test(extname(f))) out.push(p)
  }
  return out
}
const srcFiles = walk(join(ROOT, 'src'))
const offenders = srcFiles.filter((f) => !f.endsWith('affiliate-links.ts') && /affiliateUrl\s*\|\|/.test(readFileSync(f, 'utf8')))
for (const f of offenders) err(`direct affiliateUrl navigation in ${f.replace(ROOT + '/', '')} — route through getAffiliateUrl()`)

// 3. amazon ban
const banRoots = ['src', 'scripts', 'netlify', 'public']
let amazonHits = 0
for (const dir of banRoots) {
  for (const f of walk(join(ROOT, dir))) {
    const txt = readFileSync(f, 'utf8')
    const n = (txt.match(/amazon/gi) || []).length
    if (n) { amazonHits += n; err(`'amazon' reference in ${f.replace(ROOT + '/', '')} (${n}×)`) }
  }
}

// 4. configured URLs must be supported merchants
const SUPPORTED = ['myntra.com', 'ajio.com', 'flipkart.com', 'shopsy.in', 'meesho.com', 'nykaa.com']
const configured = [...affSrc.matchAll(/"([\w-]+)":\s*"(https?:\/\/[^"]+)"/g)]
for (const [, id, url] of configured) {
  if (!SUPPORTED.some((d) => url.includes(d))) err(`affiliate URL for ${id} uses an unsupported merchant: ${url}`)
}

console.log(`audit-affiliate: ${products.length} product ids checked · ${configured.length} configured link(s) · amazon refs: ${amazonHits}`)
if (errors.length) {
  console.error(`✗ ${errors.length} affiliate problem(s):`)
  for (const e of errors.slice(0, 30)) console.error('  - ' + e)
  process.exit(1)
}
console.log('✓ affiliates: single-file coverage complete, CTAs centralised, merchant whitelist clean')
