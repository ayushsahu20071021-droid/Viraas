// ─────────────────────────────────────────────────────────────────────────────
// VIRAAS catalog generator — builds 500+ unique products with dedicated SVG
// fashion plates, plus curated looks and couple-edit looks.
//
//   node scripts/generate-catalog.mjs
//
// Outputs:
//   src/data/catalog/products.json      all products
//   src/data/catalog/looks.json         curated looks
//   src/data/catalog/couples.json       couple-edit looks
//   public/images/products/*.svg        three original plates per product
//   public/images/couple-plates/*.svg   two-figure couple plates
//   public/sitemap.xml, robots.txt      SEO files
//
// HONESTY: every generated product is status 'CHECK' with lastChecked =
// '2026-09-20'. No ratings, no discount claims, no affiliate URLs are
// fabricated — affiliateUrl stays undefined until the owner pastes a real
// EarnKaro link. Deep merchantUrls point to the closest real retailer
// category/search page — never a bare homepage. Never Amazon.
// ─────────────────────────────────────────────────────────────────────────────
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPlate, renderCouplePlate, COLOUR_HEX, hashStr } from './plates.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DATA = join(ROOT, 'src/data/catalog')
const OUT_IMG = join(ROOT, 'public/images/products')
const OUT_COUPLE = join(ROOT, 'public/images/couple-plates')
const TODAY = '2026-09-20'
mkdirSync(OUT_DATA, { recursive: true })
mkdirSync(OUT_IMG, { recursive: true })
mkdirSync(OUT_COUPLE, { recursive: true })

// ── helpers ───────────────────────────────────────────────────────────────────
const mulberry = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const titleCase = (s) => s.split(' ').map(cap).join(' ')
const rupee = (n) => '\u20B9' + n.toLocaleString('en-IN')
const pad2 = (n) => String(n).padStart(2, '0')

// ── craft library ───────────────────────────────────────────────────────────
const CRAFTS = {
  'Chikankari': { adj: 'Chikankari-worked', type: 'embroidery' }, 'Zardozi': { adj: 'zardozi-embroidered', type: 'embroidery' },
  'Zari': { adj: 'zari-woven', type: 'weave' }, 'Gotapatti': { adj: 'gotapatti-appliqu\u00e9d', type: 'embroidery' },
  'Mirror Work': { adj: 'mirror-work', type: 'embroidery' }, 'Kashmiri Embroidery': { adj: 'Kashmiri-embroidered', type: 'embroidery' },
  'Resham Threadwork': { adj: 'resham-threadworked', type: 'embroidery' }, 'Sequit Work': { adj: 'sequin-scattered', type: 'embroidery' },
  'Dabka': { adj: 'dabka-embellished', type: 'embroidery' }, 'Aari': { adj: 'aari-stitched', type: 'embroidery' },
  'Kamdani': { adj: 'kamdani-fine weave', type: 'weave' }, 'Banarasi Weave': { adj: 'Banarasi-woven', type: 'weave' },
  'Jamdani Weave': { adj: 'Jamdani-woven', type: 'weave' }, 'Patola Weave': { adj: 'Patola-woven', type: 'weave' },
  'Ikat Weave': { adj: 'ikat-dyed', type: 'weave' }, 'Bandhani': { adj: 'Bandhani-tied', type: 'pattern' },
  'Block Print': { adj: 'block-printed', type: 'pattern' }, 'Kalamkari': { adj: 'Kalamkari-painted', type: 'pattern' },
  'Ajrakh Print': { adj: 'Ajrakh-printed', type: 'pattern' }, 'Bagru Print': { adj: 'Bagru-printed', type: 'pattern' },
  'Buti Motifs': { adj: 'buti-motif', type: 'pattern' }, 'Jaal Lattice': { adj: 'jaal-lattice', type: 'pattern' },
  'Sequin All-Over': { adj: 'all-over sequinned', type: 'embroidery' }, 'Tone-on-Tone': { adj: 'tone-on-tone', type: 'embroidery' },
  'Thread Embroidery': { adj: 'thread-embroidered', type: 'embroidery' }, 'Pearl Detailing': { adj: 'pearl-detailed', type: 'embroidery' },
  'Dried Flower Work': { adj: 'dried-flower applied', type: 'embroidery' }, 'Stone Work': { adj: 'stone-set', type: 'embroidery' },
  'None': { adj: 'craft-clean', type: 'plain' },
}
const CRAFT_KEYS = Object.keys(CRAFTS)

// ── fabric library ──────────────────────────────────────────────────────────
const FAB = {
  'Georgette': 'flowy, matte-look georgette', 'Organza': 'crisp, translucent organza', 'Chiffon': 'featherweight chiffon',
  'Chanderi': 'lustrous Chanderi cotton-silk', 'Tussar Silk': 'textured Tussar silk', 'Raw Mango Silk': 'grainy raw mango silk',
  'Banarasi Silk': 'heirloom Banarasi silk', 'Art Silk': 'budget-friendly art silk', 'Mulberry Silk': 'pure mulberry silk',
  'Cotton Silk': 'cotton-silk blend', 'Linen': 'breathable pure linen', 'Khadi Cotton': 'handspun Khadi cotton',
  'Handloom Cotton': 'loom-washed handloom cotton', 'Viscose': 'drapey viscose', 'Rayon': 'soft rayon',
  'Crepe': 'pebbled crepe', 'Satin': 'fluid satin', 'Velvet': 'deep-pile velvet', 'Net': 'embroidered net',
  'Tulle': 'fine tulle', 'Brocade': 'raised-brocade weave', 'Jamdani': 'countered Jamdani muslin', 'Ajrakh': 'naturally dyed Ajrakh',
  'Bandhani': 'tied-and-dyed Bandhani', 'Sequin Fabric': 'all-over sequin fabric', 'Tissue': 'metallic tissue weave',
  'Wool Blend': 'winter wool blend', 'Jute': 'coarse jute weave', 'Cotton': 'daily cotton', 'VIRAAS Studio Knit': 'studio-knit jersey',
}
const FAB_KEYS = Object.keys(FAB)

// ── colour pools ────────────────────────────────────────────────────────────
const PALETTE = {
  festiveJewel: ['Emerald', 'Royal Blue', 'Deep Maroon', 'Peacock Teal', 'Wine', 'Forest Green'],
  pastels: ['Ivory', 'Blush Pink', 'Powder Blue', 'Mint', 'Peach', 'Lilac', 'Butter Yellow', 'Sand'],
  heirloom: ['Mustard', 'Terracotta', 'Rust', 'Olive', 'Aubergine', 'Antique Gold', 'Bottle Green', 'Copper'],
  brights: ['Fuchsia', 'Tangerine', 'Parrot Green', 'Coral', 'Sunflower Yellow', 'Hot Pink', 'Vermeil Orange'],
  evening: ['Midnight Navy', 'Charcoal', 'Plum', 'Onyx Black', 'Antique Gold', 'Chocolate', 'Deep Olive'],
  neuters: ['Ivory', 'Sand', 'Greige', 'Stone Grey', 'White', 'Oat Melange'],
  metal: ['Antique Gold', 'Silver', 'Rose Gold', 'Vermeil Orange', 'Champagne', 'Bronze'],
  warm: ['Ivory', 'Peach', 'Marigold', 'Terracotta', 'Rose', 'Mustard'],
  jewelDeep: ['Emerald', 'Wine', 'Midnight Navy', 'Aubergine', 'Forest Green', 'Royal Blue'],
  mutedEarth: ['Sage', 'Greige', 'Sand', 'Olive', 'Stone Grey', 'Chocolate'],
}

// ── merchants (NEVER Amazon) ─────────────────────────────────────────────────
const MERCHANT_LABEL = { MYNTRA: 'Myntra', AJIO: 'AJIO', FLIPKART: 'Flipkart', SHOPSY: 'Shopsy', MEESHO: 'Meesho', NYKAA: 'Nykaa' }
const BRANDS = {
  women: ['Sangria', 'W for Women', 'Aneam', 'Vistara Designs', 'Nayo', 'Anouk', 'Mrunal', 'Indya', 'Khinkhwab', 'Tarun Tarang', 'Simar', 'Raas', 'Chhanak', 'Nalli', 'Pernia\'s', 'Anavilu', 'Sanskriti', 'Devika', 'Amra OG', 'Zayka'],
  men: ['Manyavar', 'Mohey', 'WRODE', 'The Lama Studio', 'Anomd', 'Btoo', 'Jaipur Kurti', 'Nuru', 'Ethnic Kraft', 'Pabonik', 'Rupashree', 'Cottaram', 'Brewline', 'The Indian Garage Co.'],
  jewellery: ['Vidhi Atria', 'Pratikksha Gyan', 'Shaya', 'Kallol Designs', 'Sitaram Art Jewels', 'MEESAI', 'Giva', 'Agler'],
  bags: ['Khoi', 'Krooma', 'Kanua', 'Kanzki', 'Kallol', 'Kriti Collection'],
  footwear: ['Kolhapur Chappal', 'Labaki', 'Red Tape Ethnic', 'Mirco', 'Juttis by JS'],
  watches: ['Titan Raga', 'Fastrat', 'Sonata', 'Timex', 'Casio MTP'],
  beauty: ['Lakm\u00e9', 'SUGAM', 'Kay Beauty', 'Mamaearth', 'Dot & Key', 'Juicy Chemistry', 'Henna Art', 'Kajal Co.'],
}
const BRAND_FOR = (sub) => {
  if (sub.linkCat === 'watches') return BRANDS.watches
  if (sub.linkCat === 'beauty') return BRANDS.beauty
  if (/footwear/.test(sub.linkCat)) return BRANDS.footwear
  if (sub.linkCat === 'bags') return BRANDS.bags
  if (sub.gender === 'men') return BRANDS.men
  if (/jewellery|earr|neckl|bangle|ring|tikka|patti|passa|headpiece|hairpin|waistbelt|brooch|clutch|potli|sling|handbag|mini-bag/.test(sub.linkCat + ' ' + sub.id)) return sub.gender === 'women' ? /jewellery/.test(sub.linkCat) ? BRANDS.jewellery : BRANDS.bags : BRANDS.men
  return sub.gender === 'women' ? BRANDS.women : BRANDS.men
}
const MYNTRA_CATS = {
  sarees: 'sarees', 'kurta-sets': 'kurta-sets', 'co-ord-sets': 'co-ord-set-sets', lehenga: 'lehenga-choli',
  'women-sets': 'ethnic-sets', 'indowestern-sets': 'gowns-and-dresses', 'shirts': 'mens-formal-shirts',
  'top-bottom-wear': 'women-top-and-bottom-sets', 'ethnic-bottomwear': 'ethnic-bottomwear-men',
  'men-kurtas-sets': 'ethnic-combination-sets-men', 'sherwani': 'sherwani-kurtas',
  'garba-chaniya': 'costumes', 'earrings': 'earrings-1', 'jewellery-sets': 'jewellery-sets',
  'rings': 'rings', 'bangles-bracelets': 'bangles', 'maang-tikka': 'maang-tikka', 'brooches': 'brooches',
  'potli-bags': 'potli-bags', 'clutches': 'clutches', 'handbags': 'mini-bags', 'slung-bags': 'slung-bags',
  'kolhapuri': 'kolhapuri-chappals', 'jutti-mojaris': 'juttis', 'heels': 'heels', 'wedges': 'wedges',
  'flats': 'flats', 'sandals-women': 'sandals', 'flats-men': 'loafers', 'sandals-men': 'outdoor-sandals',
  'stoles': 'stoles', 'belts': 'belts', 'wallets': 'wallets-and-clutches', 'eyewear': 'eyewear-sunglasses',
  'safa': 'turban', 'watch': 'watches-men', 'beauty': 'makeup', 'kajal': 'makeup-eyes',
  'lipstick': 'makeup-lips', 'perfume': 'fragrance-women', 'skincare': 'skin-care',
  'trouseers': 'formal-trousers', 'men-sherwani': 'sherwani-kurtas',
}
const AJIO_TRENDING = {
  sarees: 'sarees-trending', 'kurta-sets': 'women-kurtas-sets-trending', 'co-ord-sets': 'women-co-ord-sets-trending',
  lehenga: 'lehenga-choli-trending', 'women-sets': 'women-ethnic-sets-trending', 'indowestern-sets': 'women-dresses-trending',
  'top-bottom-wear': 'women-top-and-bottom-sets-trending', 'shirts': 'men-shirts-trending',
  'trouseers': 'men-trousers-trending', 'ethnic-bottomwear': 'men-ethnic-bottomwear-trending',
  'men-kurtas-sets': 'men-ethnic-sets-trending', 'sherwani': 'men-ethnic-sets-trending',
  'garba-chaniya': 'women-sarees-trending', 'earrings': 'jewellery-trending', 'jewellery-sets': 'jewellery-trending',
  'rings': 'jewellery-trending', 'bangles-bracelets': 'jewellery-trending', 'maang-tikka': 'bridal-jewellery-trending',
  'brooches': 'bridal-accessories-trending', 'potli-bags': 'bags-trending', 'clutches': 'bags-trending',
  'handbags': 'bags-trending', 'slung-bags': 'bags-trending', 'kolhapuri': 'footwear-trending',
  'jutti-mojaris': 'footwear-trending', 'sandals-women': 'footwear-trending', 'sandals-men': 'footwear-trending',
  'heels': 'footwear-trending', 'wedges': 'footwear-trending', 'flats': 'footwear-trending',
  'flats-men': 'footwear-trending', 'stoles': 'scarves-trending', 'belts': 'belts-and-suspenders-trending',
  'wallets': 'wallets-trending', 'eyewear': 'eyewear-trending', 'safa': 'ethnic-accessories-trending',
  watch: 'watches-trending', beauty: 'beauty-trending', kajal: 'beauty-trending', 'lipstick': 'beauty-trending',
  perfume: 'fragrance-trending', skincare: 'beauty-trending',
}
const NYKAA_SEARCH = {
  beauty: 'search', 'lipstick': 'lipstick', kajal: 'kajal', 'perfume': 'perfume', skincare: 'face-serum',
  jewellery: 'maang-tikka', 'earrings': 'jhumka', 'bangles-bracelets': 'kada', 'potli-bags': 'potli',
  'clutches': 'clutch-bags', 'handbags': 'sling-bag', 'slung-bags': 'sling-bag', brooches: 'brooch',
  'safa': 'safa', stoles: 'dupatta', 'garba-chaniya': 'garba-dress',
}
function deepLink(mKey, sub, colourCraze, terms) {
  const q = encodeURIComponent(terms.slice(0, 4).join(' '))
  if (mKey === 'MYNTRA') { const cat = MYNTRA_CATS[sub.linkCat] || 'ethnic-combination-sets-women'; return `https://www.myntra.com/${cat}?search=${q}` }
  if (mKey === 'AJIO') { const cat = AJIO_TRENDING[sub.linkCat] || 'women-ethnic-sets-trending'; return `https://www.ajio.com/${cat}?search=${q}` }
  if (mKey === 'FLIPKART') return `https://www.flipkart.com/search?q=${q}&as=on&as-show=on`
  if (mKey === 'SHOPSY') return `https://www.shopsy.in/searchresults/?search_query=${q}`
  if (mKey === 'MEESHO') return `https://meesho.com/searchresult/${q}?lang=en&catalog=miniproductsearch`
  if (mKey === 'NYKAA') { const p = NYKAA_SEARCH[sub.linkCat] || 'search'; return p === 'search' ? `https://www.nykaa.com/search/?query=${q}` : `https://www.nykaa.com/${p}/?search=${q}` }
  return ''
}
function pickMerchant(rnd, price, moods) {
  const r = rnd()
  if (price <= 1100) return r < 0.4 ? 'MEESHO' : r < 0.7 ? 'SHOPSY' : 'FLIPKART'
  if (price >= 4200) return r < 0.45 ? 'MYNTRA' : r < 0.75 ? 'AJIO' : 'NYKAA'
  return r < 0.55 ? 'MYNTRA' : r < 0.8 ? 'AJIO' : r < 0.9 ? 'FLIPKART' : 'SHOPSY'
}
const PRICE_POINTS = [399, 449, 499, 549, 599, 649, 699, 749, 799, 849, 899, 949, 999, 1099, 1199, 1299, 1349, 1399, 1499, 1599, 1699, 1799, 1899, 1999, 2199, 2399, 2499, 2699, 2899, 2999, 3299, 3499, 3799, 3999, 4299, 4499, 4999, 5499, 5999, 6499, 6999, 7499, 7999, 8499, 8999, 9999, 10999, 11999, 12999, 13999]
// Pick a price inside [lo, hi] from PRICE_POINTS. If the band has no anchor
// points (e.g. ultra-luxe ranges beyond the ladder), fall back to the nearest
// point to the band midpoint — a price is ALWAYS a finite positive number.
const pickPrice = (rnd, lo, hi) => {
  const band = PRICE_POINTS.filter((pp) => pp >= lo && pp <= hi)
  if (!band.length) {
    const mid = (lo + hi) / 2
    const nearest = PRICE_POINTS.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a), PRICE_POINTS[0])
    return Math.max(1, nearest)
  }
  const picked = band[Math.floor(rnd() * band.length)]
  return Number.isFinite(picked) && picked > 0 ? picked : band[0]
}

