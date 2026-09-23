import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import {execFileSync} from 'node:child_process'
import {chromium} from 'playwright-core'
export async function launchBrowser(){
 if(process.env.CHROMIUM_EXECUTABLE_PATH)return chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox']})
 try{return await chromium.launch({headless:true})}catch{
  const {default:portable}=await import('@sparticuz/chromium')
  const lib=path.resolve('.arena/browser-libs');fs.mkdirSync(lib,{recursive:true})
  if(!fs.existsSync(path.join(lib,'lib/libnspr4.so'))){
   const tar=zlib.brotliDecompressSync(fs.readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br'))
   fs.writeFileSync(path.join(lib,'libs.tar'),tar);execFileSync('tar',['-xf',path.join(lib,'libs.tar'),'-C',lib]);fs.unlinkSync(path.join(lib,'libs.tar'))
  }
  return chromium.launch({executablePath:await portable.executablePath(),headless:true,args:portable.args,env:{...process.env,LD_LIBRARY_PATH:path.join(lib,'lib')+':'+(process.env.LD_LIBRARY_PATH||'')}})
 }
}
