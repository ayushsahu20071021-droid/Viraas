#!/usr/bin/env node
// Pixel-content and perceptual audit: renaming, JPEG metadata and colour shifts do not confer uniqueness.
import fs from 'node:fs'
import crypto from 'node:crypto'
import sharp from 'sharp'
const read=n=>JSON.parse(fs.readFileSync(`src/data/catalog/${n}.json`,'utf8'))
const products=read('products'),couples=read('couples'),queue=read('generation-queue')
const errors=[],cache=new Map()
const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const bits=a=>a.reduce((n,b)=>(n<<1n)|BigInt(b),0n)
const distance=(a,b)=>{let n=a^b,c=0;while(n){n&=n-1n;c++}return c}
const cos=Array.from({length:8},(_,u)=>Array.from({length:32},(_,x)=>Math.cos((2*x+1)*u*Math.PI/64)))
async function fingerprint(url){
 if(cache.has(url))return cache.get(url)
 if(/\.svg$/i.test(url)) throw new Error('SVG primary')
 const buf=fs.readFileSync('public'+url),image=sharp(buf),meta=await image.metadata()
 if(!['jpeg','png','webp'].includes(meta.format))throw new Error('not raster')
 if(meta.width<300||meta.height<400)throw new Error(`too small ${meta.width}x${meta.height}`)
 const ratio=meta.width/meta.height;if(Math.min(Math.abs(ratio-.75),Math.abs(ratio-.8))>.025)throw new Error(`not 3:4 or 4:5 (${meta.width}x${meta.height})`)
 const pixel=await image.clone().rotate().removeAlpha().raw().toBuffer()
 const gray=await image.clone().resize(32,32,{fit:'fill'}).greyscale().raw().toBuffer()
 const values=[];for(let u=0;u<8;u++)for(let v=0;v<8;v++){let sum=0;for(let x=0;x<32;x++)for(let y=0;y<32;y++)sum+=gray[y*32+x]*cos[u][x]*cos[v][y];values.push(sum)}
 const median=[...values.slice(1)].sort((a,b)=>a-b)[31];const phash=bits(values.slice(1).map(v=>v>median))
 const small=await image.clone().resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer();const d=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++)d.push(small[y*9+x]>small[y*9+x+1]);
 const result={bytes:hash(buf),pixels:hash(pixel),phash,dhash:bits(d),width:meta.width,height:meta.height};cache.set(url,result);return result
}
async function audit(name,items){
 const rows=[]
 for(const p of items)try{rows.push({id:p.id,imageUrl:p.imageUrl,...await fingerprint(p.imageUrl)})}catch(e){errors.push(`${p.id}: ${e.message}`)}
 const groups=key=>{const m=new Map();for(const r of rows)m.set(r[key],[...(m.get(r[key])||[]),r.id]);return [...m.values()].filter(v=>v.length>1)}
 const exact=groups('bytes'),pixels=groups('pixels'),near=[]
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  const a=rows[i],b=rows[j];if(a.bytes===b.bytes||a.pixels===b.pixels)continue
  const pd=distance(a.phash,b.phash),dd=distance(a.dhash,b.dhash)
  if(pd<=10||dd<=7)near.push({a:a.id,b:b.id,pHashDistance:pd,dHashDistance:dd})
 }
 const result={total:items.length,decodablePortraits:rows.length,uniqueMappings:new Set(items.map(p=>p.imageUrl)).size,uniqueByteHashes:new Set(rows.map(r=>r.bytes)).size,uniquePixelHashes:new Set(rows.map(r=>r.pixels)).size,svgPrimaries:items.filter(p=>/\.svg$/i.test(p.imageUrl)).length,exactDuplicateGroups:exact,pixelDuplicateGroups:pixels,nearDuplicatePairCount:near.length,nearDuplicateExamples:near.slice(0,40),manualApprovalCount:items.filter(p=>p.visualStatus==='APPROVED').length}
 if(exact.length||pixels.length||near.length)errors.push(`${name}: ${exact.length} exact duplicate groups; ${near.length} perceptual near-duplicate pairs need review`)
 return result
}
const report={date:'2026-09-23',method:'SHA256 file + decoded pixels; 63-bit DCT pHash <=10 or 64-bit dHash <=7. Near matches require human review, not automatic uniqueness claims.',products:await audit('products',products),couples:await audit('couples',couples)}
const candidates=queue.jobs.filter(j=>j.calibration&&fs.existsSync(j.target)).map(j=>({id:j.id,imageUrl:'/'+j.target.replace(/^public\//,'')}))
report.calibration=await audit('calibration',candidates)
// Hero/editorial reuse is reported separately: not all reuse is a product-primary collision.
const src=fs.readFileSync('src/data/occasions.ts','utf8');const heroes=[...src.matchAll(/O\('([^']+)'[^\n]*?'(\/images\/[^']+)'/g)].map(m=>({id:m[1],imageUrl:m[2]}))
report.occasionHeroMappings=heroes;report.reusedOccasionHeroPaths=heroes.filter((h,i)=>heroes.findIndex(x=>x.imageUrl===h.imageUrl)!==i)
report.referenceGate=queue.referenceStatus
report.errors=errors
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/images.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({products:{valid:report.products.decodablePortraits,unique:report.products.uniqueByteHashes,total:products.length},couples:{valid:report.couples.decodablePortraits,unique:report.couples.uniqueByteHashes,nearPairs:report.couples.nearDuplicatePairCount,total:couples.length},calibration:report.calibration.total,errors},null,2))
if(errors.length)process.exitCode=1