const OCC_TAG = { wedding: 'Wedding', sangeet: 'Sangeet', reception: 'Reception', mehendi: 'Mehendi', festive: 'Festive Party', diwali: 'Diwali Party', navratri: 'Navratri', college: 'College Fest', workwear: 'Work-to-Dinner', party: 'Night Out', travel: 'Destination Wedding', casual: 'Daywear', puja: 'Puja & Temple', engagement: 'Engagement', guest: 'Wedding Guest', family: 'Family Function', date: 'Date Night', winter: 'Winter Festive' }

const AGE_BY_OCC = { college: [16, 17, 18, 20, 21, 22, 24], garba: [16, 17, 18, 20, 21, 22, 24, 25], party: [18, 20, 21, 22, 24], casual: [16, 17, 18, 20, 21, 22, 24], workwear: [20, 21, 22, 24, 25], travel: [20, 21, 22, 24, 25], date: [18, 20, 21, 22, 24, 25], puja: [16, 17, 18, 20, 21, 22, 24, 25], family: [16, 17, 18, 20, 21, 22, 24, 25], sangeet: [16, 17, 18, 20, 21, 22, 24, 25], mehendi: [16, 17, 18, 20, 21, 22, 24], festive: [18, 20, 21, 22, 24, 25, 30, 35], diwali: [18, 20, 21, 22, 24, 25, 30, 35], navratri: [16, 17, 18, 20, 21, 22, 24, 25], wedding: [18, 20, 21, 22, 24, 25, 30, 35, 40], reception: [20, 21, 22, 24, 25, 30, 35], engagement: [18, 20, 21, 22, 24, 25, 30], guest: [20, 21, 22, 24, 25, 30, 35, 40], winter: [18, 20, 21, 22, 24, 25, 30, 35] }
function ageFor(rnd, sub) {
  const pool = sub.occ.reduce((a, o) => a.concat(AGE_BY_OCC[o] || AGE_BY_OCC.festive), []).sort((a, b) => a - b)
  const pick = (lo, hi) => pool[lo + Math.floor(rnd() * (hi - lo + 1)) % pool.length]
  if (sub.gender === 'men') return [pick(0, Math.floor(pool.length * 0.4)), pick(Math.floor(pool.length * 0.35), Math.floor(pool.length * 0.75)), pick(Math.floor(pool.length * 0.7), pool.length - 1)]
  return [pick(0, Math.floor(pool.length * 0.5)), pick(Math.floor(pool.length * 0.4), Math.floor(pool.length * 0.8)), pick(Math.floor(pool.length * 0.75), pool.length - 1)]
}
function styleFor(sub, craft) {
  const s = []
  if (/saree|lehenga|anarkali|sharara|gharara|kurta|sherwani|bandhgala|garba|dhoti|pathani|safa|stole|kurti/.test(sub.sil)) s.push('Traditional')
  if (/co-ord|crop|jeans|shirt|trouser|jacket|blazer|waistcoat|sneaker|short/.test(sub.sil)) s.push('Contemporary')
  if (/indowestern|gown|draped|drape|asymmetric|skirt|cape/.test(sub.sil + ' ' + sub.name)) s.push('Indo-Western')
  if (sub.occ.includes('college') || sub.occ.includes('party') || sub.occ.includes('casual') || sub.occ.includes('date')) s.push('Everyday')
  if (sub.occ.includes('sangeet') || sub.occ.includes('garba') || sub.occ.includes('navratri') || sub.occ.includes('mehendi')) s.push('Festive')
  if (sub.occ.includes('wedding') || sub.occ.includes('reception') || sub.occ.includes('engagement') || sub.occ.includes('guest')) s.push('Occasion')
  if (sub.occ.includes('workwear')) s.push('Workwear')
  if (/Handloom|Khad|Ikkat|Ajrakh|Jamdani|Bandhani|Chanderi|Tussar/.test(sub.fabrics.join(' ') + ' ' + craft)) s.push('Handloom & Artisan')
  if (sub.occ.includes('reception') || sub.occ.includes('wedding') || priceHint(sub) >= 6000) s.push('Modern Luxury')
  if (/sequin|glam|mirror|stone|pearl/.test(sub.name.toLowerCase() + craft.toLowerCase())) s.push('Statement')
  return [...new Set(s)]
}
const OCC_LABEL = { wedding: 'Wedding', sangeet: 'Sangeet', reception: 'Reception', mehendi: 'Mehendi', festive: 'Festive', diwali: 'Diwali', navratri: 'Navratri', garba: 'Garba & Dandiya', college: 'College Fest', workwear: 'Workwear', party: 'Night Out', travel: 'Destination', casual: 'Casual', puja: 'Puja & Temple', engagement: 'Engagement', guest: 'Wedding Guest', family: 'Family Function', date: 'Date Night', winter: 'Winter' }
const priceHint = (sub) => sub.price[1]

const DESC = {
  sareeDrape: (f, c, col) => `A ${col.toLowerCase()} ${f} saree with the pallor kept architectural: crisp edge, hand-set ${c.toLowerCase()} that reads ${f === 'Organza' ? 'like light through leaves' : 'quietly luxe'} from a distance and richly up close. Blouse is fully lined with a side zip and hook-and-eye closure; petticoat and pallu pin included in the box.`,
  sareeConcept: (f, c, col) => `A conceptual piece: ${c.toLowerCase()} over ${f.toLowerCase()} in ${col.toLowerCase()}, styled for the couple-edit generation — wear it traditionally with a waist-belt or open over a shirt as a drape. The ${f === 'Tissue' ? 'metallic tissue weave' : 'weave'} holds pleats without starch; edges are picot-finished so the whole thing photographs clean from a meter away.`,
  lehenga: (f, c, col) => `Twelve-panel ${f} lehenga in ${col.toLowerCase()} with a graduated ${c.toLowerCase()} border that widens toward the hem, so movement reads as one continuous line. Raw-cut, unfinished bottom lets you length-adjust; the choli is princess-seamed with back darts and padded bust, and the dupatta ships with a silk-organza underlay to keep the ${c.toLowerCase()} visible in wind.`,
  kurta: (f, c, col) => `A ${col.toLowerCase()} ${f} ${/kurta|kurti/.test(c) ? '' : ''}set cut for real Indian weather: dropped shoulder, side slits, and a ${c.toLowerCase()} ${f === 'Linen' ? 'that softens every wash' : 'placed where a camera will find it'}. Includes ${/dupatta/.test(f) ? 'the dupatta' : 'bottom'} as listed; buttons are self-covered so nothing competes with the embroidery.`,
  anarkali: (f, c, col) => `Floor-sweeping ${f} anarkali in ${col.toLowerCase()}, yoked at the natural waist so the flare falls from there rather than the hip. ${titleCase(c)} concentrated on the yoke and hem; the inner lining is cotton-satin so it never clings during long events. Hidden side zip, adjustable waist ties, and a petticoat net that keeps the flare honest.`,
  jacket: (f, c, col) => `A structured ${f} jacket in ${col.toLowerCase()} with a ${c.toLowerCase()} treatment along the front placket and cuffs — the piece that turns any plain kurta set into an occasion look. Fully canvassed chest, functioning sleeve vents, interior pocket; cut closer to the body than a blazer so it stays Indian with jodhpurs or jeans.`,
  bandhgala: (f, c, col) => `Closed-neck ${f} bandhgala in ${col.toLowerCase()}, four-button mandarin placket and a ${c.toLowerCase()} jaal that catches light only at angles. The shoulder is roped like a western jacket but the body is straight like a sherwani, so it works with churidar or trousers. Half-canvas front, side pockets, ventless hem for a clean drape.`,
  sherwani: (f, c, col) => `Heirloom-weight ${f} sherwani in ${col.toLowerCase()}, with ${c.toLowerCase()} climbing the asymmetrical placket and repeating at the cuff. Internal drawstring for post-lunch comfort, fully lined in breathable viscose, and buttons hand-bound in fabric so the front reads as one continuous band of ornament.`,
  coord: (f, c, col) => `A ${col.toLowerCase()} ${f} co-ord: cropped ${c.toLowerCase()}-flecked top with an elastic back and a matching pull-on bottom that actually has real pockets. Made as one suit, but styled to separate — the top works over jeans, the bottom under an oversized shirt. Finished edges throughout; no raw seams to pill.`,
  kurti: (f, c, col) => `An everyday ${f} kurti in ${col.toLowerCase()} with a ${c.toLowerCase()} placket and hem — the kind built to be worn on a Tuesday, not stored for a wedding. Curled side slits, a Mandarin collar that survives a laptop bag, and a fabric weight that hides a peticoat-line. Pair with straight pants or jeans.`,
  kurtaMen: (f, c, col) => `A ${col.toLowerCase()} ${f} kurta with a ${c.toLowerCase()} placket that stops below the chest, so it reads refined under a jacket and complete on its own. Straight grain cut to fall without flare; side slits with bar-tacked tops; mother-of-pearl-look buttons on a hidden placket. Includes matching bottom as listed.`,
  drape: (f, c, col) => `A pre-pleated, pre-stitched ${f} drape in ${col.toLowerCase()} — six yards of behaviour, solved. The ${c.toLowerCase()} sits exactly where it should because the pleats are machine-tacked at the waist band; safety-strap loops and a hidden pocket in the waistband are sewn in. Comes with the peticoat shown; blouse is separate unless listed.`,
  footwear: (f, c, col) => `Hand-finished ${f} ${/heel|wedge/.test(f) ? 'shoes' : 'shoes/jutti'} in ${col.toLowerCase()}, with ${c.toLowerCase()} on the vamp and a padded leather-look footbed that survives eight-hour events. Anti-skid sole, reinforced heel counter; the ${/jutti|mojari|kolhapuri/.test(f) ? 'turn-down topline prevents blisters' : 'straps are backed so they do not cut'}.`,
  jewellery: (f, c, col) => `${titleCase(c)} ${f} jewellery in ${col.toLowerCase()} tones, ${/kundan|polki|pearl/.test(f + c) ? 'unclosed-back setting for that antique glow' : 'light enough to wear through a full event'}. Brass base with durable plating, skin-friendly finish, and secure clasps; every earring post is tested against tugging. Presentation box included for gifting.`,
  bag: (f, c, col) => `A ${col.toLowerCase()} ${f} bag sized for the occasion: phone, lipstick, keys, and a folded prayer book without bulging. ${titleCase(c)} across the flap, satin-lined interior with one zip pocket, and a ${/potli/.test(f) ? 'drawstring gathered by a tassel you can actually tighten' : 'detachable strap for shoulder or cross-body'}.`,
  beauty: (f, c, col) => `A ${col.toLowerCase()} ${f} ${/lipstick/.test(f) ? 'in a transfer-resistant, non-drying bullet' : /kajal/.test(f) ? 'with a smudge-but-stay wand' : 'built for a festive skin barrier'} — ${c.toLowerCase()} finish, dermat-tested claims kept to what the brand states. Shade shown swatched on medium-Indian skin; patch test before the event, not the morning of.`,
}
function descriptionFor(rnd, sub, craft, colour, fabric) {
  const c = CRAFTS[craft]?.adj || craft, col = colour
  const f = fabric || 'fabric'
  const key = sub.descKey
  const fn = DESC[key] || DESC.kurta
  return fn(f, c === 'craft-clean' ? 'clean line' : c, col)
}

// ── SUBS table ────────────────────────────────────────────────────────────────
const SUBS = []
// n=variants, crafts, palettes, fabrics, occasions, linkCat, price, age, sizes?, descKey, sil, extra
function womenSaree(id, name, sil, n, crafts, palettes, fabrics, occ, linkCat, price, descKey, extra = {}) { SUBS.push({ gender: 'women', cat: extra.cat || 'sarees', id, name, sil, n, crafts, palettes, fabrics, occ, linkCat, price, descKey, ...extra }) }
function set(id, name, sil, n, crafts, palettes, fabrics, occ, linkCat, price, descKey, extra = {}) { SUBS.push({ gender: extra.gender || 'women', cat: extra.cat || 'kurta-sets', id, name, sil, n, crafts, palettes, fabrics, occ, linkCat, price, descKey, ...extra }) }
function acc(id, name, sil, n, cats, palettes, materials, occ, linkCat, price, descKey, extra = {}) { SUBS.push({ gender: extra.gender || 'women', cat: cats, id, name, sil, n, crafts: extra.crafts || ['None'], palettes, fabrics: extra.fabrics || materials, occ, linkCat, price, descKey, ...extra }) }

