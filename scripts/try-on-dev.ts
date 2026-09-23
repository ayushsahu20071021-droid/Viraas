import type {Plugin} from 'vite'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
// Same-origin adapter for the EXISTING Netlify handler, no client keys or duplicate provider.
export function tryOnDev(): Plugin {
 const install = (server: {middlewares: {use: (route: string, handler: (req: any,res: any)=>void)=>void}}) => {
  server.middlewares.use('/api/try-on',async(req,res)=>{
   const chunks: Buffer[]=[];let size=0
   for await (const chunk of req){size+=chunk.length;if(size>14*1024*1024){res.statusCode=413;res.end(JSON.stringify({error:'Image too large'}));return}chunks.push(chunk)}
   try{
    const {handler}=await import(pathToFileURL(path.resolve('netlify/functions/try-on.js')).href)
    const response=await handler({httpMethod:req.method,body:Buffer.concat(chunks).toString('utf8')})
    res.statusCode=response.statusCode;for(const [key,value]of Object.entries(response.headers))res.setHeader(key,value)
    res.end(response.body)
   }catch{res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Try-On temporarily unavailable'}))}
  })
 }
 return {name:'viraas-existing-try-on',configureServer:install,configurePreviewServer:install}
}
