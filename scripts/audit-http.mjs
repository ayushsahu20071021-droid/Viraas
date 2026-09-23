#!/usr/bin/env node
import fs from 'node:fs'
const base=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'')
const read=n=>JSON.parse(fs.readFileSync(`src/data/catalog/${n}.json`,'utf8'))
const products=read('products'),looks=read('looks'),couples=read('couples')
const routes=[...fs.readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>https:\/\/viraas.in([^<]*)<\/loc>/g)].map(m=>m[1]||'/')
const images=[...new Set([...products.flatMap(p=>[p.imageUrl,...p.gallery]),...looks.map(l=>l.imageUrl),...couples.map(c=>c.imageUrl),...['hero-main','hero-women','hero-men','accessories-flatlay','occasion-navratri','occasion-college','occasion-diwali','occasion-festive'].map(n=>`/images/${n}.jpg`)])]
const errors=[]
async function pool(items,fn){let next=0;await Promise.all(Array.from({length:12},async()=>{while(next<items.length){const x=items[next++];try{await fn(x)}catch(e){errors.push(`${x}: ${e.message}`)}}}))}
await pool(routes,async route=>{const r=await fetch(base+route),html=await r.text();if(!r.ok||!r.headers.get('content-type')?.includes('text/html')||!html.includes('<div id="root">'))errors.push(`${route}: invalid app shell (${r.status})`)})
await pool(images,async src=>{const r=await fetch(base+src),b=new Uint8Array(await r.arrayBuffer());if(!r.ok||!r.headers.get('content-type')?.startsWith('image/')||b[0]!==255||b[1]!==216)errors.push(`${src}: invalid JPEG HTTP body (${r.status})`)})
const get=await fetch(base+'/api/try-on');if(get.status!==405)errors.push(`Try-On method handling: ${get.status}`)
const missing=await fetch(base+'/api/try-on',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(missing.status!==400)errors.push('Try-On missing product validation failed')
const demo=await fetch(base+'/api/try-on',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:products[0].id,garmentDescription:products[0].title})});const body=await demo.json();if(!demo.ok||body.status!=='demo'||body.resultImageUrl!==null)errors.push('Expected honestly labelled demo response')
const report={date:'2026-09-23',base,routes:routes.length,uniqueImages:images.length,api:{method:get.status,missingProduct:missing.status,demo:body.status},errors,scope:'HTTP app shells, JPEG content and existing demo API; route correctness separately tested in sitemap and Chromium. Merchant checkout not verified.'}
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/http.json',JSON.stringify(report,null,2)+'\n')
console.log(`HTTP: ${routes.length} sitemap routes, ${images.length} images, existing Try-On API; ${errors.length} errors`)
if(errors.length){console.error(errors.slice(0,50).join('\n'));process.exitCode=1}
