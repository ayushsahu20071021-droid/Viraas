#!/usr/bin/env node
/**
 * Regenerates src/data/affiliate-links.ts from the current catalog, PRESERVING
 * any affiliate URLs that were already pasted in. Run after the catalog changes:
 *
 *   node scripts/gen-affiliate-links.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const FILE = join(ROOT, 'src/data/affiliate-links.ts')

// keep every manually-pasted link
const existing = new Map()
try {
  const src = readFileSync(FILE, 'utf8')
  for (const [, id, url] of src.matchAll(/"([\w-]+)":\s*"([^"]*)"/g)) existing.set(id, url)
} catch { /* first run */ }

const lines = products.map((p) => `  ${JSON.stringify(p.id)}: ${JSON.stringify(existing.get(p.id) || '')},`).join('\n')

const out = `// ─────────────────────────────────────────────────────────────────────────────
// VIRAAS CENTRAL AFFILIATE FILE — the ONLY file you need to edit for links.
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO USE:
//   1. Generate your EarnKaro link for a product (manual — VIRAAS never
//      auto-generates, guesses tracking parameters or invents commissions).
//   2. Paste it between the quotes next to that product's id below.
//   3. Done. Every Shop CTA (ProductCard, ProductPage, LookPage, Couple Edit,
//      Complete-the-Look, Try-On result, Search) resolves through
//      getAffiliateUrl() — no other file needs touching.
//
// RULES ENFORCED IN CODE (scripts/audit-affiliate.mjs):
//   • Empty string = not configured → every CTA falls back to the retailer's
//     deep link and the UI shows 'Affiliate link not configured'.
//   • Supported merchants ONLY: Myntra, AJIO, Flipkart, Shopsy, Meesho, Nykaa.
//   • No marketplace outside that whitelist may appear in this file.
// ─────────────────────────────────────────────────────────────────────────────

export const AFFILIATE_LINKS: Record<string, string> = {
${lines}
};

/** Resolve the affiliate URL for a product id. '' when not configured. */
export function getAffiliateUrl(productId: string | undefined | null): string {
  if (!productId) return ''
  return AFFILIATE_LINKS[productId] || ''
}
`
writeFileSync(FILE, out)
const kept = [...existing.values()].filter(Boolean).length
console.log(`affiliate-links.ts: ${products.length} ids · ${kept} previously-configured link(s) preserved`)
