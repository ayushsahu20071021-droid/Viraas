#!/usr/bin/env node
/** Register a generated candidate. Never silently publishes or approves it. */
import fs from 'node:fs'
import crypto from 'node:crypto'
import sharp from 'sharp'
const file='src/data/catalog/generation-queue.json'
const queue=JSON.parse(fs.readFileSync(file,'utf8'))
const ids=process.argv.slice(2)
if(!ids.length)throw new Error('Usage: node scripts/register-image.mjs <job-id> [job-id...]')
for(const id of ids){
 const job=queue.jobs.find(j=>j.id===id);if(!job)throw new Error(`Unknown job ${id}`)
 const bytes=fs.readFileSync(job.target),meta=await sharp(bytes).metadata()
 if(meta.format!=='jpeg'||Math.abs(meta.width/meta.height-.75)>.025)throw new Error(`${id}: expected 3:4 JPG`)
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex')
 if(queue.jobs.some(j=>j.id!==id&&j.attempts.some(a=>a.sha256===sha256)))throw new Error(`${id}: candidate bytes already assigned`)
 if(!job.attempts.some(a=>a.sha256===sha256))job.attempts.push({file:job.target,sha256,date:'2026-09-23',source:'image-generation-tool',currentPromptSpecHash:job.promptHash,notes:'Candidate generated from product metadata. Exact visual fidelity requires review; registration is not acceptance.'})
 job.status='generated-needs-review'
}
fs.writeFileSync(file+'.tmp',JSON.stringify(queue,null,1)+'\n');fs.renameSync(file+'.tmp',file)
console.log(`${ids.length} candidates registered; ${queue.jobs.filter(j=>j.status==='queued').length} queued; ${queue.jobs.filter(j=>j.status==='approved').length} approved`)
