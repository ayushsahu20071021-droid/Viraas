#!/usr/bin/env node
/** Exact-five public occasion and Couple Edit contract audit. */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(join(ROOT, file), 'utf8')
const json = (file) => JSON.parse(read(file))
const worlds = ['Garba', 'Navratri', 'Diwali', 'Festive Party', 'College Fest']
const ids = ['garba', 'navratri', 'diwali', 'festive-party', 'college-fest']
const errors = []
const fail = (message) => errors.push(message)

const occasionsSource = read('src/data/occasions.ts')
const occasionIds = [...occasionsSource.matchAll(/O\(\s*'([^']+)'/g)].map((match) => match[1])
if (JSON.stringify(occasionIds) !== JSON.stringify(ids)) fail(`occasion source IDs are not exactly ${ids.join(', ')}`)
const app = read('src/App.tsx')
const appOccasionRoutes = [...app.matchAll(/path="\/occasions\/([^"/]+)"/g)].map((match) => match[1])
if (JSON.stringify(appOccasionRoutes) !== JSON.stringify(ids)) fail(`App occasion routes are not exactly ${ids.join(', ')}`)
if (app.includes('/occasions/:id')) fail('App still exposes a dynamic legacy occasion route')

const sitemap = read('public/sitemap.xml')
const sitemapOccasionRoutes = [...sitemap.matchAll(/<loc>[^<]*\/occasions\/([^<]+)<\/loc>/g)].map((match) => match[1]).sort()
if (JSON.stringify(sitemapOccasionRoutes) !== JSON.stringify([...ids].sort())) fail('sitemap does not contain exactly the five public occasion destinations')

const products = json('src/data/catalog/products.json')
const looks = json('src/data/catalog/looks.json')
const couples = json('src/data/catalog/couples.json')
const productTags = [...new Set(products.flatMap((product) => product.occasions || []))]
if (productTags.some((tag) => !worlds.includes(tag))) fail(`product catalog contains an obsolete occasion tag: ${productTags.find((tag) => !worlds.includes(tag))}`)
if (looks.some((look) => (look.occasions || []).some((tag) => !worlds.includes(tag)))) fail('curated looks contain an obsolete occasion tag')
if (couples.length !== 100) fail(`Couple Edit must have 100 records, got ${couples.length}`)
for (const world of worlds) {
  const count = couples.filter((couple) => couple.occasions?.[0] === world).length
  if (count !== 20) fail(`${world} Couple Edit count must be 20, got ${count}`)
}
if (new Set(couples.flatMap((couple) => couple.occasions || [])).size !== 5) fail('Couple Edit exposes more than five worlds')

if (read('src/components/Header.tsx').includes('All 18')) fail('header still exposes the obsolete All 18 occasion label')
if (read('src/pages/StaticPages.tsx').includes('All pairs')) fail('Couple Edit still exposes the obsolete lowercase all-pairs label')

console.log(`five-world audit: ${occasionIds.length} public occasions · ${couples.length} couple records · ${productTags.length} catalog tags`)
if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'))
  process.exit(1)
}
console.log('✓ public occasion system and Couple Edit are constrained to the five-world contract')
