import assert from 'node:assert/strict'
import fs from 'node:fs'
import {products} from '../src/data/products'
import {affiliateLinks,getAffiliateUrl,resolveShopUrl} from '../src/data/affiliate-links'
assert.deepEqual(Object.keys(affiliateLinks).sort(),products.map(p=>p.id).sort())
for(const p of products){
 const configured=affiliateLinks[p.id].trim()
 if(configured) assert.equal(getAffiliateUrl(p.id),configured,'Manually configured affiliate URL must be safe HTTPS')
 assert.equal(resolveShopUrl(p),configured||p.merchantUrl)
 if(process.env.REQUIRE_EMPTY_AFFILIATES==='1')assert.equal(configured,'')
}
assert.equal(getAffiliateUrl('missing'),'')
for(const file of ['src/components/ProductCard.tsx','src/components/TryOnModal.tsx','src/pages/ProductPage.tsx','src/pages/LookPage.tsx']) assert(fs.readFileSync(file,'utf8').includes('resolveShopUrl('),file)
console.log(`PASS ${products.length}/${products.length} affiliate keys, ${Object.values(affiliateLinks).filter(Boolean).length} manually configured; all four shop surfaces use central resolver`)
