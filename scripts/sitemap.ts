import fs from 'node:fs'
import assert from 'node:assert/strict'
import {products} from '../src/data/products'
import {allLooks} from '../src/data/looks'
import {occasions} from '../src/data/occasions'
import {articles} from '../src/data/articles'
const routes=['/','/women','/men','/accessories','/couple-edit','/trending','/journal','/occasions','/about','/contact','/faq','/try-on','/ai-try-on-privacy','/affiliate-disclosure','/privacy','/terms',...occasions.map(o=>`/occasions/${o.id}`),...products.map(p=>`/product/${p.id}`),...allLooks.map(l=>`/look/${l.id}`),...articles.map(a=>`/journal/${a.slug}`)]
assert.equal(new Set(routes).size,routes.length)
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>https://viraas.in${r}</loc></url>`).join('\n')}\n</urlset>\n`
if(process.argv.includes('--check'))assert.equal(fs.readFileSync('public/sitemap.xml','utf8'),xml,'Sitemap is stale or has ghost routes')
else fs.writeFileSync('public/sitemap.xml',xml)
console.log(`${routes.length} unique sitemap URLs; exactly ${occasions.length} occasion pages; ${products.length} product + ${allLooks.length} look routes`)
