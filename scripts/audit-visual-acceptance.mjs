import fs from 'node:fs'
const read=n=>JSON.parse(fs.readFileSync(`src/data/catalog/${n}.json`,'utf8'))
const q=read('generation-queue'),p=read('products'),c=read('couples')
const approved=q.jobs.filter(j=>j.status==='approved'&&Object.values(j.qa).every(v=>v===true||v===null))
const errors=[]
if(approved.length!==753)errors.push(`${approved.length}/753 image jobs approved; generation and human visual review outstanding`)
if(q.calibrationGate!=='passed')errors.push('Ten-image calibration/reference gate has not passed')
if(p.some(x=>x.visualStatus!=='APPROVED')||c.some(x=>x.visualStatus!=='APPROVED'))errors.push('Catalog still contains unapproved primary images')
console.log(errors.length?`BLOCKED\n${errors.join('\n')}`:'PASS visual review records and calibration gate')
if(errors.length)process.exitCode=1
