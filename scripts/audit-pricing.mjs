import fs from 'node:fs'
const p=JSON.parse(fs.readFileSync('src/data/catalog/products.json','utf8'))
const pending=p.filter(p=>!p.priceEvidenceId||p.priceBasis!=='market-comparable-estimate')
console.log(`Pricing: ${p.length-pending.length}/653 family-comparable estimates; ${pending.length} require research; exact verified SKUs: 0`)
if(pending.length)process.exitCode=1
