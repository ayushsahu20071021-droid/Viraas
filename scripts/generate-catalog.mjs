#!/usr/bin/env node
/** Incremental, deterministic normalization of the EXISTING catalog. Never synthesizes images.
 * Validates all records and references before atomic per-file writes; rollback on write failure.
 * Original input is recoverable from .arena/backups and Git commit 6edbe57.
 */
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { evidence, checkedAt } from './price-evidence.mjs'
const root = path.resolve(import.meta.dirname, '..'); process.chdir(root)
const dir = 'src/data/catalog'
const read = name => JSON.parse(fs.readFileSync(`${dir}/${name}.json`, 'utf8'))
const products = read('products'), looks = read('looks'), couples = read('couples')
const oldIds = products.map(p=>p.id).sort()
assert.equal(products.length,653); assert.equal(couples.length,100)
const worlds = ['Garba','Navratri','College Fest','Diwali','Festive Party']
const labels = {'chaniya-choli':'Chaniya Choli',lehenga:'Lehenga',sharara:'Sharara',gharara:'Gharara',sarees:'Saree','pre-draped-saree':'Pre-Draped Saree',anarkali:'Anarkali','kurta-sets':'Kurta Set','traditional-kurta':'Traditional Kurta','festive-kurta-set':'Festive Kurta Set','printed-ethnic-shirt':'Printed Ethnic Shirt','embroidered-ethnic-shirt':'Embroidered Ethnic Shirt','traditional-festive-set':'Traditional Festive Set','garba-navratri-traditional':'Garba/Navratri Traditional',footwear:'Footwear',jewellery:'Jewellery',bags:'Bags',beauty:'Beauty',accessories:'Accessories'}
const colours = ['Black','Burgundy','Navy','Deep Green','Ivory','Wine','White','Indigo']
const womenColours = ['Rani Pink','Black','Navy','Ivory','Red','Green','Purple','White']
for (let i=0;i<products.length;i++) {
 const p=products[i]
 if (!p.catalogRevision) {
  const text=`${p.subCategory} ${p.silhouette}`.toLowerCase()
  let cat=p.category, changed=false
  if (p.gender==='couple') { p.gender=i%2?'men':'women'; cat=p.gender==='men'?'traditional-kurta':'chaniya-choli'; changed=true; delete p.herProductId; delete p.hisProductId }
  else if (p.gender==='women' && !['jewellery','footwear','bags','beauty'].includes(cat)) {
   if (/chaniya|navratri flared/.test(text) || cat==='garba') cat='chaniya-choli'
   else if (/gharara/.test(text)) cat='gharara'
   else if (/sharara/.test(text)) cat='sharara'
   else if (/anarkali/.test(text)) cat='anarkali'
   else if (/pre-draped|drape gown|draped saree/.test(text)) cat='pre-draped-saree'
   else if (cat==='sarees' && !/half-saree/.test(text)) cat='sarees'
   else if (cat==='lehenga' && !/mermaid|short|separate/.test(text)) cat='lehenga'
   else if (/co-ord|fusion|gown|jeans|shirt dress|half-saree|mermaid|short lehenga|separate/.test(text) || cat==='indowestern') {cat=['chaniya-choli','sharara','gharara','anarkali','kurta-sets'][i%5];changed=true}
   else cat='kurta-sets'
  } else if (p.gender==='men' && !['footwear','accessories','watches'].includes(cat)) {
   if(cat==='garba') {cat=i%3===0?'garba-navratri-traditional':'traditional-kurta'; changed=true}
   else if(/shirt|co-ord/.test(text)) {cat=i%2?'printed-ethnic-shirt':'embroidered-ethnic-shirt';changed=true}
   else if(/sherwani|bandhgala|jacket|coat|waistcoat/.test(text)) {cat='traditional-festive-set';changed=true}
   else {cat=i%3===0?'traditional-kurta':'festive-kurta-set';changed=true}
  } else if(cat==='watches') cat='accessories'
  if (p.gender==='men' && /safa|pagdi|groom|sherwani brooch/.test(text)) {p.subCategory='Printed Festive Stole';p.silhouette='Rectangular stole';p.fabric='Cotton';p.embroidery='Woven border';p.pattern='Ajrakh print';p.colour=colours[i%8];changed=true}
  p.category=cat
  if(changed && !['accessories'].includes(cat)) {
   p.subCategory=labels[cat];p.silhouette=labels[cat]
   p.fabric=['Cotton','Cotton blend','Viscose rayon','Silk blend'][i%4]
   p.colour=p.gender==='men'?colours[i%8]:womenColours[i%8]
   p.secondaryColour=p.gender==='men'?'Ivory':['Blue','Red','Pink','Multicolour'][i%4]
   delete p.weave
   p.pattern=['Bandhani print','Ajrakh print','Geometric print','Floral print'][i%4]
   p.embroidery=cat==='chaniya-choli'?'Kutchi-inspired thread embroidery and selective mirror work':cat==='printed-ethnic-shirt'?'None':['Thread embroidery at neckline','Embroidered cuffs and placket','Tone-on-tone embroidery','Selective mirror-work border'][i%4]
  }
  // The existing price/brand tables were synthetic: do not imply verified inventory.
  p.brand='';p.originalPrice=null;p.status='CHECK';p.ageGroup=[18,21,25,30]
  p.occasions=[...new Set(p.occasions)].filter(o=>worlds.includes(o))
  if(cat==='chaniya-choli'||cat==='garba-navratri-traditional') p.occasions=['Garba','Navratri','College Fest']
  else if(p.gender==='men' && !['accessories','footwear'].includes(cat)) p.occasions= i%3===0?['Garba','Navratri','College Fest']:['College Fest','Diwali','Festive Party']
  else if(p.gender==='women' && !['jewellery','bags','footwear','beauty'].includes(cat)) p.occasions=['College Fest','Diwali','Festive Party']
  p.styleTags=['Traditional','Festive',...(p.pattern && p.pattern!=='None'?['Printed']:[])]
  const craft=p.embroidery && p.embroidery!=='None'?'Embroidered':p.pattern?'Printed':''
  if(!['jewellery','bags','footwear','beauty','accessories'].includes(cat)) p.title=`${p.colour} ${craft} ${labels[cat]}`.replace(/\s+/g,' ').trim()
  p.title=p.title.replace(/Shyades/g,'Shades').replace(/Itri/g,'Attar').replace(/Sherwani/g,'Festive')
  p.description=`${p.title}. Styling concept in ${p.fabric.toLowerCase()} with ${p.embroidery||p.pattern||p.weave||'a clean finish'}. Suggested for ${p.occasions.join(', ')}. Original AI editorial illustration, not a verified retailer SKU; confirm material, included pieces, sizes and availability at the merchant.`
  p.inHouseTryOn=!['jewellery','bags','footwear','beauty','accessories'].includes(cat)
  p.visualStatus='PENDING_REPLACEMENT'
  p.catalogRevision=2
 }
 const cat=p.category
 p.styleTags=['Traditional','Festive',...(p.pattern&&p.pattern!=='None'?['Printed']:[]),...(/mirror|stone|bead|sequin/i.test(p.embroidery||'')?['Statement']:[])]
 if(p.inHouseTryOn) p.subCategory=`${p.fabric} ${labels[cat]}`
 const family=cat==='traditional-kurta'?'men-kurta':['festive-kurta-set','traditional-festive-set','garba-navratri-traditional'].includes(cat)?'men-set':cat==='printed-ethnic-shirt'?'men-shirt':['chaniya-choli','lehenga'].includes(cat)?'chaniya':cat==='sarees'?'saree':cat==='pre-draped-saree'?cat:['kurta-sets','sharara'].includes(cat)?'women-set':['anarkali','gharara'].includes(cat)?cat:null
 const ev=evidence[family]
 if(ev) {
  // More elaborate construction maps to the upper observed family band, never a fake SKU quote.
  const detail=`${p.embroidery||''} ${p.weave||''}`.toLowerCase()
  const tier=/mirror|zardozi|stone|bead|sequin/.test(detail)?3:/embroid|thread|zari|resham/.test(detail)?2:p.pattern?1:0
  p.price=ev.prices[tier];p.priceBasis='market-comparable-estimate';p.priceEvidenceId=family;p.lastChecked=checkedAt;p.merchantLabel=ev.merchant
 } else {p.priceBasis='legacy-unverified';p.priceEvidenceId=null;p.lastChecked=null}
 p.currency='INR';p.affiliateUrl='';p.affiliateSource='EarnKaro (not configured)';p.generatedImageUrl=p.imageUrl
 if(p.merchantLabel==='Nykaa' && p.category!=='beauty') p.merchantLabel='Myntra'
 const q=encodeURIComponent(`${p.gender} ${p.colour} ${p.subCategory}`)
 p.merchantUrl=({Myntra:`https://www.myntra.com/${encodeURIComponent(`${p.gender} ${p.subCategory}`.toLowerCase().replace(/[^a-z0-9]+/g,'-'))}`,AJIO:`https://www.ajio.com/search/?text=${q}`,Flipkart:`https://www.flipkart.com/search?q=${q}`,Shopsy:`https://www.shopsy.in/search?q=${q}`,Meesho:`https://www.meesho.com/search?q=${q}`,Nykaa:`https://www.nykaa.com/search/result/?q=${q}`})[p.merchantLabel]
 p.notes=`CHECK: ${ev?'Family-level market-comparable estimate, not an exact matched SKU. Evidence: '+family+' checked '+checkedAt+'.':'Price research pending for this specific product family; inherited price is unverified.'} Affiliate link not configured. Visual replacement/approval tracked separately in generation-queue.json.`
 p.gallery=[p.imageUrl]
 assert(p.price>0 && p.price<=7999); assert(labels[p.category]); assert(p.occasions.length)
}
const byId=new Map(products.map(p=>[p.id,p]))
// Rebuild only pair relationships which were demonstrably unrelated in the legacy generator.
for(const [wi,world] of worlds.entries()) {
 const group=couples.filter(c=>c.occasions[0]===world);assert.equal(group.length,20)
 const pool=g=>products.filter(p=>p.gender===g && p.inHouseTryOn && p.occasions.includes(world))
 const women=pool('women'),men=pool('men');assert(women.length && men.length)
 group.forEach((c,i)=>{
  if(!c.catalogRevision) {
   const her=women[(i*7+wi)%women.length],his=men[(i*11+wi)%men.length]
   c.herProductIds=[her.id];c.hisProductIds=[his.id];c.catalogRevision=2;c.visualStatus='PENDING_REPLACEMENT'
  }
  const her=byId.get(c.herProductIds[0]),his=byId.get(c.hisProductIds[0])
  c.price=[...c.herProductIds,...c.hisProductIds].reduce((s,id)=>s+byId.get(id).price,0)
  c.title=`${her.colour} × ${his.colour} · ${String(i+1).padStart(2,'0')}`
  c.description=`${her.title} with ${his.title}. Complementary colours, relaxed festive styling. Both looks are priced separately; no bundle discount.`
  c.world=world;c.metadata={...c.metadata,world,palette:[her.colour,his.colour],legacyCompositionUnverified:true}
 })
}
for(const l of looks){
 assert(l.productIds.every(id=>byId.has(id)))
 const anchor=byId.get(l.productIds[0]); l.occasions=anchor.occasions;l.imageUrl=anchor.imageUrl;l.altImages=[]
 l.title=`${anchor.colour} ${labels[anchor.category]} Edit`;l.description=`${anchor.title}, paired with ${l.productIds.slice(1).map(id=>byId.get(id).title).join(', ')}. Reference styling; verify every item at the merchant.`
 l.price=l.productIds.reduce((s,id)=>s+byId.get(id).price,0)
 l.merchantUrls=[...new Set(l.productIds.map(id=>byId.get(id).merchantUrl))];l.merchantLabels=[...new Set(l.productIds.map(id=>byId.get(id).merchantLabel))]
}
assert.deepEqual(products.map(p=>p.id).sort(),oldIds)
assert.equal(new Set(oldIds).size,653)
const manifest={generatedAt:checkedAt,productPrimaryCount:653,couplePrimaryCount:100,productPrimaryFormat:'jpg',couplePrimaryFormat:'jpg',visualAcceptance:'BLOCKED_PENDING_IMAGE_REPLACEMENT',productPrimaries:products.map(p=>({id:p.id,imageUrl:p.imageUrl,category:p.category,gender:p.gender})),couplePrimaries:couples.map(c=>({id:c.id,imageUrl:c.imageUrl,occasions:c.occasions,metadata:c.metadata}))}
const output=new Map([['products',products],['couples',couples],['looks',looks],['image-manifest',manifest]].map(([name,data])=>[`${dir}/${name}.json`,JSON.stringify(data,null,1)+'\n']))
const backups=new Map([...output.keys()].map(file=>[file,fs.readFileSync(file)]))
fs.mkdirSync('.arena/backups',{recursive:true})
try {
 for(const [file,data] of output){JSON.parse(data);fs.writeFileSync(`${file}.tmp`,data); const backup=`.arena/backups/${path.basename(file)}`;if(!fs.existsSync(backup)) fs.writeFileSync(backup,backups.get(file))}
 for(const file of output.keys()) fs.renameSync(`${file}.tmp`,file)
} catch(err){for(const [file,data] of backups)fs.writeFileSync(file,data);throw err}
console.log('Normalized 653 preserved IDs; 100 couples, 20 per world. Images not synthesized or relabelled as approved.')
