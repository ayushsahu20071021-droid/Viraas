#!/usr/bin/env node
/**
 * Builds the final 490-slot production image manifest (.image-manifest.json).
 *
 *   node scripts/build-image-manifest.mjs
 *
 * Slots (final queue):
 *   60 couple edit  ·  2 occasion heroes  ·  123 men  ·  166 women  ·  139 accessories/beauty
 *
 * Prompts are derived from each product's own catalog metadata (identity),
 * phrased with the VIRAAS premium faceless-mannequin visual language (§25/§26),
 * and diversified deterministically across environments, poses and lighting so
 * the catalog never feels duplicated (§24).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const products = readJson('src/data/catalog/products.json')
const couples = readJson('src/data/catalog/couples.json')
const byId = new Map(products.map((p) => [p.id, p]))

const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
const pick = (arr, seed) => arr[hashStr(seed) % arr.length]

// ── shared visual language ────────────────────────────────────────────────────
const MANNEQUIN = 'premium faceless identity-neutral 3D fashion mannequin with realistic human proportions, sophisticated refined body shape, smooth matte eggshell head with no facial features, realistic shoulders, arms and hands, gallery-quality three-dimensional construction'
const NEGATIVE = 'no cheap retail mannequin, no plastic shop dummy, no beige showroom dummy, no toy, no cartoon, no vector, no flat illustration, no game character, no distorted anatomy, no floating garment, no cropped outfit, no cropped feet, no text, no logo, no watermark, no retailer branding, no old wedding catalogue look'

const ENVIRONMENTS = [
  'a refined contemporary Indian studio with warm ivory backdrop and subtle marigold styling',
  'a modern rooftop terrace at golden hour with planter greens and clean architecture',
  'an upscale hotel courtyard with jali-screen shadows and brass lanterns',
  'a premium fashion gallery space with soft plaster walls and terracotta accents',
  'an elegant café corner with cane furniture and soft daylight',
  'a contemporary Indian home interior with arched niches and oak floors',
  'a styled garden lawn with dappled tree light and soft breeze',
  'a modern wedding-venue corridor with fluted wall panels and warm downlights',
  'a festive outdoor ground at dusk with distant string lights defocused',
  'a minimal editorial set with a deep emerald backdrop and soft key light',
  'a sophisticated sandstone-architecture courtyard, clean and contemporary',
  'a design-forward boutique interior with linen drapes and warm spot lighting',
]
const POSES_F = [
  'standing in a relaxed three-quarter stance, one hand smoothing the drape',
  'mid-step walking turn, fabric in gentle motion',
  'standing tall with a calm editorial posture, chin level',
  'weight on one hip, opposite hand holding the dupatta edge',
  'seated gracefully on a low cane stool, outfit fully visible',
  'half-turn over the shoulder, pallu line clean',
]
const POSES_M = [
  'standing in a relaxed confident stance, hands loosely at the sides',
  'adjusting the cuff of one sleeve, eyes forward',
  'mid-stride walking stance with natural garment sway',
  'one hand in pocket, shoulders easy, three-quarter view',
  'buttoning a single jacket button, posture straight',
  'seated on a low wooden bench, elbows resting, outfit fully visible',
]
const POSES_COUPLE = [
  'walking together in step, looking in the same direction ahead',
  'standing side by side at slightly different depths, subtle shoulder touch',
  'her adjusting her dupatta while he stands beside her, both facing the camera direction',
  'a subtle turn toward each other, respectful space between them',
  'entering the venue together mid-stride, garments in motion',
  'relaxed side-by-side stance, his hands folded, her hand on her dupatta',
  'seated together on a low cane settee, fashion-editorial asymmetry',
]
// dance poses are reserved for festival/dance occasions so the card always
// matches its occasion label (couple QA gate: correct occasion)
const POSES_COUPLE_DANDIYA = [
  'a dandiya pose with decorated sticks crossed mid-movement, joyful Garba energy',
  'a Garba dance step mid-movement, her dupatta and his kurta hem in motion',
  'dancing side by side with playful dandiya sticks, string-light bokeh behind',
]
const POSES_COUPLE_DANCE = [
  'a lively dance step side by side, her pallu and his kurta hem in motion',
  'mid-celebration movement with raised hands clapping to the beat, joyful energy',
]
const LIGHT = [
  'clean soft studio light with gentle falloff',
  'soft warm daylight from large windows',
  'warm golden-hour glow with long soft shadows',
  'cool blue-hour ambience with warm accent lights',
  'elegant dusk light with defocused festive string lights',
  'refined editorial flash with soft fill and crisp fabric texture',
]

const craftOf = (p) => { const c = p.embroidery || p.pattern || p.weave; return c ? String(c).replace(/\s+work$/i, "") : null }
const fabOf = (p) => (p.fabric && p.fabric !== 'None' ? p.fabric : null)
const occOf = (p) => (p.occasions || ['Festive Party']).slice(0, 2).join(' and ')

function apparelPrompt(p, extra = '') {
  const colour2 = p.secondaryColour ? `, ${p.secondaryColour.toLowerCase()} accents` : ''
  const craft = craftOf(p) ? `, ${p.embroidery ? 'embroidered' : p.pattern ? 'patterned' : 'woven'} with ${craftOf(p).toLowerCase()}` : ', clean minimal surface'
  const env = pick(ENVIRONMENTS, p.id + 'env')
  const pose = p.gender === 'men' ? pick(POSES_M, p.id + 'pose') : pick(POSES_F, p.id + 'pose')
  const light = pick(LIGHT, p.id + 'light')
  // Gujarati Garba visual language (directive §7/§8): must pass the "cover the word Garba" test
  const ccExtra = /chaniya/i.test(p.silhouette)
    ? 'The outfit is the classic Gujarati Garba trio — a fully flared gathered chaniya skirt with contrast border, a fitted choli, and a coordinating odhani dupatta draped over one shoulder — with traditional mirror/Bandhani/Kutchi detailing and a single oxidised-silver jewellery accent, dandiya-ready with visible twirl in the skirt. '
    : ''
  return `Luxury contemporary Indian fashion editorial photograph, ${MANNEQUIN} wearing ${p.title.toLowerCase()} — a ${p.silhouette.toLowerCase()} styled for ${occOf(p)}, in ${p.colour.toLowerCase()}${colour2}${craft}, ${fabOf(p) ? fabOf(p).toLowerCase() + ' with realistic weave and texture' : 'realistic textile texture'}. ${ccExtra}${pose}, set in ${env}, ${light}. Modern 2026 Indian traditional fashion aesthetic for young adults, natural garment drape and realistic folds, detailed stitching, complete outfit visible head to toe with matching Indian footwear visible, full-body composition with headroom, premium magazine quality, original composition, ${extra}no face, no text, no logos, no watermark. ${NEGATIVE}`
}

function accessoryPrompt(p) {
  const craft = craftOf(p) ? ` with ${craftOf(p).toLowerCase()}` : ''
  const material = fabOf(p) ? fabOf(p).toLowerCase() : 'fine materials'
  const isBeauty = p.category === 'beauty'
  const env = isBeauty
    ? pick(['a polished stone vanity with soft festive bokeh', 'a marble podium with marigold petals and warm side light', 'a linen-draped styling table with brass tray'], p.id + 'env')
    : pick([
        'a velvet display bust and brass tray vignette',
        'a raw-silk cushion podium with marigold styling',
        'a warm sandstone ledge with jali light patterns',
        'a linen-lined tray with fresh jasmine strands',
        'a minimal plaster pedestal with a single defocused diya glow',
      ], p.id + 'env')
  const light = pick(LIGHT, p.id + 'light')
  const framing = isBeauty
    ? 'premium beauty product editorial, item in sharp focus, packaging clean and unbranded'
    : 'premium product editorial, hero item in sharp focus with a shallow secondary prop'
  return `Luxury Indian festive ${p.category === 'beauty' ? 'beauty' : 'accessory'} product photograph: ${p.title.toLowerCase()} in ${p.colour.toLowerCase()}${craft}, ${material}, presented in ${env}. ${framing}, ${light}, realistic material texture — ${/leather/i.test(material) ? 'grained leather surface' : /silk|satin|brocade/i.test(material) ? 'woven sheen' : /metal|brass|silver|gold|steel|plated/i.test(material + craft) ? 'polished metal with fine detailing' : 'true-to-life finish'}. Tall vertical portrait 3:4 composition with the hero product centred in frame and generous negative space above and below. Styled for ${occOf(p)}, modern 2026 Indian festive context, high-end campaign quality, no people, no face, no text, no logos, no watermark. ${NEGATIVE}`
}

function couplePrompt(c) {
  const her = byId.get(c.herProductIds[0])
  const his = byId.get(c.hisProductIds[0])
  if (!her || !his) return null
  const herCraft = craftOf(her) ? `, ${craftOf(her).toLowerCase()} work` : ''
  const hisCraft = craftOf(his) ? `, ${craftOf(his).toLowerCase()} work` : ''
  const story = `${her.colour} × ${his.colour}`
  const env = pick(ENVIRONMENTS, c.id + 'env')
  const isDandiyaOcc = /garba|navratri/i.test(c.occasions.join(' '))
  const isDanceOcc = /sangeet|mehendi|haldi|college/i.test(c.occasions.join(' '))
  const posePool = isDandiyaOcc ? [...POSES_COUPLE_DANDIYA, ...POSES_COUPLE] : isDanceOcc ? [...POSES_COUPLE_DANCE, ...POSES_COUPLE] : POSES_COUPLE
  const pose = pick(posePool, c.id + 'pose')
  const light = pick(LIGHT, c.id + 'light')
  return `Premium contemporary Indian fashion editorial photograph featuring exactly two sophisticated faceless identity-neutral 3D fashion mannequins, exactly one female and exactly one male, HER a graceful feminine silhouette wearing ${her.title.toLowerCase()} (${her.silhouette.toLowerCase()}, ${her.colour.toLowerCase()}${herCraft}), HIM a taller masculine silhouette wearing ${his.title.toLowerCase()} (${his.silhouette.toLowerCase()}, ${his.colour.toLowerCase()}${hisCraft}). Complementary non-matching outfits in a ${story} colour story, modern 2026 Indian traditional fashion, premium youthful styling. ${pose}, set in ${env}, ${light}, full-body composition with both complete outfits and Indian footwear visible head to toe, realistic textile texture, natural drape, attractive editorial body language, clearly distinguishable her + him pairing that reads as a stylish young Indian couple, vertical portrait 3:4 framing, original composition, no faces, no text, no logos, no watermark, no stiff display pose, no old wedding catalogue look. No two female mannequins, no two male mannequins, no ambiguous pairing, no single person, no matching uniform, no cheap plastic mannequins, no excessive gold, no royal costume.`
}

// ── slot selection ────────────────────────────────────────────────────────────
const APPAREL = ['sarees', 'kurta-sets', 'lehenga', 'co-ord-sets', 'indowestern', 'garba', 'jackets', 'formals']
const ACC = ['jewellery', 'bags', 'footwear', 'watches', 'accessories', 'beauty']

// women: 166 of 280 — round-robin across the 4 apparel categories, diverse colours first
function pickWomen(n) {
  const pool = products.filter((p) => p.gender === 'women' && APPAREL.includes(p.category))
  const byCat = new Map()
  for (const p of pool) { if (!byCat.has(p.category)) byCat.set(p.category, []); byCat.get(p.category).push(p) }
  const cats = [...byCat.keys()]
  const seenCombo = new Set()
  const out = []
  let i = 0
  while (out.length < n && i < 4000) {
    const cat = cats[i % cats.length]
    const list = byCat.get(cat)
    const p = list[Math.floor(i / cats.length) % list.length]
    const combo = `${p.category}|${p.subCategory}|${p.colour}`
    if (!out.some((x) => x.id === p.id) && !seenCombo.has(combo)) { seenCombo.add(combo); out.push(p) }
    i++
  }
  // top up ignoring the combo rule if needed
  for (const p of pool) { if (out.length >= n) break; if (!out.some((x) => x.id === p.id)) out.push(p) }
  return out.slice(0, n)
}

// men: 123 of 155 apparel products — round-robin across categories, diverse colours first
function pickMen(n) {
  const pool = products.filter((p) => p.gender === 'men' && APPAREL.includes(p.category))
  const byCat = new Map()
  for (const p of pool) { if (!byCat.has(p.category)) byCat.set(p.category, []); byCat.get(p.category).push(p) }
  const cats = [...byCat.keys()]
  const seenCombo = new Set()
  const out = []
  let i = 0
  while (out.length < n && i < 4000) {
    const cat = cats[i % cats.length]
    const list = byCat.get(cat)
    const p = list[Math.floor(i / cats.length) % list.length]
    const combo = `${p.category}|${p.subCategory}|${p.colour}`
    if (!out.some((x) => x.id === p.id) && !seenCombo.has(combo)) { seenCombo.add(combo); out.push(p) }
    i++
  }
  for (const p of pool) { if (out.length >= n) break; if (!out.some((x) => x.id === p.id)) out.push(p) }
  return out.slice(0, n)
}

// accessories & beauty: 139 of 156
function pickAcc(n) {
  const pool = products.filter((p) => ACC.includes(p.category))
  const seen = new Set()
  const out = []
  // priority: one per (sub,colour) combo, beauty capped fairly
  for (const p of pool) {
    const combo = `${p.subCategory}|${p.colour}`
    if (!seen.has(combo)) { seen.add(combo); out.push(p) }
  }
  for (const p of pool) { if (out.length >= n) break; if (!out.includes(p)) out.push(p) }
  return out.slice(0, n)
}

const slots = []
// 1) couples first (§52 execution order)
for (const c of couples) {
  const prompt = couplePrompt(c)
  if (!prompt) continue
  slots.push({ kind: 'couple', id: c.id, out: `public/images/couple-plates/${c.coupleId}.jpg`, w: 1200, h: 1600, prompt })
}
// 2) men
for (const p of pickMen(Infinity)) slots.push({ kind: 'men', id: p.id, out: `public/images/products/${p.id}.jpg`, w: 1024, h: 1365, prompt: apparelPrompt(p) })
// 3) women
for (const p of pickWomen(Infinity)) slots.push({ kind: 'women', id: p.id, out: `public/images/products/${p.id}.jpg`, w: 1024, h: 1365, prompt: apparelPrompt(p) })
// 4) accessories & beauty
for (const p of pickAcc(Infinity)) slots.push({ kind: 'acc', id: p.id, out: `public/images/products/${p.id}.jpg`, w: 1024, h: 1365, prompt: accessoryPrompt(p) })
// 5) occasion heroes
slots.push({
  kind: 'hero', id: 'occasion-garba', out: 'public/images/occasion-garba.jpg', w: 1600, h: 1000,
  prompt: `Wide premium Indian festive editorial photograph featuring exactly two sophisticated faceless identity-neutral 3D fashion mannequins — exactly one female and exactly one male — dancing dandiya with crossed sticks at a modern Navratri ground at dusk. SHE in a mirror-work chaniya choli lehenga in hot pink with a flowing odhani caught mid-spin; HE in a contemporary deep teal Garba jacket over ivory with tapered trousers. String lights defocused bokeh, festive energy, joyful editorial body language, full outfits with footwear visible, cinematic wide composition with room for text overlay at the top, realistic textiles, no faces, no text, no logos, no watermark. No two female mannequins, no two male mannequins, no single person, no cheap plastic mannequins, no excessive gold, no costume theatre.`,
})
slots.push({
  kind: 'hero', id: 'occasion-haldi', out: 'public/images/occasion-haldi.jpg', w: 1600, h: 1000,
  prompt: `Wide premium Indian festive editorial photograph featuring exactly two sophisticated faceless identity-neutral 3D fashion mannequins — exactly one female and exactly one male — at a sunlit haldi ceremony. SHE in an ivory organza floral kurta set with marigold jewellery; HE in a cream cotton kurta with a saffron stole. Marigold garlands and brass urli bowls, warm morning light, tasteful editorial composition with room for text overlay at the top, complete outfits with footwear visible, realistic textiles, no faces, no text, no logos, no watermark. No two female mannequins, no two male mannequins, no single person, no cheap plastic mannequins, no old wedding catalogue look.`,
})

writeFileSync(join(ROOT, '.image-manifest.json'), JSON.stringify(slots, null, 1))
const tally = {}
for (const s of slots) tally[s.kind] = (tally[s.kind] || 0) + 1
console.log(`manifest: ${slots.length} slots →`, JSON.stringify(tally))
const done = slots.filter((s) => existsSync(join(ROOT, s.out)))
console.log(`already on disk: ${done.length}`)