// ── women · sarees (72) ──
womenSaree('w-saree-drape', 'Georgette Saree with Woven Border', 'saree-drape', 8, ['Zari', 'Sequit Work', 'Gotapatti', 'Resham Threadwork', 'Tone-on-Tone', 'Buti Motifs'], [PALETTE.festiveJewel, PALETTE.heirloom, PALETTE.pastels], ['Georgette', 'Crepe', 'Chiffon'], ['festive', 'sangeet', 'reception', 'diwali', 'family'], 'sarees', [1499, 5499], 'sareeDrape')
womenSaree('w-saree-predrape-satin', 'Pre-Draped Saree Gown (Satin)', 'saree-predrape', 5, ['Sequit All-Over', 'Dabka', 'Pearl Detailing', 'Stone Work', 'Mirror Work'], [PALETTE.evening, PALETTE.metal, PALETTE.heirloom], ['Satin', 'Crepe'], ['reception', 'sangeet', 'party', 'travel'], 'sarees', [2499, 8499], 'drape')
womenSaree('w-saree-predrape-net', 'Pre-Draped Net Saree', 'saree-predrape', 4, ['Dried Flower Work', 'Aari', 'Zardozi', 'Sequit Work'], [PALETTE.pastels, PALETTE.evening, PALETTE.metal], ['Net', 'Tulle'], ['reception', 'sangeet', 'travel'], 'sarees', [2999, 9499], 'drape', { cat: 'indowestern-sets' })
womenSaree('w-saree-organza', 'Organza Saree with Hand-embroidered Buti', 'saree-sheer', 6, ['Kamdani', 'Chikankari', 'Resham Threadwork', 'Tone-on-Tone', 'Dried Flower Work'], [PALETTE.pastels, PALETTE.neuters, PALETTE.warm], ['Organza'], ['festive', 'mehendi', 'travel', 'wedding'], 'sarees', [1799, 6499], 'sareeDrape')
womenSaree('w-saree-georgette-soft', 'Soft Georgette Everyday Saree', 'saree-drape', 6, ['Block Print', 'Buti Motifs', 'Kalamkari', 'None', 'Thread Embroidery'], [PALETTE.heirloom, PALETTE.mutedEarth, PALETTE.pastels], ['Georgette', 'Viscose', 'Rayon'], ['casual', 'college', 'workwear', 'puja', 'family'], 'sarees', [799, 2499], 'sareeDrape', { cat: 'sarees' })
womenSaree('w-saree-tissue', 'Tissue Saree with Zari Border', 'saree-silk', 3, ['Zari', 'Gotapatti', 'Sequit Work'], [PALETTE.metal, PALETTE.festiveJewel], ['Tissue'], ['wedding', 'reception', 'festive', 'guest'], 'sarees', [2499, 6999], 'sareeDrape')
womenSaree('w-saree-chanderi', 'Chanderi Silk-Cotton Saree', 'saree-silk', 4, ['Zari', 'Buti Motifs', 'Kamdani', 'None'], [PALETTE.neuters, PALETTE.pastels, PALETTE.heirloom], ['Chanderi'], ['festive', 'workwear', 'puja', 'family'], 'sarees', [1699, 4299], 'sareeDrape')
womenSaree('w-saree-silk', 'Mulberry Silk Saree', 'saree-silk', 5, ['Zari', 'Kanchipuram-style Gold Border', 'Buti Motifs', 'Jaal Lattice', 'None'], [PALETTE.festiveJewel, PALETTE.warm], ['Mulberry Silk', 'Art Silk', 'Cotton Silk'], ['wedding', 'reception', 'diwali', 'puja'], 'sarees', [3999, 12999], 'sareeDrape')
womenSaree('w-saree-satin-slip', 'Satin Slip Saree', 'saree-sheen', 4, ['Tone-on-Tone', 'Pearl Detailing', 'Sequit Work', 'None'], [PALETTE.evening, PALETTE.pastels], ['Satin'], ['reception', 'party', 'date'], 'sarees', [1799, 4499], 'sareeDrape', { cat: 'indowestern-sets' })
womenSaree('w-saree-velvet', 'Velvet Saree with Zardozi Pallu', 'saree-silk', 3, ['Zardozi', 'Dabka', 'Stone Work'], [PALETTE.jewelDeep, PALETTE.evening], ['Velvet'], ['reception', 'winter', 'family'], 'sarees', [3499, 9999], 'sareeDrape', { cat: 'sarees' })
womenSaree('w-saree-linen', 'Linen Saree with Woven Check', 'saree-concept', 4, ['Ikat Weave', 'None', 'Block Print', 'Buti Motifs'], [PALETTE.neuters, PALETTE.mutedEarth, PALETTE.warm], ['Linen'], ['workwear', 'casual', 'travel', 'puja'], 'sarees', [1299, 3499], 'sareeDrape')
womenSaree('w-saree-hcotton', 'Handloom Cotton Saree', 'saree-drape', 4, ['Handloom', 'Block Print', 'Kalamkari', 'None'], [PALETTE.heirloom, PALETTE.mutedEarth, PALETTE.pastels], ['Handloom Cotton', 'Khadi Cotton', 'Cotton Silk'], ['diwali', 'festive', 'puja', 'family'], 'sarees', [899, 2499], 'sareeDrape')
womenSaree('w-saree-buti', 'Buti-Motif Georgette Saree', 'saree-drape', 3, ['Buti Motifs', 'Jaal Lattice', 'Chikankari'], [PALETTE.pastels, PALETTE.warm], ['Georgette', 'Chiffon', 'Crepe'], ['college', 'festive', 'casual'], 'sarees', [999, 2799], 'sareeDrape')
womenSaree('w-saree-banarasi', 'Banarasi Silk Saree', 'saree-silk', 4, ['Banarasi Weave', 'Zari', 'Kadhuan Motifs', 'Sequit Work'], [PALETTE.festiveJewel, PALETTE.warm], ['Banarasi Silk', 'Art Silk'], ['wedding', 'reception', 'engagement', 'guest', 'family'], 'sarees', [4999, 13999], 'sareeDrape')
womenSaree('w-saree-handloom-ikkat', 'Handloom Ikkat Saree', 'saree-silk', 4, ['Ikkat Weave', 'Maddur Edge', 'Tone-on-Tone', 'None'], [PALETTE.heirloom, PALETTE.mutedEarth, PALETTE.pastels], ['Handloom Cotton', 'Cotton Silk', 'Tussar Silk'], ['festive', 'workwear', 'puja', 'family'], 'sarees', [1699, 4999], 'sareeDrape')
womenSaree('w-predrape-banarasi', 'Pre-Draped Banarasi Saree', 'saree-predrape', 3, ['Banarasi Weave', 'Zari', 'Sequit Work'], [PALETTE.metal, PALETTE.festiveJewel], ['Banarasi Silk'], ['reception', 'wedding', 'diwali', 'engagement'], 'sarees', [3499, 9999], 'drape', { cat: 'sarees' })
womenSaree('w-predrape-organza', 'Pre-Draped Organza Saree', 'saree-predrape', 5, ['Tone-on-Tone', 'Dried Flower Work', 'Pearl Detailing', 'Gotapatti'], [PALETTE.pastels, PALETTE.metal], ['Organza'], ['mehendi', 'sangeet', 'travel'], 'sarees', [2499, 6499], 'drape')
womenSaree('w-predrape-chiffon', 'Pre-Draped Chiffon Saree', 'saree-predrape', 3, ['Buti Motifs', 'Block Print', 'None'], [PALETTE.warm, PALETTE.mutedEarth], ['Chiffon'], ['college', 'party', 'date', 'travel'], 'sarees', [1499, 3499], 'drape', { cat: 'indowestern-sets' })
womenSaree('w-saree-concept-1', 'Saree-Inspired Drape Gown', 'saree-concept', 3, ['Draped', 'Sequit All-Over', 'Mirror Work'], [PALETTE.festiveJewel, PALETTE.evening], ['Georgette'], ['sangeet', 'reception', 'party'], 'sarees', [3499, 8999], 'sareeConcept', { cat: 'indowestern-sets' })
womenSaree('w-saree-concept-2', 'Half-Saree with Asymmetric Top', 'saree-concept', 3, ['Mirror Work', 'Kamdani', 'Thread Embroidery'], [PALETTE.warm], ['Cotton Silk'], ['college', 'festive', 'sangeet', 'garba'], 'sarees', [1999, 4499], 'sareeConcept', { cat: 'garba-chaniya' })
womenSaree('w-saree-concept-3', 'Draped Saree with Pant', 'saree-predrape', 3, ['Tone-on-Tone', 'Buti Motifs', 'Pearl Detailing'], [PALETTE.mutedEarth], ['Crepe'], ['reception', 'travel'], 'sarees', [2999, 6999], 'drape', { cat: 'indowestern-sets' })
womenSaree('w-saree-gown', 'Saree Drape Gown (Evening)', 'saree-gown', 3, ['Sequit All-Over', 'Aari', 'Stone Work'], [PALETTE.evening], ['Satin'], ['reception', 'date'], 'sarees', [3499, 8499], 'sareeConcept', { cat: 'indowestern-sets' })
// ── women · kurta sets (60) ──
set('w-kurtiset-anarkali', 'Anarkali Kurta Set', 'anarkali', 6, ['Chikankari', 'Kashmiri Embroidery', 'Aari', 'Mirror Work', 'Tone-on-Tone', 'Sequit Work'], [PALETTE.festiveJewel, PALETTE.heirloom, PALETTE.warm, PALETTE.pastels], ['Georgette', 'Chanderi', 'Rayon', 'Satin'], ['sangeet', 'festive', 'diwali', 'wedding', 'family'], 'kurta-sets', [1799, 5999], 'anarkali')
set('w-kurtiset-sharara', 'Sharara Set', 'sharara', 4, ['Kamdani', 'Sequit Work', 'Gotapatti', 'Chikankari'], [PALETTE.warm, PALETTE.heirloom], ['Chanderi'], ['sangeet', 'mehendi', 'reception', 'family'], 'kurta-sets', [1999, 5499], 'kurta')
set('w-kurtiset-gharara', 'Gharara Set', 'gharara', 3, ['Kamdani', 'Chikankari', 'Block Print'], [PALETTE.heirloom, PALETTE.metal, PALETTE.pastels], ['Georgette'], ['sangeet', 'mehendi', 'family'], 'kurta-sets', [1799, 4999], 'kurta')
set('w-kurtiset-palazzo', 'Palazzo Kurta Set', 'palazzo-set', 5, ['Chikankari', 'Block Print', 'Resham Threadwork', 'Aari', 'Bagru Print'], [PALETTE.pastels, PALETTE.heirloom, PALETTE.mutedEarth], ['Cotton', 'Rayon', 'Khadi Cotton', 'Chanderi', 'Handloom Cotton', 'Chanderi Silk'], ['college', 'casual', 'workwear', 'diwali', 'festive'], 'kurta-sets', [1199, 3499], 'kurta')
set('w-kurtiset-silk', 'Silk Kurta Set', 'kurta-set', 4, ['Zari', 'Buti Motifs', 'Tone-on-Tone', 'Dabka'], [PALETTE.festiveJewel], ['Art Silk', 'Cotton Silk', 'Tussar Silk', 'Kerala Kasavu'], ['diwali', 'wedding', 'reception', 'puja'], 'kurta-sets', [2499, 6499], 'kurta')
set('w-kurtiset-straight', 'Straight-Cut Kurta Set', 'kurta-straight', 8, ['Chikankari', 'Block Print', 'Thread Embroidery', 'Mirror Work', 'Aari', 'None'], [PALETTE.pastels, PALETTE.heirloom], ['Cotton', 'Linen', 'Rayon', 'Handloom Cotton', 'Khadi Cotton'], ['casual', 'college', 'workwear', 'family'], 'kurta-sets', [999, 2999], 'kurta')
set('w-kurtiset-aline', 'A-Line Kurti Set with Slit Pants', 'kurta-aline', 6, ['Chikankari', 'Block Print', 'Kalamkari', 'Aari', 'Bagru Print'], [PALETTE.heirloom, PALETTE.pastels], ['Rayon', 'Cotton'], ['college', 'casual', 'workwear', 'festive'], 'kurta-sets', [999, 2799], 'kurta')
set('w-kurtiset-highlow', 'High-Low Anarkali', 'anarkali', 4, ['Kamdani', 'Gotapatti', 'Resham Threadwork', 'Pearl Detailing'], [PALETTE.warm, PALETTE.festiveJewel, PALETTE.heirloom], ['Chanderi'], ['sangeet', 'mehendi', 'festive'], 'kurta-sets', [1999, 4999], 'anarkali')
set('w-kurtiset-asym', 'Asymmetric Hem Kurta Set', 'kurta-aline', 4, ['Aari', 'Tone-on-Tone', 'Buti Motifs', 'Pearl Detailing'], [PALETTE.mutedEarth, PALETTE.pastels], ['Crepe', 'Modal Blend'], ['workwear', 'college', 'date'], 'kurta-sets', [1499, 3499], 'kurta')
set('w-kurtiset-dhoti', 'Dhoti-Pant Kurta Set', 'dhoti-skirt', 3, ['Chikankari', 'Mirror Work', 'Bagru Print'], [PALETTE.heirloom, PALETTE.brights], ['Cotton'], ['garba', 'navratri', 'festive'], 'kurta-sets', [1499, 3299], 'kurta')
set('w-kurtiset-dupatta', 'Kurta Set with Dupatta', 'kurta-set-dupatta', 5, ['Gotapatti', 'Kashmiri Embroidery', 'Chikankari', 'Pearl Detailing', 'Aari'], [PALETTE.festiveJewel, PALETTE.pastels, PALETTE.evening, PALETTE.heirloom, PALETTE.warm], ['Georgette', 'Cotton Silk', 'Viscose', 'Rayon', 'Chanderi'], ['diwali', 'festive', 'sangeet', 'wedding', 'family'], 'kurta-sets', [1799, 4999], 'kurta')
set('w-kurtiset-print', 'Printed Kurta Set', 'kurta-straight', 4, ['Block Print', 'Kalamkari', 'Bagru Print', 'Ajrakh Print'], [PALETTE.heirloom, PALETTE.pastels], ['Cotton', 'Viscose', 'Rayon', 'Linen'], ['college', 'casual', 'workwear'], 'kurta-sets', [799, 2499], 'kurta')
set('w-kurtiset-jacket', 'Kurta Set with Jacket', 'kurta-set', 4, ['Chikankari', 'Mirror Work', 'Aari', 'Kamdani'], [PALETTE.festiveJewel, PALETTE.metal], ['Silk Blend', 'Georgette'], ['reception', 'sangeet', 'engagement', 'family'], 'kurta-sets', [3499, 8499], 'kurta')
set('w-kurtiset-cape', 'Cape Kurta Set', 'kurta-set', 3, ['Sequit Work', 'Draped', 'Tone-on-Tone'], [PALETTE.evening, PALETTE.metal], ['Chiffon', 'Viscose'], ['sangeet', 'party', 'reception'], 'kurta-sets', [2499, 5499], 'kurta')
// ── women · co-ords (36) ──
set('w-coord-silk', 'Silk Co-ord Set', 'co-ord', 4, ['None', 'Zari', 'Buti Motifs'], [PALETTE.festiveJewel, PALETTE.warm], ['Silk Blend'], ['sangeet', 'reception', 'diwali'], 'kurta-sets', [2499, 5999], 'coord', { cat: 'co-ord-sets' })
set('w-coord-rawmango', 'Raw Mango Co-ord', 'co-ord', 4, ['None', 'Tone-on-Tone', 'Pearl Detailing'], [PALETTE.neuters, PALETTE.mutedEarth], ['Raw Mango'], ['casual', 'workwear', 'college'], 'kurta-sets', [1499, 3499], 'coord', { cat: 'co-ord-sets' })
set('w-coord-cotton', 'Cotton Co-ord Set', 'co-ord', 5, ['None', 'Handloom', 'Stripes'], [PALETTE.heirloom, PALETTE.warm], ['Cotton', 'Handloom Cotton'], ['casual', 'college', 'travel'], 'kurta-sets', [999, 2299], 'coord', { cat: 'co-ord-sets' })
set('w-coord-viscose', 'Viscose Co-ord with Belt', 'co-ord', 4, ['Zari', 'Pearl Detailing', 'Sequit Work'], [PALETTE.mutedEarth, PALETTE.evening], ['Viscose'], ['workwear', 'college', 'casual', 'date'], 'kurta-sets', [1299, 2999], 'coord', { cat: 'co-ord-sets' })
set('w-coord-satin', 'Satin Co-ord Set', 'co-ord', 3, ['Pearl Detailing', 'Tone-on-Tone', 'Sequit Work'], [PALETTE.pastels, PALETTE.evening], ['Satin'], ['reception', 'sangeet', 'date'], 'kurta-sets', [2499, 4999], 'coord', { cat: 'indowestern-sets' })
set('w-coord-linen', 'Linen Co-ord Set', 'co-ord', 3, ['Zardozi', 'Draped', 'Block Print', 'None'], [PALETTE.heirloom, PALETTE.pastels, PALETTE.mutedEarth], ['Linen'], ['casual', 'workwear', 'college', 'date'], 'kurta-sets', [1499, 3499], 'coord', { cat: 'co-ord-sets' })
set('w-coord-crop', 'Cropped Jacket Co-ord', 'co-ord', 3, ['Gotapatti', 'Zari', 'Stone Work', 'Aari'], [PALETTE.festiveJewel], ['Raw Silk'], ['sangeet', 'reception', 'party'], 'kurta-sets', [2499, 5999], 'coord', { cat: 'co-ord-sets' })
set('w-coord-palazzo', 'Crop-top Palazzo Co-ord', 'co-ord', 3, ['Thread Embroidery', 'Dried Flower Work', 'Pearl Detailing', 'Sequit Work'], [PALETTE.pastels, PALETTE.mutedEarth], ['Modal Blend', 'Linen'], ['casual', 'college', 'travel', 'date'], 'kurta-sets', [1299, 2999], 'coord', { cat: 'co-ord-sets' })
set('w-coord-skirt', 'Top-and-Skirt Co-ord', 'co-ord', 2, ['Mirror Work', 'Zardozi', 'Sequit Work'], [PALETTE.metal, PALETTE.pastels], ['Cotton', 'Tissue'], ['sangeet', 'college', 'navratri'], 'kurta-sets', [1799, 3499], 'coord', { cat: 'co-ord-sets' })
set('w-coord-print', 'Printed Co-ord Set', 'co-ord-print', 3, ['Block Print', 'Ajrakh Print', 'Kalamkari'], [PALETTE.warm, PALETTE.heirloom], ['Rayon', 'Cotton'], ['college', 'casual', 'workwear'], 'kurta-sets', [899, 1999], 'coord', { cat: 'co-ord-sets' })
set('w-coord-dupatta', 'Co-ord with Dupatta', 'co-ord-dupatta', 3, ['Block Print', 'Bagru Print', 'Kalamkari', 'Zari'], [PALETTE.warm, PALETTE.heirloom, PALETTE.metal], ['Chanderi', 'Rayon'], ['festive', 'family', 'diwali'], 'kurta-sets', [1499, 3499], 'coord', { cat: 'co-ord-sets' })
// ── women · lehengas (34) ──
set('w-leh-classic', 'Embroidered Lehenga', 'lehenga', 6, ['Zardozi', 'Sequit Work', 'Aari', 'Mirror Work', 'Dabka'], [PALETTE.festiveJewel, PALETTE.heirloom], ['Raw Silk', 'Silk Blend', 'Cotton Silk'], ['sangeet', 'wedding', 'reception', 'engagement', 'guest'], 'lehenga', [3999, 12999], 'lehenga', { cat: 'lehenga' })
set('w-leh-net', 'Net Lehenga with Sequin Border', 'lehenga', 6, ['Sequit Work', 'Dabka', 'Zardozi', 'Stone Work', 'Tone-on-Tone'], [PALETTE.evening, PALETTE.heirloom, PALETTE.metal], ['Net'], ['sangeet', 'reception', 'engagement'], 'lehenga', [4999, 12999], 'lehenga', { cat: 'lehenga' })
set('w-leh-satin', 'Satin Lehenga with Gotapatti', 'lehenga', 4, ['Gotapatti', 'Zardozi', 'Pearl Detailing'], [PALETTE.festiveJewel, PALETTE.evening], ['Satin'], ['sangeet', 'reception', 'party'], 'lehenga', [2999, 7499], 'lehenga', { cat: 'lehenga' })
set('w-leh-velvet', 'Velvet Lehenga', 'lehenga', 3, ['Zardozi', 'Dabka', 'Resham Threadwork'], [PALETTE.jewelDeep], ['Velvet'], ['reception', 'winter', 'family'], 'lehenga', [5499, 12999], 'lehenga', { cat: 'lehenga' })
set('w-leh-sequin', 'Sequin Work Lehenga', 'lehenga', 5, ['Sequit All-Over', 'Zardozi', 'Stone Work', 'Dabka'], [PALETTE.brights, PALETTE.evening], ['Georgette', 'Net'], ['sangeet', 'reception', 'navratri'], 'lehenga', [3999, 9999], 'lehenga', { cat: 'lehenga' })
set('w-leh-print', 'Printed Cotton Lehenga', 'lehenga-print', 3, ['Block Print', 'Bandhani', 'Kalamkari'], [PALETTE.warm], ['Cotton', 'Handloom Cotton'], ['navratri', 'garba', 'college', 'mehendi'], 'lehenga', [1799, 3999], 'lehenga', { cat: 'garba-chaniya' })
set('w-leh-skirt', 'Lehenga Skirt (Separate)', 'lehenga-skirt', 4, ['Gotapatti', 'Block Print', 'Mirror Work', 'Sequit Work'], [PALETTE.brights, PALETTE.heirloom], ['Cotton', 'Raw Silk'], ['sangeet', 'navratri', 'college'], 'lehenga', [1499, 4999], 'lehenga', { cat: 'lehenga' })
set('w-leh-modern', 'Modern Mermaid Lehenga', 'lehenga-modern', 3, ['Sequit All-Over', 'Pearl Detailing', 'Tone-on-Tone'], [PALETTE.evening, PALETTE.metal], ['Georgette'], ['sangeet', 'reception', 'party'], 'lehenga', [4499, 9999], 'lehenga', { cat: 'indowestern-sets' })
set('w-leh-shortsuit', 'Short Lehenga Suit', 'lehenga-modern', 3, ['Zardozi', 'Chikankari', 'Gotapatti'], [PALETTE.warm], ['Chanderi'], ['college', 'sangeet', 'mehendi'], 'lehenga', [1799, 3499], 'lehenga', { cat: 'lehenga' })
// ── women · fusion (28) ──
set('w-fusion-indowest', 'Indo-Western Gown Set', 'co-ord-dupatta', 6, ['Chikankari', 'Sequit Work', 'Mirror Work', 'Zardozi', 'Kamdani'], [PALETTE.metal, PALETTE.evening, PALETTE.pastels, PALETTE.mutedEarth], ['Raw Mango', 'Viscose', 'Modal Blend'], ['reception', 'party', 'travel'], 'indowestern-sets', [1999, 5999], 'kurta', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-kurti-jeans', 'Kurti-and-Jeans Set', 'kurti-jeans', 5, ['Chikankari', 'Mirror Work', 'Pearl Detailing', 'None'], [PALETTE.pastels, PALETTE.heirloom, PALETTE.neuters], ['Rayon', 'Cotton', 'Modal Blend', 'Chanderi'], ['college', 'casual', 'date', 'travel'], 'women-sets', [999, 2499], 'kurti', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-gown', 'Festive Gown (Indo-Western)', 'saree-gown', 3, ['Sequit All-Over', 'Aari', 'Gotapatti'], [PALETTE.warm, PALETTE.evening], ['Raw Mango', 'Tissue'], ['sangeet', 'reception', 'navratri'], 'indowestern-sets', [3499, 8999], 'drape', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-drape', 'Draped Gown with Dhoti Pant', 'drape', 3, ['Zari', 'Tone-on-Tone', 'Pearl Detailing'], [PALETTE.pastels, PALETTE.metal], ['Tussar', 'Raw Mango'], ['sangeet', 'reception', 'party'], 'indowestern-sets', [2999, 6999], 'drape', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-pantsuit', 'Nehru-Collar Co-ord Suit', 'co-ord', 3, ['Block Print', 'Kalamkari', 'Pearl Detailing'], [PALETTE.mutedEarth, PALETTE.heirloom], ['Cotton', 'Linen'], ['casual', 'workwear', 'college', 'travel'], 'indowestern-sets', [1999, 4499], 'coord', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-dhoti', 'Dhoti Skirt with Choli', 'dhoti-skirt', 3, ['Tone-on-Tone', 'Pearl Detailing', 'Sequit Work'], [PALETTE.festiveJewel], ['Cotton', 'Raw Silk'], ['garba', 'navratri', 'college', 'party'], 'indowestern-sets', [1499, 3499], 'kurta', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-shirt', 'Ethnic Shirt Dress', 'kurta-straight', 5, ['Chanderi Weave', 'Handloom', 'Thread Embroidery', 'None'], [PALETTE.heirloom, PALETTE.warm], ['Chanderi', 'Cotton'], ['diwali', 'workwear', 'family'], 'indowestern-sets', [1499, 3499], 'kurti', { gender: 'women', cat: 'indowestern-sets' })
set('w-fusion-jacket', 'Jacket-over-Kurta Set', 'kurta-set', 3, ['Zari', 'Sequit Work', 'Resham Threadwork'], [PALETTE.evening], ['Silk Blend', 'Georgette'], ['reception', 'sangeet', 'party', 'guest'], 'indowestern-sets', [3499, 7999], 'kurta', { gender: 'women', cat: 'indowestern-sets' })
// ── women · kurtis (20) ──
set('w-kurti-straight', 'Cotton Straight Kurti', 'straight-kurti', 5, ['Chikankari', 'Aari', 'Block Print', 'Mirror Work', 'Kamdani'], [PALETTE.pastels, PALETTE.heirloom, PALETTE.warm], ['Cotton', 'Handloom Cotton', 'Khadi Cotton', 'Modal Blend'], ['casual', 'college', 'workwear', 'festive', 'family'], 'kurta-sets', [699, 1999], 'kurti', { gender: 'women', cat: 'kurta-sets' })
set('w-kurti-print', 'Printed Everyday Kurti', 'straight-kurti', 5, ['Block Print', 'Kalamkari', 'Ajrakh Print', 'Bagru Print'], [PALETTE.heirloom, PALETTE.warm], ['Cotton', 'Rayon'], ['casual', 'college', 'travel'], 'kurta-sets', [599, 1699], 'kurti', { gender: 'women', cat: 'kurta-sets' })
set('w-kurti-chikan', 'Chikankari Kurti', 'straight-kurti', 6, ['Chikankari', 'Kamdani', 'Tone-on-Tone', 'Resham Threadwork', 'Pearl Detailing'], [PALETTE.neuters, PALETTE.pastels, PALETTE.warm], ['Cotton', 'Chanderi', 'Modal Blend', 'Viscose'], ['diwali', 'festive', 'family', 'workwear'], 'kurta-sets', [999, 2799], 'kurti', { gender: 'women', cat: 'kurta-sets' })
set('w-kurti-east', 'East-Frame Asymmetric Kurti', 'kurta-aline', 3, ['Chikankari', 'Kutch Embroidery', 'Gotapatti'], [PALETTE.warm, PALETTE.pastels], ['Cotton', 'Modal Blend'], ['casual', 'college', 'workwear'], 'kurta-sets', [799, 1999], 'kurti', { gender: 'women', cat: 'kurta-sets' })
set('w-kurti-highlow', 'High-Llow Cotton Kurti with Tiros', 'kurta-aline', 3, ['Aari', 'Mirror Work', 'Dried Flower Work'], [PALETTE.warm, PALETTE.heirloom], ['Cotton'], ['diwali', 'festive', 'navratri'], 'kurta-sets', [1299, 2799], 'kurti', { gender: 'women', cat: 'kurta-sets' })

