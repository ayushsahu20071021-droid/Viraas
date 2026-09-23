#!/usr/bin/env node
import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=n=>JSON.parse(fs.readFileSync(`src/data/catalog/${n}.json`,'utf8'))
const products=read('products'),couples=read('couples'),looks=read('looks')
const worlds=['Garba','Navratri','College Fest','Diwali','Festive Party']
const merchantHosts={Myntra:'myntra.com',AJIO:'ajio.com',Flipkart:'flipkart.com',Shopsy:'shopsy.in',Meesho:'meesho.com',Nykaa:'nykaa.com'}
const women=['chaniya-choli','lehenga','sharara','gharara','sarees','pre-draped-saree','anarkali','kurta-sets','jewellery','bags','footwear','beauty']
const men=['traditional-kurta','festive-kurta-set','printed-ethnic-shirt','embroidered-ethnic-shirt','traditional-festive-set','garba-navratri-traditional','footwear','accessories']
const errors=[];const check=(v,m)=>{if(!v)errors.push(m)}
check(products.length===653,'Expected exactly 653 products')
check(couples.length===100,'Expected exactly 100 couples')
const byId=new Map(products.map(p=>[p.id,p]));check(byId.size===653,'Duplicate IDs')
for(const p of products){
 check(Number.isFinite(p.price)&&p.price>0&&p.price<=7999,`${p.id}: price outside ceiling`)
 check(p.title?.length && p.silhouette?.length,`${p.id}: missing garment fields`)
 check((p.gender==='women'?women:men).includes(p.category),`${p.id}: invalid category/gender`)
 check(p.gender==='women'||p.gender==='men',`${p.id}: synthetic bundle is not a product`)
 check(p.occasions.length>0 && p.occasions.every(o=>worlds.includes(o)) && new Set(p.occasions).size===p.occasions.length,`${p.id}: invalid occasions`)
 check(p.status==='CHECK',`${p.id}: unverified inventory cannot claim live status`)
 check(!p.rating&&!p.reviews&&!p.stock&&!p.bestseller,`${p.id}: fabricated social/inventory fields`)
 check(p.affiliateUrl==='',`${p.id}: affiliate URL belongs only in central map`)
 try{const url=new URL(p.merchantUrl),host=merchantHosts[p.merchantLabel];check(host&&(url.hostname===host||url.hostname===`www.${host}`)&&url.protocol==='https:'&&url.pathname!=='/',`${p.id}: invalid merchant destination`)}catch{errors.push(`${p.id}: malformed merchant URL`)}
 check(p.merchantLabel!=='Nykaa'||p.category==='beauty',`${p.id}: Nykaa assigned to unsupported category`)
 check(/\.(jpg|jpeg|webp|png)$/.test(p.imageUrl)&&fs.existsSync('public'+p.imageUrl),`${p.id}: missing raster primary`)
}
for(const world of worlds)check(couples.filter(c=>c.occasions.length===1&&c.occasions[0]===world).length===20,`${world}: count must be 20`)
for(const c of couples){
 check(c.herProductIds.length>0&&c.hisProductIds.length>0,`${c.id}: missing anchors`)
 for(const [gender,ids] of [['women',c.herProductIds],['men',c.hisProductIds]])for(const id of ids){const p=byId.get(id);check(p&&p.gender===gender&&p.occasions.includes(c.world),`${c.id}: incompatible product ${id}`)}
 const ids=[...c.herProductIds,...c.hisProductIds];check(new Set(ids).size===ids.length,`${c.id}: duplicate product assignment`)
 check(c.price===ids.reduce((s,id)=>s+(byId.get(id)?.price||0),0),`${c.id}: capped/inaccurate bundle price`)
}
for(const l of looks){check(l.productIds.every(id=>byId.has(id)),`${l.id}: missing product`);check(l.price===l.productIds.reduce((s,id)=>s+(byId.get(id)?.price||0),0),`${l.id}: wrong sum`);check(l.occasions.every(o=>worlds.includes(o)),`${l.id}: obsolete world`)}
const manifest=read('image-manifest');check(manifest.productPrimaries.length===653 && manifest.couplePrimaries.length===100,'Manifest coverage')
for(const p of products)check(manifest.productPrimaries.find(m=>m.id===p.id)?.imageUrl===p.imageUrl,`${p.id}: stale manifest`)
console.log(`Catalog: ${products.length} products; ${couples.length} couples; ${JSON.stringify(Object.fromEntries(worlds.map(w=>[w,couples.filter(c=>c.world===w).length])))}`)
assert.equal(errors.length,0,errors.join('\n'))
console.log('PASS data relationships, taxonomy, prices, merchants. This is NOT a visual acceptance claim.')
