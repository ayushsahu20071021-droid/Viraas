#!/usr/bin/env node
/** Real Chromium. Structural/interaction checks do NOT approve fashion images. */
import fs from 'node:fs'
import {launchBrowser} from './browser.mjs'
const base=process.env.BASE_URL||'http://127.0.0.1:4173'
const browser=await launchBrowser(),results=[],errors=[]
const routes=['/','/women','/men','/couple-edit','/occasions/garba','/occasions/navratri','/occasions/college-fest','/occasions/diwali','/occasions/festive-party','/product/w-saree-drape-01','/product/m-kurtiset-cotton-01','/look/couple-garba-01','/search?q=garba%20men','/search?q=garba%20couple','/journal','/saved','/trending','/accessories']
fs.mkdirSync('.arena/screenshots',{recursive:true})
try{
 for(const width of [375,1280]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage()
  page.on('pageerror',e=>errors.push(`JS ${e.message}`))
  for(const route of routes){
   await page.goto(base+route,{waitUntil:'networkidle'})
   await page.locator('main').waitFor({state:'visible',timeout:15000})
   await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{})}))})
   const measurements=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,images:[...document.images].length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelector('main h1')?.textContent,obsoleteLinks:[...document.querySelectorAll('a[href^="/occasions/"]')].map(a=>a.getAttribute('href')).filter(h=>!['/occasions/garba','/occasions/navratri','/occasions/college-fest','/occasions/diwali','/occasions/festive-party'].includes(h))}))
   if(measurements.overflow||measurements.broken.length||measurements.obsoleteLinks.length)errors.push(`${width} ${route}: ${JSON.stringify(measurements)}`)
   results.push({route,width,...measurements})
   await page.screenshot({path:`.arena/screenshots/${width}-${route.replace(/[^a-z0-9]+/gi,'-')||'home'}.png`})
  }
  await page.goto(base+'/couple-edit',{waitUntil:'networkidle'})
  for(const world of ['Garba','Navratri','College Fest','Diwali','Festive Party']){
   await page.getByRole('button',{name:new RegExp(`^${world} 20$`)}).click()
   const count=await page.getByRole('link',{name:'STYLE IT TOGETHER',exact:true}).count()
   if(count!==20)errors.push(`${width}: ${world} renders ${count}, expected 20`)
  }
  await page.getByRole('button',{name:'All 100',exact:true}).click()
  if(await page.getByRole('link',{name:'STYLE IT TOGETHER',exact:true}).count()!==100)errors.push('All 100 filter failed')
  await page.goto(base+'/search?q=garba%20couple',{waitUntil:'networkidle'})
  if(await page.getByText('No results for',{exact:false}).count())errors.push('Couple intent incorrectly shows empty-state')
  await page.evaluate(()=>localStorage.removeItem('viraas_saved_looks'))
  await page.goto(base+'/product/w-saree-drape-01',{waitUntil:'networkidle'})
  await page.getByRole('button',{name:'Save Look',exact:true}).last().click()
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('viraas_saved_looks')||'[]'))
  if(!saved.includes('w-saree-drape-01')) errors.push(`${width}: save did not persist`)
  await page.reload({waitUntil:'networkidle'})
  if(!(await page.getByRole('button',{name:'Saved',exact:true}).count()))errors.push('Saved state not restored')
  await page.getByRole('button',{name:'TRY THIS OUTFIT ON YOU',exact:true}).click()
  const dialog=page.getByRole('dialog',{name:'Try It On You'})
  if(await dialog.locator('input[type=file]').count())errors.push('Upload shown before adult gate')
  await dialog.getByRole('button',{name:'I am 18 or older — Continue',exact:true}).click()
  await dialog.locator('input[type=file]').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0kQAAAAASUVORK5CYII=','base64')})
  const request=page.waitForRequest(r=>r.url().endsWith('/api/try-on')&&r.method()==='POST')
  await dialog.getByRole('button',{name:'Generate Try-On',exact:true}).click()
  const payload=(await request).postDataJSON()
  if(payload.productId!=='w-saree-drape-01')errors.push('Try-On lost product context')
  await dialog.getByText('Your VIRAAS Look',{exact:true}).waitFor()
  if(!(await dialog.getByText('Demo Mode',{exact:true}).count()))errors.push('Demo not labelled')
  const overflow=await dialog.evaluate(el=>el.getBoundingClientRect().height>innerHeight || el.scrollWidth>el.clientWidth+1)
  if(overflow)errors.push(`${width}: Try-On dialog overflows viewport`)
  await dialog.getByRole('button',{name:'Close Try-On',exact:true}).click()
  await page.goto(base+'/occasions/wedding',{waitUntil:'networkidle'})
  if(!(await page.getByText('This page drifted off the runways').count()))errors.push('Deleted occasion not rejected')
  // Close contexts with browser at end; portable single-process Chromium cannot reopen after the last closes.
 }
}catch(e){errors.push(`Browser execution: ${e.message}`)}finally{await browser.close()}
const report={browser:'Chromium',date:'2026-09-23',routes:results,errors,visualApproval:false,scope:'Real DOM, images, responsive overflow, chips, couple search, deleted route; not human fashion acceptance'}
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/browser.json',JSON.stringify(report,null,2)+'\n')
console.log(`${results.length} desktop/mobile rendered route checks; ${errors.length} errors`)
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
