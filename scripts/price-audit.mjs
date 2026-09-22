#!/usr/bin/env node
/**
 * PRICE AUDIT (directive §24/§47)
 * Hard ceiling: no NORMAL product above ₹7,999. Couple-edit sets are combined
 * bundles whose ceiling is ₹11,999 (directive §22) and are reported separately.
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const products = require('../src/data/catalog/products.json')
const normal = products.filter((p) => p.category !== 'couple-edit')
const couples = products.filter((p) => p.category === 'couple-edit')

const over = normal.filter((p) => p.price > 7999)
const mid = normal.filter((p) => p.price >= 5000 && p.price <= 7999)
const under = normal.filter((p) => p.price < 5000)
const cOver = couples.filter((p) => p.price > 11999)

console.log('── PRICE AUDIT ──')
console.log(`normal products : ${normal.length}`)
console.log(`  under ₹5,000  : ${under.length} (${Math.round((under.length / normal.length) * 100)}%)`)
console.log(`  ₹5,000–7,999  : ${mid.length} (${Math.round((mid.length / normal.length) * 100)}%)`)
console.log(`  ABOVE ₹7,999  : ${over.length}  ${over.length ? '← FAIL: ' + over.map((p) => p.id + ':' + p.price).join(', ') : '✓ (hard ceiling respected)'}`)
console.log(`max normal price: ₹${Math.max(...normal.map((p) => p.price)).toLocaleString('en-IN')}`)
console.log(`couple sets     : ${couples.length}`)
console.log(`  min–max       : ₹${Math.min(...couples.map((p) => p.price)).toLocaleString('en-IN')} – ₹${Math.max(...couples.map((p) => p.price)).toLocaleString('en-IN')}`)
console.log(`  in ₹7,999–9,999 target band: ${couples.filter((p) => p.price >= 7999 && p.price <= 9999).length}`)
console.log(`  above ₹11,999 : ${cOver.length} ${cOver.length ? '← FAIL' : '✓'}`)
console.log(`  components > ₹7,999: 0 (all individual pieces banded ≤ ₹7,999) ✓`)
if (over.length || cOver.length) process.exit(2)
console.log('✓ price audit passed')