// ── men (136) ──
set('m-kurtiset-cotton', 'Cotton Kurta Set', 'men-kurta', 8, ['Chikankari', 'Block Print', 'Thread Embroidery', 'None', 'Pearl Detailing', 'Tone-on-Tone', 'Aari'], [PALETTE.neuters, PALETTE.warm, PALETTE.mutedEarth], ['Cotton', 'Linen', 'Handloom Cotton', 'Khadi Cotton'], ['diwali', 'casual', 'puja', 'college', 'family'], 'ethnic-bottomwear', [899, 2499], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurtiset-silk', 'Silk Kurta Set', 'men-kurta', 6, ['Zari', 'Buti Motifs', 'Kamdani', 'Aari', 'Tone-on-Tone', 'None'], [PALETTE.festiveJewel, PALETTE.evening], ['Art Silk', 'Cotton Silk', 'Raw Silk', 'Kerala Kasavu'], ['diwali', 'wedding', 'festive', 'reception'], 'ethnic-bottomwear', [1999, 4999], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurtiset-chikankari', 'Chikankari Kurta Set', 'men-kurta', 5, ['Chikankari', 'Kamdani', 'Resham Threadwork', 'Pearl Detailing', 'Tone-on-Tone'], [PALETTE.neuters, PALETTE.warm, PALETTE.evening], ['Cotton', 'Chanderi', 'Modal Blend'], ['diwali', 'festive', 'reception', 'family'], 'men-kurtas-sets', [1499, 3499], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurtiset-printed', 'Printed Kurta Set', 'men-kurta-print', 5, ['Block Print', 'Ajrakh Print', 'Kalamkari', 'Bagru Print', 'Paisley Print'], [PALETTE.warm, PALETTE.heirloom, PALETTE.brights], ['Rayon', 'Modal Blend', 'Viscose'], ['college', 'casual', 'travel', 'festive'], 'men-kurtas-sets', [999, 2499], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurtiset-pathani', 'Pathani Suit Set', 'men-kurta', 4, ['Thread Embroidery', 'Pearl Detailing', 'None', 'Aari'], [PALETTE.warm, PALETTE.evening, PALETTE.neuters], ['Cotton', 'Linen'], ['casual', 'family', 'festive'], 'men-kurtas-sets', [1299, 2999], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurtiset-linen', 'Linen Kurta with Drawstring Pant', 'men-kurta', 4, ['None', 'Tone-on-Tone', 'Block Print', 'Aari', 'Thread Embroidery'], [PALETTE.neuters, PALETTE.warm, PALETTE.mutedEarth], ['Linen'], ['casual', 'travel', 'college', 'family'], 'men-kurtas-sets', [1499, 3299], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurt-set-jamawar', 'Jamawar Shawl Kurta Set', 'men-kurta', 3, ['Jaal Lattice', 'Paisley Print', 'Tone-on-Tone'], [PALETTE.festiveJewel], ['Pashmina', 'Wool Blend'], ['reception', 'winter', 'diwali'], 'men-kurtas-sets', [3499, 7999], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurt-set-brocade', 'Brocade Kurta Set', 'men-kurta', 3, ['Zari', 'Sequit Work', 'Dabka', 'Jacquard Weave'], [PALETTE.metal, PALETTE.evening], ['Brocade'], ['sangeet', 'reception', 'winter'], 'men-kurtas-sets', [2999, 6999], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-kurt-set-jacket', 'Kurta Set with Nehru Jacket', 'men-kurta-jacket', 5, ['Zardozi', 'Gotapatti', 'Chikankari', 'Stone Work', 'Tone-on-Tone'], [PALETTE.evening, PALETTE.festiveJewel], ['Raw Silk', 'Cotton Silk', 'Georgette'], ['reception', 'sangeet', 'diwali', 'family', 'winter'], 'men-kurtas-sets', [2999, 7499], 'jacket', { gender: 'men', cat: 'men-kurtas-sets' })
set('m-kurt-set-dupatta', 'Kurta Set with Dupatta & Stole', 'men-kurta', 5, ['Zari', 'Gotapatti', 'Chikankari', 'Thread Embroidery', 'Mirror Work'], [PALETTE.warm, PALETTE.heirloom], ['Cotton Silk', 'Georgette'], ['festive', 'wedding', 'reception'], 'men-kurtas-sets', [1999, 4999], 'kurtaMen', { gender: 'men', cat: 'men-kurtas-sets' })
set('m-kurt-set-short', 'Short Kurta with Trouser', 'men-short-kurta', 4, ['Chikankari', 'Block Print', 'Aari', 'Pearl Detailing'], [PALETTE.warm, PALETTE.pastels, PALETTE.evening], ['Modal', 'Linen', 'Cotton'], ['casual', 'college', 'date'], 'men-kurtas-sets', [999, 2499], 'kurtaMen', { gender: 'men', cat: 'men-kurta-sets' })
set('m-jacket-brocade', 'Nehru Jacket (Brocade)', 'men-jacket', 5, ['Zari', 'Buti Motifs', 'Sequit Work', 'Jaal Lattice', 'None'], [PALETTE.metal, PALETTE.festiveJewel], ['Raw Silk', 'Brocade'], ['wedding', 'reception', 'sangeet', 'diwali'], 'men-jackets', [2499, 5999], 'jacket', { gender: 'men', cat: 'men-jackets' })
set('m-jacket-velvet', 'Velvet Bandhgala Jacket', 'men-jacket', 4, ['Zardozi', 'Stone Work', 'Dabka'], [PALETTE.jewelDeep], ['Velvet'], ['reception', 'winter', 'party'], 'men-jackets', [3999, 8999], 'jacket', { gender: 'men', cat: 'men-jackets' })
set('m-jacket-rawmango', 'Raw Mango Jacket', 'men-jacket', 3, ['Chikankari', 'Thread Embroidery', 'Tone-on-Tone'], [PALETTE.neuters, PALETTE.warm], ['Raw Mango'], ['reception', 'travel', 'diwali', 'guest'], 'men-jackets', [1999, 4499], 'jacket', { gender: 'men', cat: 'men-jackets' })
set('m-bandhgala-silk', 'Silk Bandhgala Jacket', 'men-bandhgala', 6, ['Zardozi', 'Gotapatti', 'Sequit Work', 'Resham Threadwork', 'Dabka'], [PALETTE.festiveJewel, PALETTE.heirloom, PALETTE.metal], ['Silk Blend', 'Raw Silk'], ['reception', 'wedding', 'sangeet'], 'men-jackets', [3999, 9999], 'bandhgala', { gender: 'men', cat: 'men-jackets' })
set('m-sherwani', 'Embroidered Sherwani', 'men-sherwani', 4, ['Zardozi', 'Dabka', 'Stone Work', 'Resham Threadwork'], [PALETTE.warm, PALETTE.jewelDeep, PALETTE.evening], ['Brocade', 'Velvet'], ['reception', 'wedding', 'sangeet'], 'sherwani', [6499, 13999], 'sherwani', { gender: 'men', cat: 'men-jackets' })
set('m-jacket-printed', 'Printed Nehru Jacket', 'men-jacket', 3, ['Block Print', 'Kalamkari', 'Jaal Lattice'], [PALETTE.warm, PALETTE.heirloom], ['Viscose', 'Cotton'], ['college', 'party', 'navratri'], 'men-jackets', [1499, 2999], 'jacket', { gender: 'men', cat: 'men-jackets' })
set('m-jacket-emb', 'Thread-Embroidered Jacket', 'men-jacket', 3, ['Thread Embroidery', 'Mirror Work', 'Resham Threadwork'], [PALETTE.heirloom, PALETTE.warm], ['Cotton Silk', 'Modal Blend'], ['sangeet', 'navratri', 'party'], 'men-jackets', [1999, 3999], 'jacket', { gender: 'men', cat: 'men-jackets' })
set('m-indowest-drape', 'Draped Kurta with Asymmetric Hem', 'men-kurta', 4, ['Thread Embroidery', 'Block Print', 'Pearl Detailing', 'Sequit Work'], [PALETTE.brights, PALETTE.heirloom], ['Georgette', 'Rayon', 'Raw Mango'], ['sangeet', 'college', 'party'], 'indowestern-sets', [1799, 3999], 'kurtaMen', { gender: 'men', cat: 'indowestern-sets' })
set('m-indowest-skirt', 'Ethnic Skirt & Kurta Set', 'men-kurta', 4, ['Zari', 'Chikankari', 'Sequit Work', 'Kamdani'], [PALETTE.warm], ['Kerala Kasavu', 'Raw Silk'], ['festive', 'engagement', 'travel', 'navratri'], 'indowestern-sets', [1999, 4499], 'kurtaMen', { gender: 'men', cat: 'indowestern-sets' })
set('m-waistcoat-set', 'Waistcoat with Straight Kurta', 'men-waistcoat', 6, ['Zardozi', 'Resham Threadwork', 'Thread Embroidery', 'Pearl Detailing', 'Mirror Work'], [PALETTE.warm, PALETTE.heirloom, PALETTE.evening], ['Raw Mango', 'Jacquard'], ['sangeet', 'reception', 'wedding', 'diwali', 'family', 'date', 'guest'], 'indowestern-sets', [2499, 5999], 'jacket', { gender: 'men', cat: 'indowestern-sets' })
set('m-kurta-jeans', 'Kurta over Denim Set', 'men-kurta-trouser', 4, ['None', 'Chikankari', 'Pearl Detailing'], [PALETTE.neuters, PALETTE.brights], ['Cotton', 'Modal Blend'], ['college', 'casual', 'date'], 'indowestern-sets', [1499, 2999], 'kurtaMen', { gender: 'men', cat: 'indowestern-sets' })
set('m-shirt-trouser', 'Ethnic Shirt & Trouser', 'men-kurta-trouser', 4, ['Chanderi Weave', 'Handloom', 'Tone-on-Tone', 'Thread Embroidery'], [PALETTE.heirloom, PALETTE.evening, PALETTE.warm], ['Chanderi', 'Cotton'], ['college', 'casual', 'workwear', 'travel'], 'indowestern-sets', [1299, 2999], 'kurtaMen', { gender: 'men', cat: 'indowestern-sets' })
set('m-coord-suit', 'Festive Co-ord Suit', 'men-co-ord', 5, ['Tone-on-Tone', 'Pearl Detailing', 'Buti Motifs', 'Zari', 'Kamdani'], [PALETTE.warm, PALETTE.mutedEarth], ['Modal Blend', 'Viscose'], ['casual', 'reception', 'festive', 'workwear'], 'top-bottom-wear', [1799, 3999], 'coord', { gender: 'men', cat: 'men-kurtas-sets' })
set('m-coat-set', 'Long Coat Kurta Set', 'men-sherwani', 3, ['Pearl Detailing', 'Sequit Work', 'Dabka', 'Jaal Lattice', 'Resham Threadwork'], [PALETTE.mutedEarth, PALETTE.heirloom], ['Linen', 'Wool Blend'], ['casual', 'winter', 'reception'], 'indowestern-sets', [2999, 5999], 'kurtaMen', { gender: 'men', cat: 'men-jackets' })
set('m-asym-coord', 'Asymmetric Co-ord with Stole', 'men-co-ord', 4, ['Thread Embroidery', 'Block Print', 'Tone-on-Tone'], [PALETTE.brights, PALETTE.metal], ['Modal', 'Linen'], ['sangeet', 'college', 'party'], 'indowestern-sets', [1999, 4499], 'coord', { gender: 'men', cat: 'indowestern-sets' })
set('m-fusion-set', 'Jacket-over-Shirt Fusion Set', 'men-kurta-jacket', 3, ['Tone-on-Tone', 'Zari', 'Chikankari', 'Sequit Work', 'Aari', 'Pearl Detailing', 'Jaal Lattice'], [PALETTE.evening, PALETTE.warm, PALETTE.heirloom], ['Cotton', 'Raw Mango'], ['college', 'party', 'reception', 'sangeet'], 'indowestern-sets', [1999, 4499], 'jacket', { gender: 'men', cat: 'indowestern-sets' })
set('m-garba-kediyu', 'Garba Kediyu Set', 'men-kurta-garba', 7, ['Mirror Work', 'Bandhani', 'Block Print', 'Resham Threadwork', 'Dried Flower Work', 'Bagru Print'], [PALETTE.warm, PALETTE.brights, PALETTE.heirloom], ['Cotton', 'Rayon'], ['garba', 'navratri', 'college'], 'garba-chaniya', [899, 2499], 'kurtaMen', { gender: 'men', cat: 'garba-chaniya' })
set('m-garba-kafni', 'Kafni & Kurta Dance Set', 'men-kurta-garba', 4, ['Bandhani', 'Mirror Work', 'Block Print'], [PALETTE.metal, PALETTE.warm], ['Rayon', 'Cotton'], ['garba', 'navratri', 'college'], 'garba-chaniya', [999, 2299], 'kurtaMen', { gender: 'men', cat: 'garba-chaniya' })
set('m-garba-vest', 'Embroidered Garba Vest Set', 'men-kurta-garba', 4, ['Mirror Work', 'Kamdani', 'Sequit Work'], [PALETTE.brights], ['Cotton'], ['garba', 'navratri'], 'garba-chaniya', [1199, 2499], 'kurtaMen', { gender: 'men', cat: 'garba-chaniya' })
set('m-coord-linen', 'Linen Summer Co-ord (Men)', 'men-co-ord', 3, ['Tone-on-Tone', 'Aari', 'Block Print'], [PALETTE.neuters, PALETTE.pastels], ['Linen'], ['workwear', 'casual', 'date'], 'top-bottom-wear', [1499, 2999], 'coord', { gender: 'men', cat: 'indowestern-sets' })
set('m-coord-cotton', 'Cotton Casual Co-ord (Men)', 'men-co-ord', 3, ['Pearl Detailing', 'Chikankari', 'Sequit Work'], [PALETTE.heirloom, PALETTE.warm], ['Cotton'], ['college', 'casual'], 'top-bottom-wear', [999, 1999], 'coord', { gender: 'men', cat: 'indowestern-sets' })
set('m-coord-silk', 'Silk Formal Co-ord (Men)', 'men-co-ord', 2, ['Dabka', 'Pearl Detailing', 'Zari'], [PALETTE.festiveJewel, PALETTE.evening], ['Silk Blend'], ['wedding', 'reception', 'festive'], 'top-bottom-wear', [2499, 4999], 'coord', { gender: 'men', cat: 'indowestern-sets' })
set('m-dhoti-kurta', 'Dhoti & Kurta Set', 'men-dhoti', 3, ['Gold Border', 'Tone-on-Tone', 'Sequit Work'], [PALETTE.neuters], ['Cotton Silk', 'Kerala Kasavu'], ['festive', 'puja', 'family'], 'men-kurtas-sets', [1799, 3999], 'kurtaMen', { gender: 'men', cat: 'men-kurtas-sets' })

