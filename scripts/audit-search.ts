import assert from 'node:assert/strict'
import fs from 'node:fs'
import {searchProducts,filterProducts,products} from '../src/data/products'
import {searchLooks} from '../src/data/looks'
const rows=[]
for(const q of ['garba women','garba men','navratri women','navratri men','college fest women','college fest men','diwali outfit','festive party','chaniya choli','lehenga','sharara','gharara','saree','pre draped saree','kurta men','printed kurta','black festive kurta']){
 const result=searchProducts(q,1000);assert(result.length>0,q)
 const gender=q.split(' ').find(t=>t==='men'||t==='women');if(gender)assert(result.every(p=>p.gender===gender),`${q}: gender leak`)
 const world=['Garba','Navratri','College Fest','Diwali','Festive Party'].find(w=>q.includes(w.toLowerCase()));if(world)assert(result.every(p=>p.occasions.includes(world)),q)
 rows.push({query:q,results:result.length,pass:true})
}
for(const q of ['traditional couple','garba couple']){const r=searchLooks(q,1000);assert(r.length>0,q);assert(r.every(l=>l.gender==='couple'));if(q==='garba couple'){assert.equal(r.length,20);assert(r.every(l=>l.occasions.includes('Garba')))}rows.push({query:q,results:r.length,pass:true})}
assert(searchProducts('women').every(p=>p.gender==='women'));assert(searchProducts('men').every(p=>p.gender==='men'))
assert(searchProducts('kurta men under 1000').every(p=>p.gender==='men'&&p.price<=1000))
// Contextual category facets must equal the actual category counts for the scope.
for(const scope of ['women','men'] as const){const f={scope,occasion:'Garba'};const {facets,items:pool}=filterProducts(f);for(const opt of facets.find(g=>g.key==='category')?.options||[])assert.equal(opt.count,pool.filter(p=>p.category===opt.value).length);assert(pool.every(p=>p.gender===scope))}
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/search.json',JSON.stringify({cases:rows,genderTokenSafe:true,contextualFacets:true,productCount:products.length},null,2)+'\n');console.log(`PASS ${rows.length} intent queries; gender isolation and contextual facets`)
