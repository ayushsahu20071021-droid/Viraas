#!/usr/bin/env node
/**
 * HTTP/image audit for the production preview. It exercises the required
 * routes and then checks every catalog-declared primary/gallery image over
 * HTTP, so a successful HTML shell cannot hide a broken visual asset.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
const routes = ['/', '/women', '/men?category=garba', '/occasions/garba', '/occasions/navratri', '/occasions/diwali', '/occasions/college-fest', '/couple-edit', '/accessories']
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const looks = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/looks.json'), 'utf8'))
const couples = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/couples.json'), 'utf8'))
const requiredImages = [
  '/images/hero-main.jpg', '/images/hero-women.jpg', '/images/hero-men.jpg', '/images/accessories-flatlay.jpg',
  '/images/occasion-navratri.jpg', '/images/occasion-diwali.jpg', '/images/occasion-college.jpg',
  ...products.flatMap((p) => [p.imageUrl, ...(p.gallery || [])]),
  ...looks.flatMap((l) => [l.imageUrl, ...(l.altImages || [])]),
  ...couples.map((c) => c.imageUrl),
]
const errors = []
const uniqueImages = [...new Set(requiredImages.filter(Boolean))]
for (const route of routes) {
  try {
    const res = await fetch(base + route)
    const html = await res.text()
    if (!res.ok) errors.push(`${route}: HTTP ${res.status}`)
    if (!html.includes('<div id="root">')) errors.push(`${route}: root mount missing`)
    console.log(`HTTP OK ${route}`)
  } catch (e) {
    errors.push(`${route}: ${e.message}`)
  }
}
for (const src of uniqueImages) {
  try {
    const asset = await fetch(base + src)
    const contentType = asset.headers.get('content-type') || ''
    if (!asset.ok) errors.push(`${src} -> HTTP ${asset.status}`)
    else if (!contentType.startsWith('image/')) errors.push(`${src} -> ${contentType || 'missing content-type'}`)
  } catch (e) { errors.push(`${src}: ${e.message}`) }
}
console.log(`Checked ${uniqueImages.length} unique catalog images over HTTP`)
if (errors.length) { console.error(errors.slice(0, 50).join('\n')); process.exit(1) }
console.log(`✓ HTTP/image audit passed for ${routes.length} public routes and ${uniqueImages.length} images`)