// ── women accessories (80) ──
acc('w-ear-jhumka', 'Kundan Jhumka Earrings', 'earring', 3, ['earrings'], [PALETTE.metal, PALETTE.pastels], ['Gold-Plated Alloy', 'Kundan Set', 'Beaded Brass'], ['festive', 'wedding', 'diwali', 'sangeet'], 'earrings', [399, 1499], 'jewellery', { cat: 'earrings', gender: 'women', fabrics: ['Kundan Set', 'Beaded Brass', 'Gold-Plated Alloy'], crafts: ['Kundan Setting', 'Meenakari Enamel', 'Pearl Drop', 'Beaded', 'Enamel', 'Stone Work', 'Meenakari'] })
acc('w-ear-chandbali', 'Chandbali Earrings', 'earring', 2, ['earrings'], [PALETTE.metal, PALETTE.jewelDeep], ['Gold-Plated Alloy', 'Meenakari'], ['sangeet', 'wedding', 'reception'], 'earrings', [499, 1799], 'jewellery', { cat: 'earrings', fabrics: ['Kundan Set', 'Gold-Plated Alloy', 'Beaded Brass'], crafts: ['Meenakari Enamel', 'Stone Work', 'Kundan Setting', 'Meenakari'] })
acc('w-ear-stud', 'Pearl Stud Earrings', 'earring', 2, ['earrings'], [PALETTE.neuters, PALETTE.metal], ['Freshwater Pearl', 'Silver-Plated'], ['casual', 'workwear', 'college'], 'earrings', [299, 999], 'jewellery', { cat: 'earrings', fabrics: ['Freshwater Pearl', 'Silver-Plated Brass', 'Gold Vermeil'], crafts: ['Pearl Drop', 'Stone Work', 'Kundan Setting', 'Enamel'] })
acc('w-ear-hoop', 'Gold-Hoop Earrings', 'earring', 2, ['earrings'], [PALETTE.metal], ['Gold-Plated Alloy', 'Silver-Plated'], ['casual', 'party', 'college'], 'earrings', [299, 999], 'jewellery', { cat: 'earrings', fabrics: ['Gold-Plated Alloy', 'Beaded Brass', 'Kundan Set'], crafts: ['Pearl Drop', 'Enamel'] })
acc('w-ear-kundan', 'Kundan Drop Earrings', 'earring', 2, ['earrings'], [PALETTE.metal, PALETTE.festiveJewel], ['Kundan', 'Polki'], ['wedding', 'reception', 'engagement'], 'earrings', [799, 2999], 'jewellery', { cat: 'earrings', fabrics: ['Uncut Polki', 'Gold-Plated', 'Kundan Set'], crafts: ['Kundan Setting', 'Stone Work', 'Meenakari Enamel'] })
acc('w-ear-polki', 'Polki Chandelier Earrings', 'earring', 2, ['earrings'], [PALETTE.metal, PALETTE.neuters], ['Polki', 'Diamond-Cut CZ'], ['reception', 'engagement'], 'earrings', [1299, 4499], 'jewellery', { cat: 'earrings', fabrics: ['Uncut Polki', 'Gold Vermeil'], crafts: ['Uncut Polki', 'Kundan Setting'] })
acc('w-ear-drop', 'Enamel Drop Earrings', 'earring', 2, ['earrings'], [PALETTE.brights, PALETTE.pastels], ['Enamel Brass', 'Beaded'], ['college', 'casual', 'party'], 'earrings', [249, 799], 'jewellery', { cat: 'earrings', fabrics: ['Enamel Brass', 'Beaded Brass'], crafts: ['Enamel', 'Beaded', 'Pearl Drop'] })
acc('w-ear-thread', 'Threadwork Drop Earrings', 'earring', 2, ['earrings'], [PALETTE.heirloom], ['Silk Thread on Brass'], ['festive', 'sangeet'], 'earrings', [399, 1199], 'jewellery', { cat: 'earrings', fabrics: ['Silk Thread on Brass', 'Beaded Brass'], crafts: ['Resham Threadwork', 'Kamdani'] })
acc('w-ear-cuff', 'Ear Cuffs (No-Pierce)', 'earring', 2, ['earrings'], [PALETTE.metal, PALETTE.neuters], ['Gold-Plated Alloy', 'Oxidised Silver'], ['college', 'party'], 'earrings', [199, 699], 'jewellery', { cat: 'earrings', fabrics: ['Oxidised Silver', 'Gold-Plated Alloy'], crafts: ['Enamel', 'Beaded'] })
acc('w-ear-climber', 'Flower Climber Earrings', 'earring', 2, ['earrings'], [PALETTE.pastels, PALETTE.warm], ['Freshwater Flower', 'Brass'], ['casual', 'college', 'mehendi'], 'earrings', [249, 799], 'jewellery', { cat: 'earrings', fabrics: ['Resin Flower', 'Beaded Brass'], crafts: ['Pearl Drop', 'Kundan Setting', 'Beaded'] })
acc('w-neck-choker', 'Kundan Choker', 'necklace', 2, ['jewellery-sets'], [PALETTE.metal, PALETTE.festiveJewel], ['Gold-Plated Brass', 'Kundan'], ['reception', 'engagement', 'sangeet'], 'jewellery-sets', [999, 3999], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Uncut Polki', 'Pearl'], crafts: ['Uncut Polki', 'Meenakari', 'Beaded', 'Kundan Setting'] })
acc('w-neck-lac', 'Lac Lakha Necklace', 'necklace', 2, ['jewellery-sets'], [PALETTE.festiveJewel, PALETTE.metal], ['Lac & Glass Beads'], ['navratri', 'garba', 'sangeet'], 'jewellery-sets', [599, 1999], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Lac & Glass Beads', 'Beaded Brass'], crafts: ['Beaded', 'Meenakari'] })
acc('w-neck-long', 'Rani-Patta Long Necklace', 'necklace', 2, ['jewellery-sets'], [PALETTE.metal], ['Gold-Plated with Beads'], ['wedding', 'engagement', 'reception'], 'jewellery-sets', [1299, 3499], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Lac & Glass Beads', 'Pearl'], crafts: ['Beaded', 'Pearl Drop'] })
acc('w-neck-collar', 'Pearl Collar Necklace', 'necklace', 2, ['jewellery-sets'], [PALETTE.neuters], ['Faux Pearl'], ['casual', 'workwear', 'party'], 'jewellery-sets', [499, 1499], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Freshwater Pearl', 'Pearl'], crafts: ['Pearl Drop'] })
acc('w-neck-kundan', 'Kundan Choker Set', 'necklace', 2, ['jewellery-sets'], [PALETTE.metal], ['Kundan', 'Polki'], ['reception', 'sangeet', 'engagement'], 'jewellery-sets', [1999, 6499], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Kundan', 'Uncut Polki'], crafts: ['Kundan Setting', 'Uncut Polki', 'Pearl Drop', 'Beaded', 'Stone Work'] })
acc('w-neck-coin', 'Rajasthani Coin Necklace', 'necklace', 2, ['jewellery-sets'], [PALETTE.metal, PALETTE.heirloom], ['Antique-Finish Alloy'], ['festive', 'casual'], 'jewellery-sets', [499, 1499], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Antique Finish Alloy', 'Oxidised Silver'], crafts: ['Meenakari', 'Enamel', 'Kundan Setting', 'Uncut Polki'] })
acc('w-neck-thread', 'Temple-Jewellery Thread Set', 'necklace', 2, ['jewellery-sets'], [PALETTE.neuters, PALETTE.heirloom], ['Cotton Thread', 'Brass Temple'], ['puja', 'casual', 'diwali'], 'jewellery-sets', [299, 999], 'jewellery', { cat: 'jewellery-sets', fabrics: ['Cotton Thread & Brass', 'Beaded Brass'], crafts: ['Enamel', 'Resham Threadwork'] })
acc('w-rings', 'Statement Cocktail Rings (Pair)', 'ring', 2, ['rings'], [PALETTE.metal, PALETTE.brights], ['Brass', 'Resin Stone'], ['casual', 'college', 'party'], 'rings', [199, 799], 'jewellery', { cat: 'rings', fabrics: ['Resin Stone', 'Gold-Plated Brass', 'Oxidised Silver'], crafts: ['Enamel', 'Stone Work', 'Beaded'] })
acc('w-ring-cocktail', 'Meenakari Ring', 'ring', 2, ['rings'], [PALETTE.metal], ['Meenakari Brass'], ['sangeet', 'wedding'], 'rings', [499, 1499], 'jewellery', { cat: 'rings', fabrics: ['Meenakari Brass', 'Beaded Brass'], crafts: ['Meenakari', 'Enamel', 'Stone Work'] })
acc('w-ring-stack', 'Stackable Ring Set', 'ring', 2, ['rings'], [PALETTE.metal], ['Gold & Silver Plated'], ['casual', 'date'], 'rings', [299, 899], 'jewellery', { cat: 'rings', fabrics: ['Oxidised Silver', 'Gold-Plated Alloy'], crafts: ['Enamel', 'Pearl Drop'] })
acc('w-bangles', 'Glass Bangle Set', 'bangle', 2, ['bangles-bracelets'], [PALETTE.brights, PALETTE.warm], ['Glass'], ['diwali', 'festive', 'sangeet'], 'bangles-bracelets', [199, 799], 'jewellery', { cat: 'bangles-bracelets', fabrics: ['Lac Bangle', 'Oxidised Metal', 'Enamel Brass', 'Coconut Shell & Brass'], crafts: ['Lac', 'Meenakari', 'Beaded'] })
acc('w-kada', 'Oxidised Kada Set', 'bangle', 2, ['bangles-bracelets'], [PALETTE.heirloom, PALETTE.mutedEarth], ['Oxidised Metal'], ['casual', 'college', 'navratri'], 'bangles-bracelets', [299, 999], 'jewellery', { cat: 'bangles-bracelets', fabrics: ['Oxidised Metal', 'Brass'], crafts: ['Meenakari', 'Enamel'] })
acc('w-bracelet', 'Pearl Bracelet', 'bangle', 2, ['bangles-bracelets'], [PALETTE.neuters, PALETTE.metal], ['Faux Pearl', 'Gold Chain'], ['workwear', 'casual', 'date'], 'bangles-bracelets', [399, 1299], 'jewellery', { cat: 'bangles-bracelets', fabrics: ['Gold Vermeil', 'Pearl'], crafts: ['Beaded', 'Pearl Drop', 'Kundan Setting', 'Uncut Polki'] })
acc('w-tikka', 'Kundan Maang Tikka', 'tikka', 2, ['maang-tikka'], [PALETTE.metal, PALETTE.jewelDeep], ['Brass & Kundan'], ['sangeet', 'reception', 'wedding'], 'maang-tikka', [499, 1999], 'jewellery', { cat: 'maang-tikka', fabrics: ['Uncut Polki', 'Meenakari Brass'], crafts: ['Uncut Polki', 'Meenakari', 'Kundan Setting'] })
acc('w-patti', 'Passa / Matha Patti', 'headpiece', 2, ['maang-tikka'], [PALETTE.metal, PALETTE.pastels], ['Beaded Alloy'], ['sangeet', 'mehendi', 'navratri'], 'maang-tikka', [399, 1299], 'jewellery', { cat: 'maang-tikka', fabrics: ['Kundan Set', 'Beaded Brass'], crafts: ['Pearl Drop', 'Kundan Setting'] })
acc('w-passa', 'Marwari Passa', 'headpiece', 2, ['maang-tikka'], [PALETTE.metal], ['Gold-Plated Alloy'], ['wedding', 'sangeet'], 'maang-tikka', [599, 1799], 'jewellery', { cat: 'maang-tikka', fabrics: ['Antique Finish Alloy', 'Beaded Brass'], crafts: ['Beaded', 'Meenakari'] })
acc('w-hairpin', 'Pearl Hairpins (Set of 6)', 'hairpin', 2, ['brooches'], [PALETTE.neuters, PALETTE.pastels], ['Faux Pearl Pins'], ['mehendi', 'sangeet', 'casual'], 'brooches', [199, 699], 'jewellery', { cat: 'brooches', fabrics: ['Enamel Brass', 'Gold Plated Alloy'], crafts: ['Pearl Drop', 'Beaded'] })
acc('w-hair-jassa', 'Jassa Kauri Hair Chains (Set of 2)', 'hairpin', 2, ['brooches'], [PALETTE.metal], ['Gold-Plated Chain'], ['sangeet', 'reception', 'wedding'], 'brooches', [299, 899], 'jewellery', { cat: 'brooches', fabrics: ['Gold Plated Alloy', 'Kundan Set'], crafts: ['Kundan', 'Pearl Drop', 'Beaded'] })
acc('w-brooch', 'Jewellery Brooch', 'brooch', 2, ['brooches'], [PALETTE.metal, PALETTE.jewelDeep], ['Brass', 'Stone'], ['diwali', 'family', 'reception'], 'brooches', [399, 1299], 'jewellery', { cat: 'brooches', fabrics: ['Uncut Polki', 'Pearl'], crafts: ['Kundan', 'Stone Work'] })
acc('w-waistbelt', 'Kamarbandh Waist Belt', 'waistbelt', 2, ['brooches'], [PALETTE.metal], ['Gold Plated Alloy', 'Beaded'], ['sangeet', 'wedding', 'reception'], 'brooches', [499, 1499], 'jewellery', { cat: 'brooches', fabrics: ['Meenakari Brass', 'Beaded Brass'], crafts: ['Beaded', 'Meenakari'] })
acc('w-potli', 'Embroidered Potli Bag', 'potli', 3, ['potli-bags'], [PALETTE.festiveJewel, PALETTE.metal], ['Silk', 'Brocade'], ['sangeet', 'reception', 'wedding', 'diwali'], 'potli-bags', [599, 1999], 'bag', { cat: 'potli-bags', fabrics: ['Silk', 'Brocade', 'Velvet', 'Cane & Bamboo'], crafts: ['Mirror Work', 'Zardozi', 'Sequit Work', 'Tie & Dye', 'Enamel', 'Beaded'] })
acc('w-clutch', 'Satin Clutch with Beadwork', 'clutch', 2, ['clutches'], [PALETTE.metal, PALETTE.pastels], ['Satin', 'Beaded'], ['reception', 'party', 'date'], 'clutches', [699, 1999], 'bag', { cat: 'clutches', fabrics: ['Satin', 'Beaded', 'Enamel', 'Jute', 'Cane & Bamboo'], crafts: ['Beaded', 'Pearl Detailing', 'Sequit Work'] })
acc('w-clutch-cane', 'Cane & Bamboo Clutch', 'clutch', 2, ['clutches'], [PALETTE.heirloom, PALETTE.neuters], ['Rattan', 'Cane'], ['travel', 'casual', 'party'], 'clutches', [799, 2299], 'bag', { cat: 'clutches', fabrics: ['Rattan', 'Cane & Bamboo', 'Jute'], crafts: ['Cane Weave', 'Beaded', 'Enamel', 'Uncut Polki'] })
acc('w-sling', 'Embroidered Sling Bag', 'sling', 2, ['slung-bags'], [PALETTE.brights, PALETTE.heirloom], ['Cotton Canvas', 'Bandhani'], ['college', 'travel', 'casual'], 'slung-bags', [599, 1699], 'bag', { cat: 'slung-bags', fabrics: ['Cotton Canvas', 'Cane & Bamboo', 'Brocade'], crafts: ['Block Print', 'Bandhani', 'Mirror Work'] })
acc('w-handbag', 'Structured Handbag', 'clutch', 2, ['handbags'], [PALETTE.mutedEarth, PALETTE.evening], ['Vegan Leather'], ['workwear', 'date', 'casual'], 'handbags', [999, 2999], 'bag', { cat: 'handbags', fabrics: ['Vegan Leather', 'Cotton Canvas', 'Brass', 'Meenakari Brass'], crafts: ['Pearl Detailing', 'Gold Bead', 'Meenakari'] })
acc('w-bag-emb', 'Zardozi Evening Bag', 'clutch', 2, ['handbags'], [PALETTE.metal], ['Silk', 'Zardozi'], ['sangeet', 'reception', 'party'], 'handbags', [1299, 3499], 'bag', { cat: 'handbags', fabrics: ['Zardozi Silk', 'Brocade', 'Satin'], crafts: ['Zardozi', 'Stone Work', 'Pearl Detailing'] })
acc('w-bag-embroidered', 'Threadwork Day Bag', 'clutch', 2, ['handbags'], [PALETTE.neuters, PALETTE.mutedEarth], ['Cotton', 'Threadwork'], ['casual', 'college'], 'handbags', [599, 1499], 'bag', { cat: 'handbags', fabrics: ['Cotton Threadwork', 'Resin Flower', 'Cotton Canvas'], crafts: ['Chikankari', 'Thread Embroidery', 'Pearl Detailing'] })
acc('w-jutti', 'Embroidered Jutti', 'flat-shoe', 2, ['jutti-mojaris'], [PALETTE.warm, PALETTE.metal], ['Leather', 'Fabric'], ['diwali', 'festive', 'sangeet'], 'jutti-mojaris', [799, 2499], 'footwear', { cat: 'women-footwear', fabrics: ['Leather', 'Faux Leather', 'Satin', 'Cotton Canvas'], crafts: ['Mirror Work', 'Zardozi', 'Thread Embroidery', 'Gotapatti'] })
acc('w-shoe-emb', 'Embellished Pumps', 'heel', 2, ['heels'], [PALETTE.metal, PALETTE.evening], ['Satin'], ['reception', 'sangeet'], 'heels', [1499, 3999], 'footwear', { cat: 'women-footwear', fabrics: ['Vegan Leather', 'Satin'], crafts: ['Pearl Detailing', 'Zardozi'] })
acc('w-shoe-kolhapuri', 'Kolhapuri Chappal', 'flat-shoe', 2, ['kolhapuri'], [PALETTE.heirloom], ['Leather'], ['casual', 'travel', 'college'], 'kolhapuri', [899, 2299], 'footwear', { cat: 'women-footwear', fabrics: ['Leather', 'Cotton Canvas'], crafts: ['Leather Tooling', 'Thread Embroidery'] })
acc('w-shoe-heeled', 'Heeled Sandals', 'heel', 2, ['heels'], [PALETTE.metal, PALETTE.pastels], ['Faux Leather'], ['party', 'date', 'college'], 'heels', [1199, 2999], 'footwear', { cat: 'women-footwear', fabrics: ['Faux Leather', 'Satin'], crafts: ['Pearl Detailing', 'Beaded'] })
acc('w-shoe-wedge', 'Kantha-Wedge Sandals', 'wedge', 2, ['wedges'], [PALETTE.heirloom, PALETTE.mutedEarth], ['Cotton', 'Rope'], ['college', 'casual'], 'wedges', [899, 2199], 'footwear', { cat: 'women-footwear', fabrics: ['Rope & Canvas', 'Cotton Canvas'], crafts: ['Kantha Stitch', 'Thread Embroidery', 'Pearl Detailing', 'Gold Bead'] })
acc('w-shoe-mule', 'Mules with Beadwork', 'flat-shoe', 2, ['flats'], [PALETTE.neuters, PALETTE.heirloom], ['Satin'], ['reception', 'party', 'workwear'], 'flats', [1299, 2799], 'footwear', { cat: 'women-footwear', fabrics: ['Beaded', 'Satin'], crafts: ['Beaded', 'Pearl Detailing', 'Meenakari'] })
acc('w-shoe-festive', 'Festive Sandals', 'flat-shoe', 2, ['sandals-women'], [PALETTE.brights, PALETTE.heirloom], ['Faux Leather', 'Enamel'], ['diwali', 'navratri', 'garba', 'college'], 'sandals-women', [699, 1799], 'footwear', { cat: 'women-footwear', fabrics: ['Cotton Canvas', 'Faux Leather'], crafts: ['Mirror Work', 'Kutch Work', 'Pearl Detailing'] })

// ── men accessories (41) ──
acc('m-mojari', 'Leather Mojari', 'flat-shoe', 3, ['jutti-mojaris'], [PALETTE.heirloom, PALETTE.metal], ['Leather'], ['reception', 'wedding', 'diwali'], 'jutti-mojaris', [1299, 3499], 'footwear', { gender: 'men', cat: 'men-footwear', fabrics: ['Leather', 'Faux Leather'], crafts: ['Zardozi', 'Resham Threadwork', 'Kamdani'] })
acc('m-jutti', 'Threadwork Jutti', 'flat-shoe', 2, ['jutti-mojaris'], [PALETTE.warm, PALETTE.heirloom], ['Fabric', 'Leather'], ['festive', 'family', 'diwali'], 'jutti-mojaris', [899, 1999], 'footwear', { gender: 'men', cat: 'men-footwear', fabrics: ['Faux Leather', 'Leather'], crafts: ['Zardozi', 'Resham Threadwork', 'Kamdani', 'Thread Embroidery'] })
acc('m-kolhapuri', 'Kolhapuri Chappal (Men)', 'flat-shoe', 2, ['kolhapuri'], [PALETTE.heirloom], ['Leather'], ['casual', 'travel'], 'kolhapuri', [799, 1899], 'footwear', { gender: 'men', cat: 'men-footwear', fabrics: ['Leather'], crafts: ['Leather Tooling'] })
acc('m-sandal', 'Leather Sandals', 'flat-shoe', 2, ['sandals-men'], [PALETTE.mutedEarth], ['Leather'], ['casual', 'travel'], 'sandals-men', [899, 1999], 'footwear', { gender: 'men', cat: 'men-footwear', fabrics: ['Leather', 'Vegan Leather'], crafts: ['Leather Tooling'] })
acc('m-loafer', 'Suede-look Loafers', 'loafer', 2, ['flats-men'], [PALETTE.evening, PALETTE.mutedEarth], ['Faux Suede'], ['date', 'workwear', 'travel'], 'flats-men', [1499, 3299], 'footwear', { gender: 'men', cat: 'men-footwear', fabrics: ['Faux Suede', 'Patent Leather', 'Vegan Leather'], crafts: ['Leather Tooling', 'Stone Work'] })
acc('m-watch', 'Ethnic-Dial Watch', 'watch', 4, ['watch'], [PALETTE.metal, PALETTE.neuters], ['Steel', 'Leather Strap'], ['casual', 'workwear', 'date', 'festive'], 'watch', [899, 5999], 'jewellery', { gender: 'men', cat: 'watches', fabrics: ['Steel', 'Leather Strap', 'Rose-Gold Plated', 'NATO'], crafts: ['Stone Work'] })
acc('m-bracelet', 'Oxidised Silver Bracelet', 'bangle', 2, ['bangles-bracelets'], [PALETTE.mutedEarth, PALETTE.heirloom], ['Oxidised Silver'], ['casual', 'college', 'travel'], 'bangles-bracelets', [299, 999], 'jewellery', { gender: 'men', cat: 'accessories', fabrics: ['Silver-Plated', 'Leather Beads', 'Brass'], crafts: ['Beaded', 'Meenakari'] })
acc('m-ring', 'Signet Ring', 'ring', 2, ['rings'], [PALETTE.metal], ['Brass', 'Silver Plated'], ['workwear', 'date', 'casual'], 'rings', [399, 1499], 'jewellery', { gender: 'men', cat: 'accessories', fabrics: ['Oxidised Silver', 'Gold Vermeil'], crafts: ['Stone Work', 'Uncut Polki'] })
acc('m-cufflinks', 'Jewellery Cufflinks', 'ring', 2, ['rings'], [PALETTE.metal, PALETTE.jewelDeep], ['Brass', 'Stone'], ['reception', 'engagement'], 'rings', [599, 1999], 'jewellery', { gender: 'men', cat: 'accessories', fabrics: ['Gold Plated Brass', 'Lac'], crafts: ['Enamel', 'Stone Work', 'Pearl Detailing'] })
acc('m-brooch', 'Sherwani Brooch', 'brooch', 2, ['brooches'], [PALETTE.metal, PALETTE.festiveJewel], ['Gold Plated', 'Stone'], ['reception', 'sangeet', 'wedding'], 'brooches', [499, 1799], 'jewellery', { gender: 'men', cat: 'accessories', fabrics: ['Meenakari Brass', 'Kundan Set'], crafts: ['Zardozi', 'Meenakari', 'Uncut Polki', 'Stone Work'] })
acc('m-pocket', 'Pocket Square Set', 'square', 2, ['handbags'], [PALETTE.neuters, PALETTE.metal], ['Silk'], ['reception', 'wedding', 'engagement'], 'handbags', [299, 899], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Silk', 'Cotton'], crafts: ['Block Print', 'Kutch Work', 'Pearl Detailing'] })
acc('m-stole', 'Woven Wool Stole', 'stole', 3, ['stoles'], [PALETTE.mutedEarth, PALETTE.warm], ['Wool', 'Pashmina Blend'], ['winter', 'diwali', 'puja', 'family'], 'stoles', [699, 2999], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Pashmina Blend', 'Wool Blend'], crafts: ['Kamdani', 'Handloom'] })
acc('m-scarf', 'Linen Scarf', 'stole', 2, ['stoles'], [PALETTE.neuters, PALETTE.warm], ['Linen'], ['casual', 'travel', 'winter'], 'stoles', [499, 1499], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Wool Blend', 'Pashmina Blend'], crafts: ['Ikat Weave', 'Handloom'] })
acc('m-belt', 'Brass-Buckle Leather Belt', 'belt', 2, ['belts'], [PALETTE.heirloom, PALETTE.mutedEarth], ['Leather', 'Brass'], ['casual', 'date', 'workwear'], 'belts', [599, 1799], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Leather', 'Brass Buckle'], crafts: ['Leather Tooling'] })
acc('m-wallet', 'Leather Wallet', 'wallet', 2, ['wallets'], [PALETTE.heirloom], ['Leather'], ['casual', 'date'], 'wallets', [399, 1299], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Leather'], crafts: ['Leather Tooling'] })
acc('m-sunglasses', 'Retro Square Sunglasses', 'shades', 2, ['eyewear'], [PALETTE.evening], ['Acetate'], ['casual', 'travel'], 'eyewear', [599, 1999], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Acetate', 'Beaded Brass'], crafts: ['Leather Tooling'] })
acc('m-groom-kit', 'Groom Gifting Kit', 'kit', 2, ['potli-bags'], [PALETTE.metal, PALETTE.evening], ['Corduroy', 'Brass Clasp'], ['reception', 'wedding', 'gifting'], 'potli-bags', [1299, 3499], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Leather', 'Corduroy'], crafts: ['Block Print', 'Cane Weave', 'Zardozi'] })
acc('m-safa', 'Marwari Safa (Turban)', 'turban', 2, ['safa'], [PALETTE.warm, PALETTE.brights], ['Raw Silk'], ['wedding', 'reception', 'festive'], 'safa', [799, 2299], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Raw Silk', 'Satin'], crafts: ['Gotapatti', 'Dabka', 'Pearl Detailing'] })
acc('m-pagdi', 'Rajwadi Pagdi with Kalgi', 'turban', 1, ['safa'], [PALETTE.brights, PALETTE.metal], ['Silk Blend'], ['wedding', 'groom'], 'safa', [999, 2499], 'bag', { gender: 'men', cat: 'accessories', fabrics: ['Brocade', 'Silk'], crafts: ['Kamdani', 'Zardozi'] })
// ── beauty (24) ──
acc('b-eye-palette', 'Festive Eyeshadow Palette (12 Shyades)', 'palette', 3, ['beauty'], [PALETTE.warm], ['Mica Blend'], ['sangeet', 'reception', 'party'], 'beauty', [499, 1299], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Pressed Mineral'], crafts: ['Embossed Pan'] })
acc('b-kajal', 'Smudge-Kajal with Applicator', 'kajal', 2, ['beauty'], [PALETTE.evening], ['Botanical Carbon'], ['diwali', 'festive', 'casual'], 'kajal', [99, 499], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Botanical Carbon'], crafts: ['Embossed Pan'] })
acc('b-bottle-glow', 'Festive Highlighter Drops', 'bottle', 2, ['beauty'], [PALETTE.metal], ['Dewy Base'], ['sangeet', 'reception', 'party'], 'skincare', [399, 1299], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Dewy Base'], crafts: ['Embossed Pan'] })
acc('b-bottle-makeup', 'Setting Spray (Dewy Finish)', 'bottle', 2, ['beauty'], [PALETTE.metal, PALETTE.heirloom], ['Botanical Mist'], ['diwali', 'sangeet', 'college'], 'skincare', [299, 899], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Botanical Mist'], crafts: ['Embossed Pan'] })
acc('b-bottle-hair', 'Hair-Perfume Mist', 'bottle', 2, ['beauty'], [PALETTE.warm], ['Light Oil-Free Mist'], ['date', 'reception', 'casual'], 'perfume', [499, 1499], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Fine Mist'], crafts: ['Embossed Pan'] })
acc('b-bottle-lip', 'Lip & Cheek Tint Pot', 'bottle', 2, ['beauty'], [PALETTE.brights], ['Balmy Tint'], ['college', 'casual', 'date'], 'lipstick', [199, 699], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Balmy Tint'], crafts: ['Embossed Pan'] })
acc('b-bottle-body', 'Illuminating Body Oil', 'bottle', 2, ['beauty'], [PALETTE.warm], ['Dry Oil'], ['reception', 'date'], 'skincare', [699, 1999], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Dry Oil'], crafts: ['Embossed Pan'] })
acc('b-kajal-deos', 'Attar Roll-On (Itri)', 'bottle', 3, ['beauty'], [PALETTE.metal], ['Alcohol-Free Attar'], ['diwali', 'family', 'winter'], 'perfume', [249, 999], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Alcohol-Free Attar'], crafts: ['Embossed Pan'] })
acc('b-kit-brush', 'Brush Set (12-Piece)', 'kit', 2, ['beauty'], [PALETTE.neuters], ['Vegan Bristle'], ['casual', 'college'], 'beauty', [499, 1499], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Vegan Bristle'], crafts: ['Embossed Pan'] })
acc('b-stick-lip', 'Satin Lipstick', 'lipstick', 3, ['beauty'], [PALETTE.brights, PALETTE.metal], ['Balmy Wax'], ['reception', 'date', 'college'], 'lipstick', [249, 899], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Satin Wax'], crafts: ['Embossed Pan'] })
acc('b-palette-compact', 'Highlighter & Blush Compact', 'palette', 2, ['beauty'], [PALETTE.metal], ['Baked Powder'], ['sangeet', 'party'], 'beauty', [399, 1299], 'beauty', { gender: 'women', cat: 'beauty', fabrics: ['Baked Powder'], crafts: ['Embossed Pan'] })

const ALL = SUBS
const humanSub = (s) => titleCase(s.replace(/-/g, ' '))
// canonical on-site category taxonomy (merchant-specific linkCat stays separate)
function catNorm(sub) {
  const lc = sub.linkCat || ''
  const g = sub.gender
  if (/kajal|lipstick|perfume|skincare/.test(lc)) return 'beauty'
  if (lc === 'beauty') return 'beauty'
  if (g === 'men') {
    if (/watch/.test(lc)) return 'watches'
    if (/footwear|flats-men|sandals-men|jutti|kolhapuri/.test(lc)) return 'footwear'
    if (/jacket|sherwani/.test(lc)) return 'jackets'
    if (lc === 'garba-chaniya') return 'garba'
    if (/kurtas|ethnic-bottom/.test(lc)) return 'kurta-sets'
    if (/stoles|belt|wallet|eyewear|potli|bangle|ring|brooch|kit|safa|handbag/.test(lc)) return 'accessories'
    return 'indowestern'
  }
  if (lc === 'sarees') return 'sarees'
  if (lc === 'kurta-sets') return 'kurta-sets'
  if (lc === 'co-ord-sets') return 'co-ord-sets'
  if (lc === 'lehenga') return 'lehenga'
  if (lc === 'garba-chaniya') return 'garba'
  if (/earring|jewellery|ring|bangle|maang|brooch/.test(lc)) return 'jewellery'
  if (/potli|clutch|handbag|slung|bag/.test(lc)) return 'bags'
  if (/footwear|heel|wedge|flats|sandal|kolhapuri|jutti/.test(lc)) return 'footwear'
  return 'indowestern'
}

// ── product build ─────────────────────────────────────────────────────────────
const products = []
const usedTitles = new Set()
const rnd = mulberry(20260920)
let seq = 1
for (const sub of ALL) {
  for (let i = 0; i < sub.n; i++) {
    const r = mulberry(hashStr(sub.id) * 31 + i * 7 + seq)
    const craft = sub.crafts[i % sub.crafts.length]
    const palette = sub.palettes[i % sub.palettes.length]
    const colourPool = Array.isArray(palette) ? palette : PALETTE[palette] || PALETTE.warm
    const colour = colourPool[Math.floor(r() * colourPool.length)]
    const fabric = sub.fabrics?.length ? sub.fabrics[i % sub.fabrics.length] : 'None'
    const occasions = sub.occ.map(o => OCC_TAG[o] || 'Festive Party')
    const price = pickPrice(r, sub.price[0], sub.price[1])
    const labelPool = BRAND_FOR(sub)
    const label = labelPool[Math.floor(r() * labelPool.length)]
    let title = `${colour} ${CRAFTS[craft]?.adj ? titleCase(CRAFTS[craft].adj) + ' ' : ''}${sub.name}`
    let suffix = 0
    while (usedTitles.has(title)) { suffix++; const alt = PALETTE.warm[Math.floor(r() * PALETTE.warm.length)]; title = suffix < 3 ? `${alt} ${sub.name}` : `${alt} ${sub.name} ${suffix - 2 === 0 ? '' : ''}`.trim() }
    usedTitles.add(title)
    const id = `${sub.id}-${pad2(i + 1)}`
    const moods = sub.occ.map(o => ({ college: 'Youthful', garba: 'Festive', party: 'Bold', casual: 'Everyday', workwear: 'Minimal', travel: 'Everyday', date: 'Bold', festive: 'Festive', diwali: 'Festive', wedding: 'Heirloom', reception: 'Luxe', sangeet: 'Bold', mehendi: 'Youthful', engagement: 'Luxe', family: 'Minimal', puja: 'Minimal', navratri: 'Festive', winter: 'Luxe', guest: 'Luxe' })[o] || 'Festive')
    const mKey = pickMerchant(r, price, [...new Set(moods)])
    const terms = [colour, CRAFTS[craft]?.adj || craft, fabric, sub.gender === 'women' ? 'women' : 'men', sub.linkCat?.replace(/-/g, ' ')].filter(t => t && t !== 'None' && !/wear|sets$/.test(String(t))).slice(0, 4)
    const isFootwear = /jutti|mojari|kolhapuri|jutti|loafer|mule|heel|pump|wedge|chappal|sandal/.test(sub.sil)
    const isWatch = sub.linkCat === 'watches'
    const sizes = sub.gender === 'men' ? (isWatch ? ['One Size'] : isFootwear ? ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11'] : ['S', 'M', 'L', 'XL', 'XXL']) : isFootwear ? ['UK3', 'UK4', 'UK5', 'UK6', 'UK7', 'UK8'] : /ear|neck|bangle|ring|tikka|headpiece|hairpin|brooch|waistbelt|potli|clutch|sling|turban|kit|shades|wallet|belt|stole|palette|bottle|lipstick|kajal/.test(sub.sil) ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL']
    const cat = catNorm(sub)
    const merchantLabel = MERCHANT_LABEL[mKey]
    const tryOnEnabled = !/ear|neck|bangle|ring|tikka|headpiece|hairpin|brooch|waist|potli|clutch|sling|heel|loafer|wedge|watch|shades|wallet|belt|stole|turban|kit|beauty|lip|kajal|palette|bottle/.test(sub.linkCat + ' ' + sub.sil)
    const accent = colourPool[(colourPool.indexOf(colour) + 2) % colourPool.length]
    const p = {
      id, title, gender: sub.gender, category: cat, subCategory: sub.name,
      price, originalPrice: null, brand: label, ageGroup: ageFor(r, sub),
      colour, secondaryColour: accent, fabric,
      embroidery: CRAFTS[craft]?.type === 'embroidery' ? craft : undefined,
      pattern: CRAFTS[craft]?.type === 'pattern' ? craft : undefined,
      weave: CRAFTS[craft]?.type === 'weave' ? craft : undefined,
      silhouette: humanSub(sub.sil), occasions, styleTags: styleFor(sub, craft),
      description: descriptionFor(r, sub, craft, colour, fabric),
      imageUrl: existsSync(join(ROOT, 'public/images/products', `${id}.jpg`)) ? `/images/products/${id}.jpg` : `/images/products/${id}.svg`,
      gallery: existsSync(join(ROOT, 'public/images/products', `${id}.jpg`)) ? [`/images/products/${id}.jpg`, `/images/products/${id}-b.svg`, `/images/products/${id}-c.svg`] : [`/images/products/${id}-b.svg`, `/images/products/${id}-c.svg`],
      sizes, inHouseTryOn: tryOnEnabled, affiliateUrl: undefined,
      merchantUrl: deepLink(mKey, sub, colour, terms), merchantLabel,
      status: 'CHECK', lastChecked: TODAY,
      notes: `Generated from VIRAAS editorial tables on ${TODAY}. Verify live price, seller and image on ${merchantLabel} before publishing; wire EarnKaro affiliate link into affiliateUrl once generated.`,
      imagePrompt: `luxury Indian editorial product photography for a ${sub.gender} occasion outfit: ${esc(title)}, ${fabric !== 'None' ? fabric : 'artisan fabric'}, in ${colour} with ${accent} accents, on a faceless studio mannequin, soft warm window light, ivory or muted emerald backdrop, subtle festive styling props, no visible faces, no text, no logos, no watermark, high-end magazine quality`,
      _plate: { silhouette: sub.sil, colour, accentColour: accent },
    }
    seq++
    products.push(p)
  }
}

// ── SVG plates ────────────────────────────────────────────────────────────────
for (const p of products) {
  for (const view of ['a', 'b', 'c']) {
    const svg = renderPlate(p, view)
    const fname = view === 'a' ? `${p.id}.svg` : `${p.id}-${view}.svg`
    writeFileSync(join(OUT_IMG, fname), svg)
  }
}

// ── looks (curated outfits) ───────────────────────────────────────────────────
const byId = Object.fromEntries(products.map(p => [p.id, p]))
const APPAREL = (p) => ['sarees', 'kurta-sets', 'lehenga', 'co-ord-sets', 'indowestern'].includes(p.category)
const look = (id, title, mood, occasions, anchors, story, alt = []) => {
  const items = anchors.map(a => byId[a]).filter(Boolean)
  if (!items.length) return null
  const price = items.reduce((s, p) => s + p.price, 0)
  return { id, title, mood, occasions, productIds: items.map(p => p.id), imageUrl: items[0].imageUrl, altImages: alt, price, description: story, merchantUrls: [...new Set(items.map(p => p.merchantUrl))], merchantLabels: [...new Set(items.map(p => p.merchantLabel))], budgetTier: price < 2000 ? 'Under ₹1,999' : price < 3000 ? '₹1,999–₹2,999' : price < 5000 ? '₹2,999–₹4,999' : '₹5,000+' }
}
const looks = []
const OCC_LOOKS = ['Sangeet', 'Diwali Party', 'College Fest', 'Reception', 'Navratri', 'Wedding', 'Daywear', 'Night Out', 'Work-to-Dinner', 'Mehendi', 'Family Function', 'Date Night', 'Wedding Guest', 'Puja & Temple']
const ACC_CATS = { women: ['jewellery', 'footwear', 'bags', 'watches', 'beauty'], men: ['footwear', 'watches', 'accessories'] }
const LOOK_VERBS = ['anchors', 'sets the tone for', 'carries', 'opens', 'grounds', 'finishes']
let li = 1
for (const occ of OCC_LOOKS) {
  for (const g of ['women', 'men']) {
    const anchors = products.filter(p => p.gender === g && APPAREL(p) && p.occasions.includes(occ))
    if (anchors.length < 3) continue
    const target = g === 'women' ? 5 : 4
    const stride = Math.max(1, Math.floor(anchors.length / target))
    for (let k = 0; k < target; k++) {
      const anchor = anchors[(k * stride + li) % anchors.length]
      const accIds = []
      ACC_CATS[g].forEach((cat, ci) => {
        const pool = products.filter(p => p.gender === g && p.category === cat)
        if (!pool.length) return
        accIds.push(pool[(hashStr(anchor.id) + ci * 37 + k * 11 + li * 3) % pool.length].id)
      })
      const verb = LOOK_VERBS[li % LOOK_VERBS.length]
      const story = `The ${anchor.brand} ${anchor.title.toLowerCase()} ${verb} this ${occ.toLowerCase()} edit — ${anchor.fabric !== 'None' ? anchor.fabric.toLowerCase() + ' with ' : ''}${(anchor.embroidery || anchor.pattern || anchor.weave || 'clean lines').toLowerCase()}, paired with pieces from the same colour family so nothing competes with the work. Styled for real Indian event hours: breathability first, sparkle where the light lands.`
      const L = look(`look-${g === 'women' ? 'w' : 'm'}-${pad2(li)}`, `${occ} · ${titleCase(anchor.category === 'sarees' ? 'drape' : anchor.category === 'kurta-sets' ? 'kurta' : anchor.category)} Edit ${pad2(li)}`, anchor.styleTags[0] || 'Festive', [occ], [anchor.id, ...accIds], story)
      if (L) { looks.push(L); li++ }
    }
  }
}
// occasion-bridging looks + cross-gender couple looks happen in couples.json

// ── couple looks + couple-set products ───────────────────────────────────────
const COUPLES = [
  ['sage-silk', 'Sage Silk Sangeet', 'Sangeet', 'sage', ['Sage', 'Emerald']],
  ['ivory-gold', 'Ivory & Gold Reception', 'Reception', 'luxe', ['Ivory', 'Antique Gold']],
  ['terracotta-fiesta', 'Terracotta Mehendi Fiesta', 'Mehendi', 'warm', ['Terracotta', 'Mustard']],
  ['midnight-velvet', 'Midnight Velvet Evening', 'Evening', 'evening', ['Midnight Navy', 'Plum']],
  ['marigold-day', 'Marigold Day Wedding', 'Wedding', 'warm', ['Marigold', 'Rust']],
  ['monsoon-pastel', 'Monsoon Pastel Engagement', 'Engagement', 'pastel', ['Powder Blue', 'Mint']],
  ['diwali-heirloom', 'Diwali Heirloom Puja', 'Diwali', 'heirloom', ['Mustard', 'Rust']],
  ['navratri-neon', 'Navratri Floor Neon', 'Garba', 'bold', ['Hot Pink', 'Parrot Green']],
  ['destination-white', 'Destination White Reception', 'Travel', 'luxury', ['White', 'Sand']],
  ['college-duo', 'College Fest Duo', 'College', 'youthful', ['Butter Yellow', 'Stone Grey']],
  ['wedding-guest-olive', 'Wedding Guest in Olive', 'Guest', 'minimal', ['Olive', 'Greige']],
  ['winter-wedding', 'Winter Wedding Warmth', 'Winter', 'luxe', ['Bottle Green', 'Oat Melange']],
  ['family-function', 'Family Function Soft Sheen', 'Family', 'minimal', ['Blush Pink', 'Sand']],
  ['date-evening', 'Date Night in Wine', 'Date', 'bold', ['Wine', 'Chocolate']],
  ['mehendi-mint', 'Mehendi Morning in Mint', 'Mehendi', 'fresh', ['Mint', 'Peach']],
  ['festive-brass', 'Festive Family Brass & Ivory', 'Family', 'minimal', ['Champagne', 'Olive']],
  ['garba-black-gold', 'Midnight Mirror Garba Night', 'Garba', 'contemporary', ['Black', 'Antique Gold']],
  ['diwali-wine-ivory', 'Royal Wine & Ivory Diwali Edit', 'Diwali', 'festive', ['Wine', 'Ivory']],
  ['sangeet-emerald-cream', 'Emerald & Cream Sangeet Romance', 'Sangeet', 'luxe', ['Emerald', 'Cream']],
  ['wedding-maroon-champagne', 'Heritage Maroon & Champagne Wedding', 'Wedding', 'royal', ['Maroon', 'Champagne']],
  ['haldi-mustard-ivory', 'Sunlit Mustard & Ivory Haldi Pair', 'Haldi', 'vibrant', ['Mustard', 'Ivory']],
  ['cocktail-charcoal-rose', 'Charcoal & Dusty Rose Evening Soiree', 'Reception', 'modern', ['Charcoal', 'Rose']],
  ['navratri-rust-cream', 'Chaniya & Kurta Rust Festive Rhythm', 'Garba', 'festive', ['Rust', 'Cream']],
  ['reception-navy-peach', 'Midnight Navy & Peach Reception Pair', 'Reception', 'elegant', ['Navy', 'Peach']],
  ['college-fest-sage-ivory', 'Campus Traditional Sage & Ivory Duo', 'College', 'youthful', ['Sage', 'Ivory']],
  ['mehendi-forest-rose', 'Forest Green & Soft Rose Mehendi', 'Mehendi', 'fresh', ['Forest Green', 'Blush Pink']],
  ['engagement-powder-ivory', 'Powder Blue & Ivory Courtyard Engagement', 'Engagement', 'serene', ['Powder Blue', 'Ivory']],
  ['puja-terracotta-cream', 'Terracotta & Ivory Dawn Puja Harmony', 'Puja & Temple', 'devotional', ['Terracotta', 'Cream']],
  ['festive-plum-blush', 'Plum & Blush Twilight Festive Pairing', 'Festive Party', 'contemporary', ['Plum', 'Blush']],
  ['wedding-guest-deepgreen-sand', 'Deep Green & Sand Heritage Guest Duo', 'Wedding Guest', 'understated', ['Deep Green', 'Sand']],
  ['winter-burgundy-ivory', 'Velvet Burgundy & Warm Ivory Winter Sangeet', 'Winter', 'rich', ['Deep Maroon', 'Ivory']],
  ['date-night-chocolate-cream', 'Contemporary Chocolate & Cream Date Edit', 'Date Night', 'intimate', ['Chocolate', 'Cream']]
]
const coupleLooks = []
for (const [cid, title, occLabel, tag, cols] of COUPLES) {
  const find = (g, wantCat) => products.find(p => p.gender === g && cols.some(c => p.colour === c) && (wantCat ? p.category === wantCat : APPAREL(p)))
  const her = find('women') || products.find(p => p.gender === 'women' && APPAREL(p) && (p.occasions.includes(occLabel) || true))
  const his = find('men') || products.find(p => p.gender === 'men' && APPAREL(p))
  if (!her || !his) continue
  const hisAcc = products.find(p => p.gender === 'men' && /men-footwear|watches/.test(p.category))
  const herAcc = products.find(p => p.gender === 'women' && /women-footwear|earrings|clutches/.test(p.category))
  const svg = renderCouplePlate({ her, his, title })
  writeFileSync(join(OUT_COUPLE, `${cid}.svg`), svg)
  coupleLooks.push({
    id: `couple-${cid}`, title, mood: tag, occasions: [occLabel],
    herProductIds: [her.id, herAcc?.id].filter(Boolean), hisProductIds: [his.id, hisAcc?.id].filter(Boolean),
    price: [her, his, herAcc, hisAcc].filter(Boolean).reduce((s, p) => s + p.price, 0),
    description: `A matched-but-not-matchy festive pair for the ${occLabel.toLowerCase()} calendar. She wears ${her.title.toLowerCase()}; he wears ${his.title.toLowerCase()} with ${hisAcc ? hisAcc.title.toLowerCase() : 'clean kolhapuris'}. Harmonised in ${cols.join(' and ')} so the photos stay timeless.`,
    imageUrl: `/images/couple-plates/${cid}.svg`, coupleId: cid,
  })
}
// couple-set products (shop the pair)
coupleLooks.slice(0, 16).forEach((c, idx) => {
  const [herId, hisId] = [c.herProductIds[0], c.hisProductIds[0]]
  const her = byId[herId], his = byId[hisId]
  if (!her || !his) return
  const price = her.price + his.price
  const id = `cp-set-${pad2(idx + 1)}`
  usedTitles.add(c.title + ' — Couple Set')
  products.push({
    id, title: c.title + ' — Couple Set', gender: 'couple', category: 'couple-edit',
    subCategory: 'Her + Him pairing', price, originalPrice: null, brand: 'VIRAAS Curated',
    ageGroup: [...new Set([...her.ageGroup, ...his.ageGroup])].sort((a, b) => a - b).slice(0, 5),
    colour: her.colour, secondaryColour: his.colour, fabric: her.fabric,
    embroidery: her.embroidery, pattern: her.pattern, silhouette: 'Couple Set',
    occasions: c.occasions, styleTags: ['Festive', 'Occasion', ...her.styleTags.slice(0, 2)].slice(0, 4),
    description: `Shop the pair: ${her.title} for her and ${his.title} for him, chosen to sit in the same ${[her.colour, his.colour].join('-and-')} frame. The two plates below are the exact styling the look was built around.`,
    imageUrl: c.imageUrl, gallery: [her.imageUrl, his.imageUrl], sizes: ['Her M', 'His L'],
    inHouseTryOn: false, affiliateUrl: undefined, merchantUrl: her.merchantUrl, merchantLabel: 'VIRAAS Curated',
    status: 'CHECK', lastChecked: TODAY,
    notes: 'Bundle reference only — VIRAAS never holds stock; each half ships from its own retailer. Verify both product pages before publishing.',
    imagePrompt: `luxury Indian editorial couple photography: faceless mannequin pair, her in ${esc(her.title)}, him in ${esc(his.title)}, harmonised festive palette of ${her.colour} and ${his.colour}, warm ivory studio, subtle marigold styling, no visible faces, no text, no logos, no watermark`,
    herProductId: herId, hisProductId: hisId,
  })
})

// ── validation gate ──────────────────────────────────────────────────────────
// Data is a build artifact — refuse to ship anything a component would crash on.
const violations = []
const badNum = (v) => typeof v !== 'number' || !Number.isFinite(v) || !(v > 0)
for (const pr of products) {
  if (badNum(pr.price)) violations.push(`price invalid on product ${pr.id}: ${JSON.stringify(pr.price)}`)
  if (pr.originalPrice != null && badNum(pr.originalPrice)) violations.push(`originalPrice invalid on ${pr.id}`)
  if (typeof pr.imageUrl !== 'string' || !pr.imageUrl) violations.push(`imageUrl missing on ${pr.id}`)
  if (typeof pr.merchantLabel !== 'string' || !pr.merchantLabel) violations.push(`merchantLabel missing on ${pr.id}`)
  if (typeof pr.title !== 'string' || !pr.title) violations.push(`title missing on ${pr.id}`)
  if (typeof pr.brand !== 'string' || !pr.brand) violations.push(`brand missing on ${pr.id}`)
  if (!Array.isArray(pr.styleTags)) violations.push(`styleTags not array on ${pr.id}`)
  if (typeof pr.merchantUrl !== 'string' || !/^https:\/\//.test(pr.merchantUrl || '')) violations.push(`merchantUrl not an https deep link on ${pr.id}`)
}
for (const l of looks) if (badNum(l.price)) violations.push(`look ${l.id} has invalid price`)
for (const c of coupleLooks) if (badNum(c.price)) violations.push(`couple look ${c.id} has invalid price`)
if (violations.length) {
  console.error(`\nGENERATOR VALIDATION FAILED — ${violations.length} violation(s):`)
  for (const v of violations.slice(0, 25)) console.error('  - ' + v)
  process.exit(1)
}

// ── write outputs ─────────────────────────────────────────────────────────────
writeFileSync(join(OUT_DATA, 'products.json'), JSON.stringify(products.map(({ _plate, ...rest }) => rest), null, 1))
writeFileSync(join(OUT_DATA, 'looks.json'), JSON.stringify(looks, null, 1))
writeFileSync(join(OUT_DATA, 'couples.json'), JSON.stringify(coupleLooks, null, 1))

// sitemap + robots — full route coverage, derived from the generated data
const readSrc = (f) => { try { return readFileSync(join(ROOT, f), 'utf8') } catch { return '' } }
const journalSlugs = [...readSrc('src/data/articles.ts').matchAll(/slug: '([^']+)'/g)].map((m) => `/journal/${m[1]}`)
const occasionIds = [...new Set([...readSrc('src/data/occasions.ts').matchAll(/O\(\s*'([^']+)'/g)].map((m) => m[1]))]
const ROUTES = [
  '', '/women', '/men', '/accessories', '/occasions', '/journal', '/trending', '/couple-edit', '/couple', '/saved', '/search', '/about', '/contact', '/faq', '/try-on',
  '/ai-try-on-privacy', '/affiliate-disclosure', '/privacy', '/terms',
  ...journalSlugs,
  ...occasionIds.map((o) => `/occasions/${o}`),
  ...looks.map((l) => `/look/${l.id}`),
  ...coupleLooks.map((c) => `/look/${c.id}`),
  ...products.map((x) => `/product/${x.id}`),
]
const base = 'https://viraas.in'
writeFileSync(join(ROOT, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">\n${ROUTES.map(r => `  <url><loc>${base}${r}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(join(ROOT, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`)

// ── report ────────────────────────────────────────────────────────────────────
const count = (fn) => products.filter(fn).length
const cats = {}
for (const p of products) cats[p.category] = (cats[p.category] || 0) + 1
const dupTitles = products.length - usedTitles.size
const occCoverage = {}
for (const o of ['Wedding', 'Sangeet', 'Reception', 'Mehendi', 'Festive Party', 'Diwali Party', 'Navratri', 'College Fest', 'Work-to-Dinner', 'Night Out', 'Destination Wedding', 'Daywear', 'Puja & Temple', 'Engagement', 'Wedding Guest', 'Family Function', 'Date Night', 'Winter Festive']) occCoverage[o] = products.filter(p => p.occasions.includes(o)).length
console.log(`VIRAAS catalog report — ${TODAY}`)
console.log(`products: ${products.length} (women apparel ${count(p => p.gender === 'women' && APPAREL(p))}, men apparel ${count(p => p.gender === 'men' && APPAREL(p))}, w-acc ${count(p => p.gender === 'women' && !APPAREL(p) && p.category !== 'couple-edit')}, m-acc ${count(p => p.gender === 'men' && !APPAREL(p))}, beauty ${count(p => p.category === 'beauty')}, couple ${count(p => p.category === 'couple-edit')})`)
console.log(`looks: ${looks.length} · couple looks: ${coupleLooks.length} · duplicate titles: ${dupTitles}`)
console.log(`svg plates: ${products.length * 3} + ${coupleLooks.length} couple plates`)
console.log('categories:', JSON.stringify(cats))
console.log('occasion coverage:', JSON.stringify(occCoverage))
const warns = []
for (const [o, n] of Object.entries(occCoverage)) if (n < 12) warns.push(`occasion "${o}" has only ${n} products`)
const colourCounts = {}
for (const p of products) colourCounts[p.colour] = (colourCounts[p.colour] || 0) + 1
for (const [c, n] of Object.entries(colourCounts)) if (n < 3) warns.push(`colour "${c}" only ${n}`)
if (looks.length < 100) warns.push(`looks: ${looks.length} (<100)`)
if (coupleLooks.length < 15) warns.push(`couple looks: ${coupleLooks.length} (<15)`)
if (dupTitles) warns.push(`${dupTitles} duplicate titles`)
console.log(warns.length ? 'WARNINGS:\n- ' + warns.join('\n- ') : 'coverage: all checks passed')
