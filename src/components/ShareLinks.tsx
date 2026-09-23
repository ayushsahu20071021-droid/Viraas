import {useState} from 'react'
import {Copy, MessageCircle} from 'lucide-react'
export default function ShareLinks({path, title}: {path:string;title:string}) {
 const [message,setMessage]=useState('')
 const url=`${typeof window==='undefined'?'https://viraas.in':window.location.origin}${path}`
 const text=`Found my festive look on VIRAAS ✨ — ${title}`
 return <div className="flex flex-wrap items-center gap-4 text-xs">
  <button type="button" className="inline-flex items-center gap-1.5 underline underline-offset-4" onClick={async()=>{try{await navigator.clipboard.writeText(url);setMessage('Link copied')}catch{setMessage('Copy the page URL from your address bar')}}}><Copy size={13}/>Copy Link</button>
  <a className="inline-flex items-center gap-1.5 underline underline-offset-4" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={13}/>WhatsApp</a>
  <span role="status">{message}</span>
 </div>
}
