// Shared, token-safe interpretation for product filters and look search.
const aliases: Record<string, string> = { mens: 'men', man: 'men', male: 'men', him: 'men', womens: 'women', woman: 'women', female: 'women', her: 'women', couples: 'couple', kurtas: 'kurta', kurtis: 'kurta', kurti: 'kurta', sarees: 'saree', sari: 'saree', lehengas: 'lehenga', printed: 'print', embroidered: 'embroidery', festive: 'festive' }
const stop = new Set(['for','and','the','a','an','s','outfit','outfits','wear','look','looks','clothes','dress','set','sets'])
export const searchTokens = (text: string) => text.toLowerCase().replace(/embroidered/g,'embroidery').split(/[^a-z0-9]+/).filter(Boolean).map(t=>aliases[t]||t).filter(t=>!stop.has(t))
export function searchIntent(query: string) {
 const tokens=searchTokens(query)
 const gender=tokens.includes('women')?'women':tokens.includes('men')?'men':undefined
 const couple=tokens.includes('couple')
 const match=query.match(/(?:under|below)\s*(?:₹|rs\.?\s*)?(\d[\d,]*)/i)
 const budget=match?Number(match[1].replace(/,/g,'')):undefined
 const occasion = ['Garba','Navratri','College Fest','Diwali','Festive Party'].find(w => w.toLowerCase().split(' ').every(t=>tokens.includes(t)))
 return {gender,couple,budget,occasion,tokens:tokens.filter(t=>!['women','men','couple','under','below'].includes(t)&&!/^\d+$/.test(t))}
}
export function textMatches(text: string, tokens: string[]) {
 const words=new Set(searchTokens(text))
 return tokens.every(t=>words.has(t))
}
