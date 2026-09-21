#!/usr/bin/env node
/**
 * VIRAAS photo pipeline — process raw AI-generated images into production assets.
 *
 *   node scripts/photos/process.mjs [rawFile...]
 *
 * For each raw file (staged as <slot>.jpg in the generation staging dir), this:
 *   1. validates it decodes and is a real raster image (identify)
 *   2. centre-crops to exactly 3:4, resizes to 840×1120, strips metadata,
 *      re-encodes as progressive JPEG q80 (ImageMagick)
 *   3. runs QA: dimensions, non-blank (stddev), dominant-colour match against
 *      the expected product colour family (catches wrong-colour generations)
 *   4. writes the final file into public/images/photos/<slot>.jpg or
 *      public/images/couples/<cid>.jpg and prints a status line
 *
 * Exit code 1 if any file failed hard (undecodable / blank / not written).
 * Colour mismatches are reported as COLOUR_FLAG for manual regeneration.
 */
import { readFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { COLOUR_HEX } from '../plates.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const STAGE = process.env.VIRAAS_STAGE || join(ROOT, '..', '.cache', 'viraas-gen', 'raw')
const PHOTOS = join(ROOT, 'public/images/photos')
const COUPLES = join(ROOT, 'public/images/couples')
mkdirSync(PHOTOS, { recursive: true })
mkdirSync(COUPLES, { recursive: true })

const COLOUR_FAMILY = {
  Ivory: 'ivory', Cream: 'ivory', White: 'ivory', Sand: 'sand', Greige: 'sand', 'Stone Grey': 'sand', 'Oat Melage': 'sand',
  Black: 'black', 'Onyx Black': 'black', Charcoal: 'black',
  Wine: 'wine', Maroon: 'wine', 'Deep Maroon': 'wine',
  Terracotta: 'rust', Rust: 'rust', Copper: 'rust', 'Vermeil Orange': 'rust', Chocolate: 'rust',
  Coral: 'coral', Tangerine: 'coral', Mustard: 'mustard', Marigold: 'mustard',
  'Butter Yellow': 'yellow', 'Sunflower Yellow': 'yellow',
  'Blush Pink': 'blush', Rose: 'blush', 'Dusty Rose': 'blush', Peach: 'blush',
  'Hot Pink': 'fuchsia', Fuchsia: 'fuchsia', 'Rani Pink': 'fuchsia',
  Plum: 'plum', Aubergine: 'plum', Lilac: 'plum',
  Navy: 'navy', 'Midnight Navy': 'navy', 'Royal Blue': 'navy',
  'Powder Blue': 'powder', 'Sea Blue': 'powder', 'Peacock Teal': 'teal',
  Emerald: 'emerald', 'Deep Green': 'emerald', 'Forest Green': 'emerald', 'Bottle Green': 'emerald', Jade: 'emerald',
  Sage: 'sage', Mint: 'sage', Olive: 'olive', 'Deep Olive': 'olive', 'Parrot Green': 'parrot',
  'Antique Gold': 'gold', Champagne: 'gold', Bronze: 'gold', 'Rose Gold': 'gold',
}
const EXTRA_HEX = { 'Sea Blue': '#7FA8C9', 'Dusty Rose': '#C29A96', 'Oat Melage': '#D8CBB6' }
const hexOf = (c) => COLOUR_HEX[c] || EXTRA_HEX[c]
const familyHexes = (family) => Object.entries(COLOUR_FAMILY).filter(([, f]) => f === family).map(([c]) => hexOf(c)).filter(Boolean)

// expected colour per slot, from the briefs
const briefs = []
for (const f of ['product-brief.json', 'couple-brief.json', 'extras.json']) {
  const p = join(ROOT, 'scripts/photos', f)
  if (existsSync(p)) briefs.push(...JSON.parse(readFileSync(p, 'utf8')))
}
const expected = new Map()
for (const b of briefs) {
  const slot = b.slot || b.cid
  const cols = b.colourHex ? [{ hex: b.colourHex, family: COLOUR_FAMILY[b.colour] || '' }] : []
  if (b.herColour) cols.push({ hex: hexOf(b.herColour), family: COLOUR_FAMILY[b.herColour] })
  if (b.hisColour) cols.push({ hex: hexOf(b.hisColour), family: COLOUR_FAMILY[b.hisColour] })
  expected.set(slot, cols)
}

const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)

function isCoupleSlot(name) { return briefs.some((b) => b.cid === name && b.file?.includes('/couples/')) }

let hardFails = 0, flags = 0, done = 0
for (const arg of process.argv.slice(2)) {
  const name = basename(arg).replace(/\.[a-z]+$/i, '')
  const raw = join(STAGE, basename(arg))
  if (!existsSync(raw)) { console.log(`MISSING ${name}`); hardFails++; continue }
  const isCouple = isCoupleSlot(name)
  const out = join(isCouple ? COUPLES : PHOTOS, `${name}.jpg`)
  try {
    // 1. decode check
    const info = execFileSync('identify', ['-format', '%m %w %h %[fx:standard_deviation]', raw]).toString()
    const [fmt, w, h, sd] = info.trim().split(/\s+/)
    if (!/JPEG|PNG|WEBP/.test(fmt)) throw new Error(`unexpected format ${fmt}`)
    if (Number(w) < 500 || Number(h) < 600) throw new Error(`too small ${w}x${h}`)
    if (Number(sd) < 0.02) throw new Error(`looks blank (stddev ${sd})`)
    // 2. normalise to exact 840x1120 (3:4), progressive, stripped
    execFileSync('convert', [raw, '-resize', '840x1120^', '-gravity', 'center', '-extent', '840x1120', '-quality', '80', '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', out])
    const fin = execFileSync('identify', ['-format', '%m %w %h %b', out]).toString().trim()
    const [f2, w2, h2] = fin.split(/\s+/)
    if (f2 !== 'JPEG' || w2 !== '840' || h2 !== '1120') throw new Error(`post-process mismatch ${fin}`)
    // 3. colour QA against expected family
    let colourNote = 'no-brief'
    const exp = expected.get(name)
    if (exp && exp.length) {
      const txt = execFileSync('convert', [out, '-resize', '64x64!', '-colors', '6', '-format', '%c', 'histogram:info:']).toString()
      const doms = [...txt.matchAll(/#([0-9A-Fa-f]{6})\s/g)].map((m) => hexToRgb('#' + m[1]))
      const allowed = exp.flatMap((e) => (e.family ? familyHexes(e.family) : []).concat(e.hex || [])).map(hexToRgb)
      const best = Math.min(...doms.map((d) => Math.min(...allowed.map((a) => dist(d, a)))), 999)
      if (best > 165) { console.log(`COLOUR_FLAG ${name} (closest ${Math.round(best)})`); flags++ }
      else colourNote = `colour-ok(${Math.round(best)})`
    }
    unlinkSync(raw)
    console.log(`OK ${name} ${fin} ${colourNote}`)
    done++
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`)
    hardFails++
  }
}
console.log(`--- processed ${done} · flagged ${flags} · failed ${hardFails}`)
process.exit(hardFails ? 1 : 0)
