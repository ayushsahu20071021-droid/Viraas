#!/usr/bin/env node
/** Explicit human-review gate. Publishing a candidate never uses filename uniqueness as proof. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
const reviewFile=process.argv[2];assert(reviewFile,'Usage: node scripts/promote-image.mjs path/to/review.json')
const review=JSON.parse(fs.readFileSync(reviewFile,'utf8'))
const qfile='src/data/catalog/generation-queue.json',q=JSON.parse(fs.readFileSync(qfile,'utf8'))
const job=q.jobs.find(j=>j.id===review.id);assert(job,'Unknown job')
assert(review.reviewer && review.referencePanels?.length,'Named reviewer and inspected reference panels required')
for(const field of ['metadata','silhouette','colour','occasion','anatomy','fullOutfit','uniqueComposition','referenceMatch'])assert.equal(review[field],true,`${field} did not pass`)
if(job.kind==='couple'){assert.equal(review.youngAdultHumans,true);assert.equal(review.exactlyTwoPrimaryPeople,true);assert.equal(review.productCompatibility,true)}
const bytes=fs.readFileSync(job.target),sha=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(review.sha256,sha,'Review is stale')
assert.equal(review.perceptualAuditPassed,true,'Run and review the perceptual audit first')
const pfile='src/data/catalog/products.json',cfile='src/data/catalog/couples.json'
const products=JSON.parse(fs.readFileSync(pfile,'utf8')),couples=JSON.parse(fs.readFileSync(cfile,'utf8'))
const items=job.kind==='product'?products:couples,record=items.find(x=>x.id===job.id);assert(record)
if(job.kind==='couple')for(const id of [...record.herProductIds,...record.hisProductIds])assert.equal(products.find(p=>p.id===id)?.visualStatus,'APPROVED',`Linked garment ${id} must be approved first`)
record.imageUrl='/'+job.target.replace(/^public\//,'');record.visualStatus='APPROVED';record.generatedImageUrl=record.imageUrl
if(job.kind==='product')record.gallery=[record.imageUrl]
job.status='approved';job.qa={metadata:true,anatomy:true,age:job.kind==='couple'?true:null,referenceMatch:true,unique:true};job.review=review
// Save all inputs before normalizing the derived indexes. Roll back on any failure.
const outputs=new Map([[pfile,products],[cfile,couples],[qfile,q]])
const backups=new Map([...new Set([...outputs.keys(),'src/data/catalog/looks.json','src/data/catalog/image-manifest.json','public/sitemap.xml','docs/price-research.md','docs/audits/price-mapping.json'])].filter(f=>fs.existsSync(f)).map(f=>[f,fs.readFileSync(f)]))
try{
 for(const [f,data]of outputs){fs.writeFileSync(f+'.tmp',JSON.stringify(data,null,1)+'\n');fs.renameSync(f+'.tmp',f)}
 const result=spawnSync('npm',['run','generate-catalog'],{stdio:'inherit'});assert.equal(result.status,0,'Derived data regeneration failed')
}catch(error){for(const [f,bytes]of backups)fs.writeFileSync(f,bytes);throw error}
console.log(`Promoted reviewed original ${job.id}. Full-site acceptance still requires all remaining gates.`)
