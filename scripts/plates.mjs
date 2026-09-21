// ─────────────────────────────────────────────────────────────────────────────
// VIRAAS plate engine — original editorial visuals, generated deterministically
// from each product's own metadata (silhouette, colour, fabric, craft).
// Every product therefore renders as a distinct VIRAAS visual; nothing here
// reuses third-party photography, retailer logos or watermarked material, and
// every plate draws the complete outfit (feet included) so silhouettes read
// correctly at any zoom.
//
//   renderPlate(product)          → full outfit plate (main image)
//   renderPlate(product, 'b'|'c') → alternate styling / fabric-detail views
//   renderCouplePlate({her,his})  → two-figure couple composition
//
// Output: SVG markup kept as source files so builds stay tiny and every asset
// has an exact, non-identical composition.
// ─────────────────────────────────────────────────────────────────────────────

export const COLOUR_HEX = {
  Ivory: '#F1E8D6', Cream: '#EFE4CB', White: '#F7F5F0', Emerald: '#103C35', Jade: '#AEB8A0',
  Sage: '#C2CAB2', 'Deep Green': '#164A33', 'Forest Green': '#1D5A40', 'Bottle Green': '#18493C',
  Wine: '#6B2233', Maroon: '#7A2A32', 'Deep Maroon': '#5F1F2A', Plum: '#5D2E4E', Aubergine: '#4C2A45',
  Navy: '#1F2A4A', 'Midnight Navy': '#182142', 'Royal Blue': '#27457E', 'Onyx Black': '#141414',
  Black: '#171918', Charcoal: '#2A2E2C', 'Stone Grey': '#9A968C', Greige: '#B9AE9C',
  'Oat Melange': '#D9CDB8', Sand: '#D8C8A5', Blush: '#EFC9C4', 'Blush Pink': '#F2D2CE',
  Rose: '#E4A9A2', Peach: '#F3CBA6', Apricot: '#F5B97E', Coral: '#F07856', 'Hot Pink': '#E5468A',
  'Rani Pink': '#E2246B', Fuchsia: '#C2458F', Lilac: '#C8BEDC', Lavender: '#C8BEDC',
  'Powder Blue': '#A9C4D4', 'Ice Blue': '#CFE0E6', Turquoise: '#2C9AA6', 'Peacock Teal': '#16707A',
  Mint: '#BFDCCB', 'Parrot Green': '#3FA34D', Chartreuse: '#9BBF3A',
  Gold: '#B7945A', 'Antique Gold': '#C4A052', Mustard: '#D8A21F', Marigold: '#E39B45',
  'Butter Yellow': '#F0DE9A', 'Sunflower Yellow': '#EFC51F', Amber: '#C87F2E',
  Tangerine: '#E9812C', 'Vermeil Orange': '#B45E28', Copper: '#B4632A', Bronze: '#9C6B30',
  Terracotta: '#D95E3F', Rust: '#A85A32', Chocolate: '#4A3226', Olive: '#7B7A42', 'Deep Olive': '#5C5C33',
  Silver: '#C4C9CC', 'Rose Gold': '#D8A18B', Champagne: '#E8D8B0',
};
export const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (n) => Math.round(n * 100) / 100;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Deterministic editorial colour for palette names outside the master table.
function hashColor(name) {
  const h = hashStr(String(name));
  const hue = h % 360;
  const sat = 24 + (h % 33);
  const lit = 40 + ((h >> 5) % 26);
  return hslToHex(hue, sat, lit);
}
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
}
function lum(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const f = (i) => clamp(parseInt(h.slice(i, i + 2), 16) + amt, 0, 255);
  return `#${[f(0), f(2), f(4)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
function resolveCloth(p) {
  const base = COLOUR_HEX[p.colour] || hashColor(p.colour);
  const lightColour = lum(base) > 0.6;
  const dark = shade(base, -26);
  const light = lightColour ? shade(base, -16) : shade(base, 26);
  const sheen = lightColour ? '#FFFDF7' : shade(base, 40);
  return { base, light, dark, sheen, lightColour };
}
function accentOf(p) { return COLOUR_HEX[p.accentColour] || shade(COLOUR_HEX[p.colour] || hashColor(p.colour), 34); }

// ── craft alias resolution (generator names → pattern tiles) ────────────────
const CRAFT_ALIAS = {
  'Sequit Work': 'Sequin', 'Sequit All-Over': 'Sequin', 'Dabka': 'Zardozi', 'Aari': 'Threadwork',
  'Kashmiri Embroidery': 'Floral Embroidery', 'Resham Threadwork': 'Resham', 'Thread Embroidery': 'Threadwork',
  'Gotapatti': 'Gota Patti', 'Stone Work': 'Zardozi', 'Pearl Detailing': 'Kamdani',
  'Dried Flower Work': 'Floral Embroidery', 'Buti Motifs': 'Floral Embroidery', 'Jaal Lattice': 'Brocade',
  'Banarasi Weave': 'Brocade', 'Jacquard Weave': 'Brocade', 'Jamdani Weave': 'Kamdani', 'Kamdani Weave': 'Kamdani',
  'Patola Weave': 'Ikat', 'Ikkat Weave': 'Ikat', 'Ikat Weave': 'Ikat', 'Kalamkari': 'Floral Print',
  'Ajrakh Print': 'Block Print', 'Bagru Print': 'Block Print', 'Paisley Print': 'Leheriya',
  'Kutch Embroidery': 'Phulkari', 'Kutch Work': 'Phulkari', 'Kanchipuram-style Gold Border': 'Zari',
  'Gold Border': 'Zari', 'Maddur Edge': 'Zari', 'Chanderi Weave': 'Handloom', 'Leather': 'Handloom',
  'Leather Tooling': 'Handloom', 'Cane Weave': 'Handloom', 'Kantha Stitch': 'Threadwork', 'Lac': 'Metallic',
  'Beaded': 'Kamdani', 'Enamel': 'Metallic', 'Meenakari': 'Mirror Work', 'Meenakari Enamel': 'Mirror Work',
  'Kundan Setting': 'Zardozi', 'Uncut Polki': 'Zardozi', 'Pearl Drop': 'Kamdani', 'Gold Bead': 'Metallic',
  'Stripes': 'Handloom', 'Draped': 'Tone-on-Tone', 'Embossed Pan': 'Metallic', 'Tie & Dye': 'Bandhani',
  'Sequin Fabric': 'Sequin', 'Kutch': 'Phulkari', 'None': '',
};
function craftOf(product) {
  const raw = product.embroidery || product.pattern || product.weave || 'None';
  const mapped = CRAFT_ALIAS[raw] !== undefined ? CRAFT_ALIAS[raw] : raw;
  return craftPatterns[mapped] ? mapped : '';
}

// ── main entry ────────────────────────────────────────────────────────────────
export function renderPlate(product, view = 'a') {
  const p = product._plate || product;
  const r = mulberry(hashStr(`${product.id}|${view}`));
  const uid = `v${hashStr(product.id + view).toString(36)}`;
  const cloth = resolveCloth(p);
  const bg = BGS[hashStr(`${product.id}${view}`) % BGS.length];
  const env = ENVIRONMENTS[hashStr(product.id + 'e') % ENVIRONMENTS.length];
  const skin = hashStr(product.id) % 3;
  const ctx = { r, uid, cloth, accentHex: accentOf(p), light: cloth.lightColour, skin, view, product };

  const sil = p.silhouette || '';
  let content;
  if (view === 'c') content = detailView(ctx);
  else if (OUTFITS[sil]) content = OUTFITS[sil](ctx);
  else if (ACC_VIEW[sil]) content = accessoryView(ctx, sil);
  else content = OUTFITS['kurta-set'](ctx);
  if (view === 'b') content = outfitAlt(ctx, content);

  const defs = `<defs>${fabricDef(ctx)}${craftDef(ctx)}${bg.defs}${envShadowDefs()}</defs>`;
  const W = 900, H = 1200;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${esc(product.title)} — VIRAAS editorial visual</title>${defs}${bg.rect}${env.props(ctx)}${content}${frame(ctx)}</svg>`;
}

// ── backgrounds: warm editorial environments (light gradients only) ─────────
const BGS = [
  { name: 'studio', defs: `<radialGradient id="bgA" cx="50%" cy="34%" r="78%"><stop offset="0%" stop-color="#FCF8EF"/><stop offset="100%" stop-color="#EBE2D0"/></radialGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgA)"/>` },
  { name: 'warm', defs: `<linearGradient id="bgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F8F1E3"/><stop offset="100%" stop-color="#E4D8C1"/></linearGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgB)"/>` },
  { name: 'heritage', defs: `<linearGradient id="bgC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F4ECDC"/><stop offset="100%" stop-color="#DFD2B9"/></linearGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgC)"/>` },
  { name: 'evening', defs: `<linearGradient id="bgD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22302C"/><stop offset="100%" stop-color="#121C19"/></linearGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgD)"/>` },
  { name: 'sage', defs: `<linearGradient id="bgE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0EFE6"/><stop offset="100%" stop-color="#DCDCCB"/></linearGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgE)"/>` },
  { name: 'stone', defs: `<linearGradient id="bgF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F6F0E6"/><stop offset="100%" stop-color="#DAD2C4"/></linearGradient>`, rect: `<rect width="900" height="1200" fill="url(#bgF)"/>` },
];
function envShadowDefs() { return `<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter><filter id="soft2"><feGaussianBlur stdDeviation="5"/></filter>`; }

const ENVIRONMENTS = [
  { name: 'luxury studio', props: () => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.10" filter="url(#soft)"/>` },
  { name: 'warm festive interior', props: (c) => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.10" filter="url(#soft)"/><g opacity="0.5">${diya(740, 1040)}${diya(150, 1060)}</g>` },
  { name: 'heritage architecture', props: () => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.10" filter="url(#soft)"/><g opacity="0.30" stroke="#9A8A6A" fill="none" stroke-width="2"><path d="M150 1080 V470 A150 150 0 0 1 450 320 A150 150 0 0 1 750 470 V1080"/><path d="M200 1080 V480 A100 100 0 0 1 450 355 A100 100 0 0 1 700 480 V1080" stroke-width="1.4"/></g>` },
  { name: 'contemporary set', props: () => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.12" filter="url(#soft)"/><rect x="52" y="430" width="150" height="650" fill="#E9DFCB" opacity="0.55"/><rect x="52" y="430" width="150" height="8" fill="#B7945A" opacity="0.5"/><rect x="700" y="540" width="150" height="540" fill="#E9DFCB" opacity="0.42"/>` },
  { name: 'evening editorial', props: () => `<ellipse cx="450" cy="1120" rx="260" ry="18" fill="#000" opacity="0.22" filter="url(#soft)"/><g opacity="0.5">${Array.from({ length: 16 }, (_, i) => `<circle cx="${num(60 + ((i * 127) % 780))}" cy="${num(120 + ((i * 197) % 300))}" r="${num(1.6 + (i % 3) * 0.9)}" fill="#E9D6A8" opacity="0.75"/>`).join('')}</g>` },
  { name: 'minimal warm set', props: () => `<ellipse cx="450" cy="1120" rx="240" ry="14" fill="#000" opacity="0.09" filter="url(#soft)"/><rect x="120" y="880" width="660" height="6" fill="#C9BBA0" opacity="0.5"/>` },
  { name: 'sophisticated wedding space', props: () => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.11" filter="url(#soft)"/><g opacity="0.34" fill="none" stroke="#B7945A" stroke-width="2">${[0, 1, 2].map(i => `<path d="M${num(210 + i * 240)} 130 q40 62 0 122 q-40 -60 0 -122"/>`).join('')}</g>${[0, 1, 2, 3, 4].map(i => `<circle cx="${num(140 + i * 170)}" cy="112" r="5" fill="#D95E3F" opacity="0.5"/>`).join('')}` },
  { name: 'modern festive home', props: () => `<ellipse cx="450" cy="1120" rx="250" ry="16" fill="#000" opacity="0.10" filter="url(#soft)"/><g opacity="0.42">${Array.from({ length: 11 }, (_, i) => `<circle cx="${num(96 + i * 72)}" cy="${num(116 + (i % 3) * 14)}" r="12" fill="#E39B45"/><circle cx="${num(96 + i * 72)}" cy="${num(116 + (i % 3) * 14)}" r="5" fill="#C8711F"/>`).join('')}<path d="M96 116 Q450 176 804 116" stroke="#A89163" stroke-width="2" fill="none"/></g>` },
];
function diya(x, y) { return `<g opacity="0.7"><path d="M${x - 26} ${y} q26 22 52 0 q-26 12 -52 0z" fill="#C08552"/><ellipse cx="${x}" cy="${y - 6}" rx="4" ry="10" fill="#F0C263" opacity="0.9"/></g>`; }
function frame(c) {
  const gold = c.product.category ? c.product.category.toUpperCase().replace(/-/g, ' ') : '';
  const textFill = c.light ? '#B7945A' : '#D8BC85';
  return `<g fill="none" stroke="${textFill}" opacity="0.55" stroke-width="1.4"><path d="M60 100 V60 H132"/><path d="M768 60 H840 V100"/><path d="M60 1100 V1140 H132"/><path d="M768 1140 H840 V1100"/></g><text x="450" y="1168" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="4.6" fill="${textFill}" opacity="0.85">VIRAAS · ${esc(gold)}</text>`;
}

// ── fabric + craft renderers ──────────────────────────────────────────────────
function fabricDef(c) {
  const f = (c.product.fabric || '').toLowerCase();
  const id = `f-${c.uid}`;
  const alt = c.cloth.sheen;
  const warp = c.cloth.lightColour ? '#8B7C5E' : alt;
  let tile = '';
  if (/organza|net|tulle/.test(f)) tile = `<rect width="24" height="24" fill="${alt}" opacity="0.12"/><path d="M0 6 H24 M0 18 H24 M6 0 V24 M18 0 V24" stroke="${alt}" stroke-width="0.7" opacity="0.2" fill="none"/>`;
  else if (/silk|satin|tissue|velvet|brocade/.test(f)) tile = `<path d="M-8 32 L32 -8" stroke="${alt}" stroke-width="9" opacity="0.12"/><path d="M-8 12 L12 -8" stroke="${alt}" stroke-width="5" opacity="0.08"/>`;
  else if (/georgette|chiffon|crepe|viscose|rayon/.test(f)) tile = `<rect width="24" height="24" fill="${alt}" opacity="0.05"/><path d="M0 8 H24 M0 20 H24" stroke="${alt}" stroke-width="0.8" opacity="0.12" fill="none"/>`;
  else if (/linen|khadi|cotton|jute|handloom|modal/.test(f)) tile = `<path d="M0 6 H24 M0 14 H24 M0 22 H24" stroke="${warp}" stroke-width="0.8" opacity="0.18" fill="none"/><path d="M6 0 V24 M14 0 V24 M22 0 V24" stroke="${warp}" stroke-width="0.6" opacity="0.13" fill="none"/>`;
  else if (/wool|pashmina/.test(f)) tile = `<path d="M0 12 q6 -8 12 0 t12 0" stroke="${alt}" stroke-width="1.6" fill="none" opacity="0.2"/>`;
  if (!tile) return '';
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="24" height="24">${tile}</pattern>`;
}
function craftDef(c) {
  const craft = craftOf(c.product);
  if (!craft) return '';
  return craftPatterns[craft](c);
}
const craftPatterns = {
  'Chikankari': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="46" height="46"><g fill="none" stroke="${c.cloth.lightColour ? '#8E7F60' : c.cloth.sheen}" stroke-width="1.3" opacity="0.75"><path d="M8 22 q6 -12 15 -14 M23 22 q-6 -12 -15 -14 M8 22 q6 12 15 14 M23 22 q-6 12 -15 14"/><path d="M30 6 v34 M36 10 v26" opacity="0.5"/><circle cx="41" cy="23" r="2.4" fill="${c.cloth.lightColour ? '#8E7F60' : c.cloth.sheen}" stroke="none"/></g></pattern>`,
  'Zardozi': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="40" height="40"><g opacity="0.92"><path d="M20 4 l6 10 -6 10 -6 -10z" fill="${c.accentHex}" opacity="0.72"/><circle cx="20" cy="14" r="1.9" fill="#FFF7E3" opacity="0.8"/><path d="M6 30 q8 -7 14 0 q-6 8 -14 0z" fill="${c.accentHex}" opacity="0.45"/><path d="M28 32 h10 M33 27 v10" stroke="${c.accentHex}" stroke-width="1.2" opacity="0.6"/></g></pattern>`,
  'Gota Patti': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="34" height="34"><g opacity="0.9"><path d="M17 5 l10 12 -10 12 -10 -12z" fill="none" stroke="${c.accentHex}" stroke-width="2.4"/><path d="M17 12 l5 5 -5 5 -5 -5z" fill="${c.accentHex}" opacity="0.55"/></g></pattern>`,
  'Mirror Work': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="38" height="38"><g><circle cx="19" cy="19" r="7" fill="#E9EEF0"/><circle cx="19" cy="19" r="7" fill="none" stroke="${c.accentHex}" stroke-width="1.6"/><path d="M19 4 v6 M19 28 v6 M4 19 h6 M28 19 h6" stroke="${c.accentHex}" stroke-width="1.6" opacity="0.85"/></g></pattern>`,
  'Sequin': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="20" height="20"><g fill="${c.accentHex}" opacity="0.8"><circle cx="5" cy="5" r="2.6"/><circle cx="15" cy="10" r="2.6" opacity="0.75"/><circle cx="5" cy="15" r="2.6" opacity="0.6"/><circle cx="15" cy="1" r="2.2" opacity="0.5"/></g></pattern>`,
  'Floral Embroidery': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="42" height="42"><g opacity="0.85"><g fill="${c.cloth.lightColour ? '#A8926A' : c.accentHex}"><ellipse cx="21" cy="15" rx="3.4" ry="5.6"/><ellipse cx="21" cy="25" rx="3.4" ry="5.6"/><ellipse cx="16" cy="20" rx="5.6" ry="3.4"/><ellipse cx="26" cy="20" rx="5.6" ry="3.4"/></g><circle cx="21" cy="20" r="2.6" fill="${c.accentHex}"/><path d="M6 34 q6 -6 12 0" stroke="${c.accentHex}" stroke-width="1.2" fill="none" opacity="0.6"/></g></pattern>`,
  'Threadwork': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="24" height="24"><g stroke="${c.cloth.lightColour ? '#94815F' : c.cloth.sheen}" stroke-width="1.2" opacity="0.7" fill="none"><path d="M2 6 l5 5 -5 5 M12 2 l6 6 -6 6"/><path d="M4 18 h16" opacity="0.5"/></g></pattern>`,
  'Tone-on-Tone': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="30" height="30"><g fill="${c.cloth.lightColour ? '#8C7C5C' : c.cloth.sheen}" opacity="0.42"><path d="M15 5 q7 8 0 15 q-7 -7 0 -15z"/><path d="M4 22 q6 -5 10 0 q-5 6 -10 0z"/></g></pattern>`,
  'Phulkari': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="34" height="34"><g opacity="0.9"><path d="M17 4 L27 17 L17 30 L7 17z" fill="none" stroke="#D95E3F" stroke-width="2.2"/><path d="M17 10 L23 17 L17 24 L11 17z" fill="#E0A02E" opacity="0.72"/></g></pattern>`,
  'Kamdani': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="30" height="30"><g fill="${c.accentHex}" opacity="0.6"><circle cx="7" cy="7" r="1.8"/><circle cx="22" cy="22" r="1.8"/><path d="M15 12 l3 3 -3 3 -3 -3z"/></g></pattern>`,
  'Resham': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="26" height="26"><g stroke="${c.cloth.lightColour ? '#9A8763' : c.accentHex}" stroke-width="1.5" opacity="0.75" fill="none"><path d="M0 13 q6.5 -8 13 0 t13 0"/><path d="M0 21 q6.5 -8 13 0 t13 0" opacity="0.55"/></g></pattern>`,
  'Bandhani': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="18" height="18"><g fill="${c.accentHex}" opacity="0.9"><circle cx="5" cy="5" r="2.1"/><circle cx="14" cy="14" r="2.1"/><circle cx="14" cy="5" r="1.1" opacity="0.6"/><circle cx="5" cy="14" r="1.1" opacity="0.6"/></g></pattern>`,
  'Leheriya': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="40" height="34"><g fill="none" stroke="${c.accentHex}" stroke-width="4" opacity="0.7"><path d="M-10 30 Q10 4 30 30 T70 30"/><path d="M-10 14 Q10 -12 30 14" opacity="0.45"/></g></pattern>`,
  'Block Print': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="44" height="44"><g opacity="0.7" fill="none" stroke="${c.cloth.lightColour ? '#7E6F52' : c.cloth.sheen}" stroke-width="1.5"><circle cx="22" cy="22" r="10"/><circle cx="22" cy="22" r="4.4"/><path d="M22 6 v6 M22 32 v6 M6 22 h6 M32 22 h6"/></g></pattern>`,
  'Floral Print': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="40" height="40"><g opacity="0.8"><g fill="${c.cloth.lightColour ? '#B79E7A' : c.cloth.sheen}"><circle cx="14" cy="14" r="4"/><circle cx="20" cy="9" r="3"/><circle cx="9" cy="19" r="3"/></g><g fill="${c.accentHex}" opacity="0.55"><circle cx="31" cy="30" r="3.4"/><circle cx="26" cy="34" r="2.2"/></g></g></pattern>`,
  'Ikat': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="28" height="28"><g opacity="0.62"><path d="M0 14 l14 -14 6 6 -14 14z" fill="${c.cloth.lightColour ? '#8C7C5C' : c.cloth.sheen}"/><path d="M14 28 l14 -14 0 8 -6 6z" fill="${c.accentHex}" opacity="0.7"/></g></pattern>`,
  'Tissue': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="22" height="22"><rect width="22" height="22" fill="${c.accentHex}" opacity="0.16"/><path d="M0 0 L22 22" stroke="${c.accentHex}" stroke-width="4" opacity="0.3"/></pattern>`,
  'Zari': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="16" height="16"><g stroke="${c.accentHex}" stroke-width="1.4" opacity="0.85" fill="none"><path d="M0 8 H16 M8 0 V16"/><circle cx="8" cy="8" r="2" fill="${c.accentHex}" stroke="none" opacity="0.7"/></g></pattern>`,
  'Handloom': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="14" height="14"><g opacity="0.5"><rect width="14" height="3" fill="${c.cloth.lightColour ? '#8B7C5E' : c.cloth.sheen}"/><rect y="7" width="7" height="3" fill="${c.accentHex}" opacity="0.7"/></g></pattern>`,
  'Brocade': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="40" height="40"><g opacity="0.8"><path d="M20 5 q11 8 0 16 q-11 -8 0 -16z" fill="none" stroke="${c.accentHex}" stroke-width="1.8"/><path d="M20 21 q11 8 0 16" fill="none" stroke="${c.accentHex}" stroke-width="1.4" opacity="0.7"/><circle cx="20" cy="13" r="1.8" fill="${c.accentHex}"/></g></pattern>`,
  'Metallic': (c) => `<pattern id="k-${c.uid}" patternUnits="userSpaceOnUse" width="18" height="18"><rect width="18" height="18" fill="${c.accentHex}" opacity="0.20"/><path d="M0 9 H18" stroke="${c.accentHex}" stroke-width="3" opacity="0.55"/></pattern>`,
};
function clothFill(c) { return `url(#f-${c.uid})`; }
function craftFill(c) { return craftOf(c.product) ? `url(#k-${c.uid})` : 'none'; }
function hasFabric(c) { return !!fabricDef(c); }
function hasCraft(c) { return !!craftOf(c.product); }

// ── shared garment primitives ─────────────────────────────────────────────────
// path is drawn with fill; fabric and craft render as clipped overlays.
function cloth(c, path, opts = {}) {
  const { tone = 'base', stroke = true } = opts;
  const fill = tone === 'dark' ? c.cloth.dark : tone === 'light' ? c.cloth.light : c.cloth.base;
  const s = stroke ? ` stroke="${c.cloth.dark}" stroke-width="1.6" stroke-opacity="0.55"` : '';
  const cid = `cc-${c.uid}-${(c._cid = (c._cid || 0) + 1)}`;
  return `<clipPath id="${cid}"><path d="${path}"/></clipPath><path d="${path}" fill="${fill}"${s}/><g clip-path="url(#${cid})">${hasFabric(c) ? `<path d="${path}" fill="${clothFill(c)}"/>` : ''}${hasCraft(c) ? `<path d="${path}" fill="${craftFill(c)}" opacity="0.72"/>` : ''}</g>`;
}
function trim(c, path, w = 10, colour = c.accentHex) { return `<path d="${path}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round"/>`; }
function motif(c, path, n = 22) {
  if (!hasCraft(c)) return '';
  return `<path d="${path}" fill="none" stroke="${craftFill(c)}" stroke-width="${num(n)}" stroke-linecap="round" opacity="0.95"/>`;
}
function body(c, { shoulder = 172, waist = 116, hip = 150, top = 300 } = {}) {
  const cx = 450, tone = c.skin === 0 ? '#DECDB4' : c.skin === 1 ? '#C9B092' : '#B79A7C';
  const headR = 34;
  const torso = `M${num(cx - shoulder)} ${top} Q${num(cx - shoulder - 8)} ${num(top + 120)} ${num(cx - waist)} ${num(top + 210)} Q${num(cx - waist - 6)} ${num(top + 250)} ${num(cx - hip)} ${num(top + 300)} L${num(cx + hip)} ${num(top + 300)} Q${num(cx + waist + 6)} ${num(top + 250)} ${num(cx + waist)} ${num(top + 210)} Q${num(cx + shoulder + 8)} ${num(top + 120)} ${num(cx + shoulder)} ${top} Z`;
  c.tone = tone;
  return `<g><ellipse cx="${cx}" cy="${num(top - 66)}" rx="${headR}" ry="${headR + 5}" fill="${tone}"/><path d="M${num(cx - 13)} ${num(top - 40)} h26 v46 h-26z" fill="${shade(tone, -12)}"/><path d="M${num(cx - shoulder + 6)} ${num(top + 6)} q-30 120 -18 240 l14 -2 q-8 -112 18 -224z" fill="${tone}" opacity="0.95"/><path d="M${num(cx + shoulder - 6)} ${num(top + 6)} q30 120 18 240 l-14 -2 q8 -112 -18 -224z" fill="${tone}" opacity="0.95"/><path d="${torso}" fill="${tone}"/></g>`;
}
function legs(c, y1, y2 = 1050) {
  const t = c.tone || '#DECDB4';
  return `<g><path d="M424 ${y1} q-6 120 -10 ${num(y2 - y1 - 6)} l24 0 q4 -${num((y2 - y1) / 2)} 6 -${num(y2 - y1)}z" fill="${t}"/><path d="M476 ${y1} q6 120 10 ${num(y2 - y1 - 6)} l-24 0 q-4 -${num((y2 - y1) / 2)} -6 -${num(y2 - y1)}z" fill="${t}"/></g>`;
}
function shoes(c, y = 1074, tone = '#2A2E2C') {
  return `<g fill="${tone}" opacity="0.95"><path d="M392 ${y} q-16 18 6 24 h46 q10 -12 -4 -24z"/><path d="M508 ${y} q16 18 -6 24 h-46 q-10 -12 4 -24z"/></g>`;
}

// ── jewellery accents drawn on figures ───────────────────────────────────────
const JEWELLERY = {
  earring: (c) => `<g>${[416, 484].map(x => `<g><circle cx="${x}" cy="${num(c.topY - 66)}" r="4" fill="${c.accentHex}"/><path d="M${x} ${num(c.topY - 60)} l0 10" stroke="${c.accentHex}" stroke-width="2"/><path d="M${x - 7} ${num(c.topY - 44)} Q${x} ${num(c.topY - 26)} ${x + 7} ${num(c.topY - 44)} Q${x} ${num(c.topY - 50)} ${x - 7} ${num(c.topY - 44)}z" fill="${c.accentHex}" opacity="0.9"/></g>`).join('')}</g>`,
  necklace: (c) => `<g fill="none" stroke="${c.accentHex}" stroke-width="3"><path d="M406 ${num(c.topY - 18)} Q450 ${num(c.topY + 24)} 494 ${num(c.topY - 18)}"/></g><g fill="${c.accentHex}"><circle cx="450" cy="${num(c.topY + 26)}" r="6"/></g>`,
  maang: (c) => `<g><path d="M420 ${num(c.topY - 96)} Q450 ${num(c.topY - 112)} 480 ${num(c.topY - 96)}" stroke="${c.accentHex}" stroke-width="3" fill="none"/><circle cx="450" cy="${num(c.topY - 80)}" r="6" fill="${c.accentHex}"/></g>`,
};
function jewelleryPiece(c, type) { return JEWELLERY[type] ? JEWELLERY[type](c) : ''; }

// ── outfit compositions (keyed by generator silhouette slug) ────────────────
const OUTFITS = {};
function sareeBody(c) {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M262 1058 Q450 1086 638 1058 L596 330 Q520 300 452 322 Q380 344 330 330 Z`)}
  ${cloth(c, `M452 322 Q400 340 372 380 L360 1046 Q450 1064 540 1046 L556 388 Q520 344 452 322Z`, { tone: 'light' })}
  ${trim(c, `M360 1030 Q450 1052 540 1030`, 14)}
  ${trim(c, `M556 400 L596 1040`, 9)}
  ${cloth(c, `M470 318 Q560 366 604 470 Q648 600 618 780 L534 706 Q548 560 502 448 Q470 372 430 342 Z`, { tone: 'dark' })}
  ${trim(c, `M470 318 Q560 366 604 470 Q648 600 618 780`, 11)}
  ${motif(c, `M540 430 Q600 560 576 720`, 26)}
  <g>${Array.from({ length: 6 }, (_, i) => `<path d="M${num(386 + i * 26)} 470 q6 260 2 570" stroke="${c.cloth.dark}" stroke-width="1.4" opacity="0.4" fill="none"/>`).join('')}</g>
  ${cloth(c, `M388 300 Q450 274 512 300 L528 402 Q450 430 372 402 Z`, { tone: 'dark' })}
  ${trim(c, `M388 300 Q450 276 512 300`, 7)}
  ${legs(c, 1010)}${shoes(c, 1074)}${jewelleryPiece(c, 'earring')}${jewelleryPiece(c, 'necklace')}`;
}
OUTFITS['saree-drape'] = sareeBody;
OUTFITS['saree-predrape'] = (c) => `${sareeBody(c)}<g opacity="0.95">${trim(c, `M372 560 Q450 588 540 560`, 6)}${Array.from({ length: 9 }, (_, i) => `<path d="M${num(378 + i * 18)} 566 l12 42 -12 42" stroke="${c.accentHex}" stroke-width="1.6" fill="none" opacity="0.8"/>`).join('')}</g>`;
OUTFITS['saree-sheer'] = (c) => `<g opacity="0.94">${sareeBody(c)}<g opacity="0.15">${Array.from({ length: 7 }, (_, i) => `<path d="M${num(360 + i * 30)} 340 L${num(336 + i * 36)} 1046" stroke="#FFFDF7" stroke-width="9" fill="none"/>`).join('')}</g></g>`;
OUTFITS['saree-silk'] = (c) => `${sareeBody(c)}${trim(c, `M368 470 Q450 452 552 476`, 5)}${trim(c, `M364 500 Q450 482 556 506`, 4, shade(c.accentHex, 20))}`;
OUTFITS['saree-sheen'] = (c) => `${sareeBody(c)}<g opacity="0.26">${Array.from({ length: 14 }, (_, i) => `<path d="M${num(330 + i * 22)} 340 L${num(300 + i * 24)} 1046" stroke="#FFFDF7" stroke-width="7" fill="none"/>`).join('')}</g>`;
OUTFITS['saree-concept'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M300 1050 Q450 1078 600 1050 L568 500 Q450 470 332 500 Z`)}
  ${cloth(c, `M332 500 Q420 470 470 300 L568 470 Q520 640 560 1046 L470 1010 Q440 760 470 560 Z`, { tone: 'light' })}
  ${trim(c, `M470 300 Q540 360 566 470`, 10)}${trim(c, `M332 502 Q450 476 568 500`, 7)}
  ${motif(c, `M500 520 Q470 780 512 990`, 24)}
  ${cloth(c, `M386 300 Q450 272 514 300 L520 388 Q450 414 380 388Z`, { tone: 'dark' })}
  ${legs(c, 1010)}${shoes(c, 1074)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['saree-gown'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M310 1054 Q450 1082 590 1054 Q560 700 520 400 Q450 372 380 400 Q340 700 310 1054Z`)}
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${num(378 + i * 20)} 420 Q${num(350 + i * 30)} 720 ${num(322 + i * 34)} 1046" stroke="${c.cloth.dark}" stroke-width="1.5" opacity="0.4" fill="none"/>`).join('')}
  ${trim(c, `M312 1030 Q450 1058 588 1030`, 12)}
  ${cloth(c, `M380 400 Q450 370 520 400 L536 300 Q450 272 364 300Z`, { tone: 'dark' })}
  ${motif(c, `M400 420 Q450 400 508 424`, 22)}
  ${legs(c, 1046)}${shoes(c, 1078)}${jewelleryPiece(c, 'earring')}${jewelleryPiece(c, 'necklace')}`;
};
OUTFITS['drape'] = OUTFITS['saree-predrape'];
OUTFITS['kurta-set'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M332 300 Q450 268 568 300 L588 760 Q450 792 312 760 Z`)}
  ${trim(c, `M450 300 V470`, 6)}
  ${Array.from({ length: 4 }, (_, i) => `<circle cx="450" cy="${num(330 + i * 40)}" r="3.4" fill="${c.accentHex}"/>`).join('')}
  ${cloth(c, `M330 302 q-30 6 -34 40 l16 240 l34 -6 z`, { tone: 'light' })}
  ${cloth(c, `M570 302 q30 6 34 40 l-16 240 l-34 -6 z`, { tone: 'light' })}
  ${cloth(c, `M338 760 Q450 788 562 760 L584 1054 Q450 1078 316 1054 Z`)}
  ${cloth(c, `M568 300 Q648 360 690 520 Q720 660 690 800 L636 760 Q654 600 606 460 Q576 372 540 340Z`, { tone: 'light' })}
  ${trim(c, `M568 300 Q648 360 690 520 Q720 660 690 800`, 8)}
  ${motif(c, `M360 720 Q450 700 540 722`, 20)}
  ${legs(c, 1040)}${shoes(c, 1072)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['kurta-set-dupatta'] = (c) => `${OUTFITS['kurta-set'](c)}<g opacity="0.96">${cloth(c, `M322 306 Q280 560 300 900 Q340 1010 400 1040 L368 940 Q330 700 352 420 Z`, { tone: 'light' })}${trim(c, `M322 306 Q280 560 300 900 Q340 1010 400 1040`, 7)}</g>`;
OUTFITS['kurta-straight'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M340 300 Q450 270 560 300 L572 900 Q450 928 328 900 Z`)}
  ${trim(c, `M450 300 V450`, 6)}${motif(c, `M336 872 Q450 900 566 872`, 26)}
  <g>${[0, 1].map(i => `<path d="M${368 + i * 150} 906 q-4 70 0 ${146}" stroke="${c.tone}" stroke-width="26" fill="none" opacity="0.92"/>`).join('')}</g>
  ${cloth(c, `M368 902 q-6 90 -2 148 l30 2 q2 -78 8 -148z`)}
  ${cloth(c, `M496 902 q6 90 2 148 l-30 2 q-2 -78 -8 -148z`)}
  ${shoes(c, 1072)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['kurta-aline'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M340 300 Q450 270 560 300 L620 880 Q450 916 280 880 Z`)}
  ${trim(c, `M450 300 V460`, 6)}${motif(c, `M310 850 Q450 884 590 850`, 24)}
  <g>${[0, 1, 2, 3].map(i => `<path d="M${num(340 + i * 74)} 330 q${-8 + i * 6} 280 ${-26 + i * 18} 540" stroke="${c.cloth.dark}" stroke-width="1.4" fill="none" opacity="0.35"/>`).join('')}</g>
  ${cloth(c, `M382 890 q-4 80 0 158 l26 2 q2 -80 6 -158z`)}
  ${cloth(c, `M492 890 q4 80 0 158 l-26 2 q-2 -80 -6 -158z`)}
  ${shoes(c, 1070)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['straight-kurti'] = OUTFITS['kurta-straight'];
OUTFITS['kurti-jeans'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M342 300 Q450 272 558 300 L576 700 Q450 724 324 700 Z`)}
  ${trim(c, `M450 300 V430`, 5)}${motif(c, `M342 676 Q450 700 558 676`, 20)}
  ${cloth(c, `M372 700 q-8 180 -4 348 l34 2 q4 -180 10 -350z`, { tone: 'dark' })}
  ${cloth(c, `M528 700 q8 180 4 348 l-34 2 q-4 -180 -10 -350z`, { tone: 'dark' })}
  <g stroke="${c.accentHex}" stroke-width="1.4" opacity="0.7" fill="none"><path d="M370 850 h34 M496 850 h34"/></g>
  ${shoes(c, 1068, '#171918')}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['anarkali'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300, waist: 96 })}
  ${cloth(c, `M352 300 Q450 274 548 300 L560 500 Q450 526 340 500 Z`)}
  ${cloth(c, `M340 500 Q450 526 560 500 L700 1040 Q450 1090 200 1040 Z`)}
  <g>${Array.from({ length: 10 }, (_, i) => `<path d="M${num(350 + i * 22)} 508 Q${num(280 + i * 38)} 780 ${num(224 + i * 50)} 1034" stroke="${c.cloth.dark}" stroke-width="1.5" fill="none" opacity="0.4"/>`).join('')}</g>
  ${motif(c, `M236 980 Q450 1040 664 980`, 30)}${motif(c, `M352 320 Q450 300 548 322`, 22)}
  ${trim(c, `M210 1046 Q450 1092 690 1046`, 10)}
  ${shoes(c, 1072)}${jewelleryPiece(c, 'earring')}${jewelleryPiece(c, 'necklace')}${jewelleryPiece(c, 'maang')}`;
};
OUTFITS['sharara'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M352 300 Q450 274 548 300 L566 560 Q450 586 334 560 Z`)}
  ${motif(c, `M352 320 Q450 302 548 322`, 20)}
  ${cloth(c, `M334 560 Q450 586 566 560 L610 900 q-40 26 -80 6 l22 -340 q-52 -16 -104 0 l22 340 q-40 20 -80 -6z`)}
  ${trim(c, `M334 566 L372 900`, 8)}${trim(c, `M566 566 L528 900`, 8)}
  <g stroke="${c.tone}" stroke-width="14" opacity="0.4">${Array.from({ length: 5 }, (_, i) => `<path d="M${num(392 + i * 30)} 588 l${num(-14 + i * 7)} 300" fill="none"/>`).join('')}</g>
  ${legs(c, 902, 1046)}${shoes(c, 1064)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['gharara'] = OUTFITS['sharara'];
OUTFITS['palazzo-set'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M340 300 Q450 272 560 300 L574 720 Q450 746 326 720 Z`)}
  ${trim(c, `M450 300 V440`, 6)}${motif(c, `M340 700 Q450 724 560 700`, 20)}
  ${cloth(c, `M350 720 q-16 170 -10 330 l90 4 q4 -170 6 -320z`)}
  ${cloth(c, `M550 720 q16 170 10 330 l-90 4 q-4 -170 -6 -320z`)}
  ${shoes(c, 1070)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['trouser-set'] = OUTFITS['palazzo-set'];
OUTFITS['dhoti-skirt'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M348 300 Q450 274 552 300 L566 560 Q450 584 334 560 Z`)}
  ${cloth(c, `M334 560 Q450 584 566 560 L620 1040 Q450 1076 280 1040 Z`)}
  ${trim(c, `M470 560 Q420 800 452 1050`, 14)}
  ${trim(c, `M360 600 q90 40 180 0`, 8)}
  ${motif(c, `M300 1000 Q450 1036 600 1000`, 26)}
  ${shoes(c, 1068)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['co-ord'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300 })}
  ${cloth(c, `M348 300 Q450 276 552 300 L562 580 Q450 602 338 580 Z`)}
  ${trim(c, `M450 300 V420`, 5)}
  ${cloth(c, `M344 580 Q450 604 556 580 L566 640 Q450 660 334 640 Z`, { tone: 'dark' })}
  <g stroke="${c.accentHex}" stroke-width="2.4" opacity="0.8" fill="none"><path d="M414 610 h72"/><rect x="432" y="598" width="36" height="24" rx="5"/></g>
  ${cloth(c, `M342 640 q-10 200 -4 404 l92 4 q4 -204 8 -402z`)}
  ${cloth(c, `M558 640 q10 200 4 404 l-92 4 q-4 -204 -8 -402z`)}
  ${motif(c, `M352 320 Q450 302 548 322`, 18)}
  ${shoes(c, 1068)}${jewelleryPiece(c, 'earring')}`;
};
OUTFITS['co-ord-print'] = OUTFITS['co-ord'];
OUTFITS['co-ord-dupatta'] = (c) => `${OUTFITS['co-ord'](c)}${cloth(c, `M560 300 Q660 420 676 640 Q680 860 640 1010 L588 986 Q628 820 606 620 Q592 440 540 330Z`, { tone: 'light' })}`;
OUTFITS['lehenga'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300, waist: 100 })}
  ${cloth(c, `M360 300 Q450 280 540 300 L548 452 Q450 476 352 452 Z`, { tone: 'dark' })}
  ${motif(c, `M364 316 Q450 298 536 318`, 20)}
  ${cloth(c, `M352 452 Q450 476 548 452 L716 1044 Q450 1096 184 1044 Z`)}
  <g>${Array.from({ length: 12 }, (_, i) => `<path d="M${num(362 + i * 15.6)} 462 Q${num(262 + i * 36)} 760 ${num(196 + i * 46)} 1038" stroke="${c.cloth.dark}" stroke-width="1.6" fill="none" opacity="0.42"/>`).join('')}</g>
  ${motif(c, `M218 960 Q450 1014 682 960`, 34)}
  ${trim(c, `M196 1046 Q450 1094 704 1046`, 12)}
  ${cloth(c, `M548 452 Q640 520 664 700 Q680 860 640 980 L584 940 Q616 780 566 560 Z`, { tone: 'light' })}
  ${trim(c, `M548 452 Q640 520 664 700`, 9)}
  ${shoes(c, 1064)}${jewelleryPiece(c, 'earring')}${jewelleryPiece(c, 'necklace')}${jewelleryPiece(c, 'maang')}`;
};
OUTFITS['lehenga-print'] = OUTFITS['lehenga'];
OUTFITS['lehenga-skirt'] = (c) => `${OUTFITS['lehenga'](c)}<g opacity="0.9"><rect x="352" y="300" width="196" height="150" rx="8" fill="${c.cloth.light}"/></g>`;
OUTFITS['lehenga-modern'] = (c) => {
  c.topY = 300;
  return `${body(c, { top: 300, waist: 96 })}
  ${cloth(c, `M364 300 Q450 278 536 300 L546 470 Q450 492 354 470 Z`, { tone: 'dark' })}
  ${cloth(c, `M354 470 Q450 492 546 470 L566 760 Q590 940 660 1046 Q450 1084 240 1046 Q310 940 334 760 Z`)}
  <g>${Array.from({ length: 8 }, (_, i) => `<path d="M${num(370 + i * 24)} 480 Q${num(344 + i * 32)} 800 ${num(300 + i * 44)} 1036" stroke="${c.cloth.dark}" stroke-width="1.5" fill="none" opacity="0.4"/>`).join('')}</g>
  ${motif(c, `M340 700 Q450 726 560 700`, 22)}
  ${shoes(c, 1062)}${jewelleryPiece(c, 'earring')}${jewelleryPiece(c, 'necklace')}`;
};
OUTFITS['chaniya'] = OUTFITS['lehenga'];
// ── men's compositions ───────────────────────────────────────────────────────
OUTFITS['men-kurta'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M318 296 Q450 268 582 296 L596 800 Q450 828 304 800 Z`)}
  ${trim(c, `M450 296 V520`, 6)}
  <g>${Array.from({ length: 5 }, (_, i) => `<circle cx="450" cy="${num(330 + i * 44)}" r="3.2" fill="${c.accentHex}"/>`).join('')}</g>
  ${cloth(c, `M316 298 q-32 8 -36 44 l18 250 l36 -8 z`, { tone: 'light' })}
  ${cloth(c, `M584 298 q32 8 36 44 l-18 250 l-36 -8 z`, { tone: 'light' })}
  ${motif(c, `M420 306 q30 18 60 0 l0 210 q-30 16 -60 0z`, 18)}
  ${cloth(c, `M330 800 Q450 826 570 800 L580 1044 Q450 1064 320 1044 Z`, { tone: 'dark' })}
  <g stroke="${c.cloth.dark}" stroke-width="1.6" opacity="0.5" fill="none"><path d="M450 810 V1040"/></g>
  ${shoes(c, 1062)}${jewelleryPiece(c, 'watch') || ''}`;
};
OUTFITS['men-kurta-print'] = OUTFITS['men-kurta'];
OUTFITS['men-short-kurta'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M318 296 Q450 268 582 296 L590 640 Q450 664 310 640 Z`)}
  ${trim(c, `M450 296 V470`, 6)}${motif(c, `M330 616 Q450 640 570 616`, 18)}
  ${cloth(c, `M326 644 Q450 666 574 644 L584 1040 Q450 1062 316 1040 Z`, { tone: 'dark' })}
  ${shoes(c, 1060)}`;
};
OUTFITS['men-kurta-trouser'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M322 296 Q450 270 578 296 L588 690 Q450 712 312 690 Z`)}
  ${trim(c, `M450 296 V460`, 5)}${motif(c, `M336 668 Q450 690 564 668`, 18)}
  <g><path d="M352 700 q-8 180 -2 336 l84 4 q4 -180 8 -330z" fill="${c.tone}" opacity="0.9"/><path d="M548 700 q8 180 2 336 l-84 4 q-4 -180 -8 -330z" fill="${c.tone}" opacity="0.9"/></g>
  ${cloth(c, `M356 710 q-6 170 -2 322 l72 2 q2 -170 6 -316z`, { tone: 'dark' })}
  ${cloth(c, `M544 710 q6 170 2 322 l-72 2 q-2 -170 -6 -316z`, { tone: 'dark' })}
  ${shoes(c, 1058, '#171918')}`;
};
OUTFITS['men-kurta-jacket'] = (c) => `${OUTFITS['men-kurta'](c)}
  <!-- structured statement Nehru jacket with clean contemporary lapel lines -->
  ${cloth(c, `M316 296 Q374 280 404 294 L394 776 Q348 770 318 756 Z`, { tone: 'dark' })}
  ${cloth(c, `M584 296 Q526 280 496 294 L506 776 Q552 770 582 756 Z`, { tone: 'dark' })}
  <!-- modern mandarin collar band -->
  <path d="M410 292 q40 -6 80 0 v16 q-40 -4 -80 0z" fill="${c.cloth.dark}" stroke="${c.cloth.dark}" stroke-width="1.2"/>
  <!-- front facing button placket & pocket square -->
  ${trim(c, `M404 294 L394 772`, 5, c.accentHex)}${trim(c, `M496 294 L506 772`, 5, c.accentHex)}
  <!-- pocket welt with silk pocket square -->
  <path d="M336 410 h46" stroke="${c.accentHex}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M352 410 l8 -16 l10 16z" fill="${c.accentHex}" opacity="0.95"/>
  <g>${Array.from({ length: 5 }, (_, i) => `<circle cx="498" cy="${num(350 + i * 56)}" r="3.4" fill="${c.accentHex}"/>`).join('')}</g>
  ${motif(c, `M328 320 L394 320 L390 730 L326 710 Z`, 20)}${motif(c, `M572 320 L506 320 L510 730 L574 710 Z`, 20)}`;
OUTFITS['men-jacket'] = OUTFITS['men-kurta-jacket'];
OUTFITS['men-waistcoat'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M330 296 Q450 272 570 296 L580 760 Q450 784 320 760 Z`, { tone: 'light' })}
  ${cloth(c, `M352 300 L420 296 L412 620 L340 600 Z`, { tone: 'dark' })}
  ${cloth(c, `M548 300 L480 296 L488 620 L560 600 Z`, { tone: 'dark' })}
  <g stroke="${c.accentHex}" stroke-width="2.6" fill="none">${Array.from({ length: 4 }, (_, i) => `<circle cx="450" cy="${num(360 + i * 60)}" r="5"/>`).join('')}</g>
  ${motif(c, `M356 320 L410 316 L404 600 L346 584 Z`, 16)}
  <path d="M450 620 q-40 -8 -50 -60 M450 620 q40 -8 50 -60" stroke="${c.cloth.dark}" stroke-width="3" fill="none" opacity="0.7"/>
  ${cloth(c, `M336 760 Q450 782 564 760 L572 1040 Q450 1060 328 1040 Z`, { tone: 'dark' })}
  ${shoes(c, 1058)}`;
};
OUTFITS['men-bandhgala'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 190, waist: 140, hip: 160 })}
  ${cloth(c, `M316 296 Q450 266 584 296 L596 1046 Q450 1070 304 1046 Z`)}
  <path d="M414 296 q36 18 72 0 l0 60 q-36 14 -72 0z" fill="${c.cloth.dark}"/>
  ${trim(c, `M450 356 V1020`, 6, shade(c.accentHex, 10))}
  <g fill="${c.accentHex}">${Array.from({ length: 7 }, (_, i) => `<circle cx="430" cy="${num(380 + i * 84)}" r="5"/><circle cx="470" cy="${num(380 + i * 84)}" r="5"/>`).join('')}</g>
  ${motif(c, `M336 320 L412 340 L412 980 L330 960 Z`, 22)}${motif(c, `M564 320 L488 340 L488 980 L570 960 Z`, 22)}
  ${cloth(c, `M314 300 q-34 10 -38 48 l20 260 l38 -8 z`, { tone: 'light' })}
  ${cloth(c, `M586 300 q34 10 38 48 l-20 260 l-38 -8 z`, { tone: 'light' })}
  ${shoes(c, 1066)}`;
};
OUTFITS['men-sherwani'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 192, waist: 142, hip: 162 })}
  ${cloth(c, `M312 296 Q450 264 588 296 L604 1046 Q450 1074 296 1046 Z`)}
  <path d="M450 300 q-40 40 -8 90 q20 30 -2 70 q-20 34 4 70" stroke="${c.accentHex}" stroke-width="6" fill="none"/>
  <g fill="${c.accentHex}">${Array.from({ length: 9 }, (_, i) => `<circle cx="${num(420 + (i % 2) * 54)}" cy="${num(340 + i * 78)}" r="5.4"/>`).join('')}</g>
  ${motif(c, `M330 320 Q450 300 570 320 L576 520 Q450 546 324 520 Z`, 26)}
  ${motif(c, `M306 980 Q450 1030 594 980`, 34)}
  ${trim(c, `M318 560 L310 1030`, 7)}${trim(c, `M582 560 L590 1030`, 7)}
  ${cloth(c, `M312 298 q-36 10 -40 50 l22 280 l40 -10 z`, { tone: 'dark' })}
  ${cloth(c, `M588 298 q36 10 40 50 l-22 280 l-40 -10 z`, { tone: 'dark' })}
  ${shoes(c, 1068)}`;
};
OUTFITS['men-dhoti'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M330 296 Q450 272 570 296 L578 620 Q450 640 322 620 Z`, { tone: 'light' })}
  ${cloth(c, `M322 620 Q450 640 578 620 L600 830 Q450 860 300 830 Z`)}
  ${trim(c, `M462 630 q-30 100 6 200`, 16)}
  <g stroke="${c.cloth.dark}" stroke-width="2" opacity="0.5" fill="none">${Array.from({ length: 7 }, (_, i) => `<path d="M${num(336 + i * 38)} 640 q6 100 -2 186"/>`).join('')}</g>
  ${trim(c, `M322 300 h256`, 6)}
  ${shoes(c, 1050)}`;
};
OUTFITS['men-kurta-garba'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 188, waist: 136, hip: 152 })}
  <!-- modern youth Navratri silhouette: flared short angrakha kediyu jacket + slim tailored ankle trousers -->
  ${cloth(c, `M326 296 Q450 270 574 296 L592 560 Q450 584 308 560 Z`)}
  <!-- asymmetric crossover angrakha overlap with mirror & border detailing -->
  ${trim(c, `M372 296 Q440 380 472 560`, 7, c.accentHex)}
  <g>${Array.from({ length: 8 }, (_, i) => `<circle cx="${num(370 + i * 28)}" cy="${num(350 + i * 26)}" r="5.5" fill="#EBF2F5" stroke="${c.accentHex}" stroke-width="1.8"/>`).join('')}</g>
  ${motif(c, `M330 310 Q450 286 570 310 L560 420 Q450 440 340 420 Z`, 22)}
  <!-- flared pleated peplum skirt with metallic/mirror edge -->
  ${cloth(c, `M308 560 Q450 584 592 560 L650 780 Q450 812 250 780 Z`, { tone: 'light' })}
  ${trim(c, `M254 772 Q450 806 646 772`, 12, c.accentHex)}
  <!-- fine mirror fringe along the hem -->
  <g>${Array.from({ length: 14 }, (_, i) => `<circle cx="${num(276 + i * 27)}" cy="${num(762 + (i % 2) * 5)}" r="4.2" fill="#F4F8FA" stroke="${c.accentHex}" stroke-width="1.4"/>`).join('')}</g>
  <!-- sleek tapered black trousers with contemporary tailored lines -->
  ${cloth(c, `M346 778 q-10 140 2 272 l68 0 q6 -140 8 -264z`, { tone: 'dark' })}
  ${cloth(c, `M554 778 q10 140 -2 272 l-68 0 q-6 -140 -8 -264z`, { tone: 'dark' })}
  <g stroke="#171918" stroke-width="1.6" opacity="0.4" fill="none"><path d="M450 790 V1048"/></g>
  ${shoes(c, 1060, '#171918')}${jewelleryPiece(c, 'watch') || ''}`;
};
function mirrorRows(c) {
  return `<g>${Array.from({ length: 12 }, (_, i) => `<circle cx="${num(340 + (i % 6) * 44)}" cy="${num(430 + Math.floor(i / 6) * 40)}" r="7" fill="#E9EEF0" stroke="${c.accentHex}" stroke-width="1.6"/>`).join('')}</g>`;
}
OUTFITS['men-co-ord'] = (c) => {
  c.topY = 296;
  return `${body(c, { top: 296, shoulder: 186, waist: 138, hip: 158 })}
  ${cloth(c, `M330 296 Q450 272 570 296 L582 660 Q450 682 318 660 Z`)}
  ${trim(c, `M450 296 V430`, 5)}${motif(c, `M336 636 Q450 658 564 636`, 18)}
  ${cloth(c, `M330 664 Q450 686 570 664 L578 1040 Q450 1060 322 1040 Z`, { tone: 'dark' })}
  <g stroke="${shade(c.accentHex, 20)}" stroke-width="3" opacity="0.85" fill="none"><path d="M362 700 h22 M516 700 h22"/></g>
  ${shoes(c, 1058)}`;
};

// ── accessory compositions (flat-lay, styled) ───────────────────────────────
const ACC_VIEW = {
  earring: (c) => `<g transform="translate(450 560) scale(2.4)"><g>${[376, 524].map(x => `<g transform="translate(${x - 450} 0)"><circle cx="0" cy="-30" r="5" fill="${c.accentHex}"/><path d="M0 -24 l0 14" stroke="${c.accentHex}" stroke-width="2.4"/><path d="M-15 0 Q0 36 15 0 Q0 -12 -15 0z" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="2.4"/>${hasCraft(c) ? `<path d="M-15 0 Q0 36 15 0 Q0 -12 -15 0z" fill="url(#k-${c.uid})" opacity="0.8"/>` : ''}<circle cx="0" cy="26" r="4" fill="#FFF6E2"/></g>`).join('')}</g><path d="M-120 -70 Q0 -30 120 -70" stroke="${c.accentHex}" stroke-width="1.6" fill="none" opacity="0.5"/></g>`,
  necklace: (c) => `<g transform="translate(450 520) scale(2.4)"><path d="M-70 -30 Q0 60 70 -30" stroke="${c.accentHex}" stroke-width="6" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${num(-64 + i * 16)}" cy="${num(-14 + Math.sin(i) * 10)}" r="7" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="2"/>`).join('')}<path d="M0 46 l14 24 -14 26 -14 -26z" fill="${c.accentHex}"/></g>`,
  bangle: (c) => `<g transform="translate(450 620)">${Array.from({ length: 5 }, (_, i) => `<ellipse cx="${num(-60 + i * 30)}" cy="0" rx="52" ry="118" fill="none" stroke="${i % 2 ? c.cloth.base : c.accentHex}" stroke-width="13" opacity="${num(0.95 - i * 0.08)}"/>`).join('')}</g>`,
  ring: (c) => `<g transform="translate(450 600)"><circle r="112" fill="none" stroke="${c.accentHex}" stroke-width="24"/><path d="M0 -112 l-46 -46 h92z" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="4"/><ellipse cx="0" cy="-140" rx="40" ry="26" fill="${c.cloth.light}" stroke="${c.accentHex}" stroke-width="6"/></g>`,
  tikka: (c) => `<g transform="translate(450 560)"><path d="M-190 -60 Q0 -140 190 -60" stroke="${c.accentHex}" stroke-width="7" fill="none"/>${Array.from({ length: 7 }, (_, i) => `<circle cx="${num(-150 + i * 50)}" cy="${num(-70 - Math.sin(i / 6 * Math.PI) * 44)}" r="9" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="3"/>`).join('')}<path d="M0 20 l-40 60 40 84 40 -84z" fill="${c.cloth.light}" stroke="${c.accentHex}" stroke-width="6"/>${hasCraft(c) ? `<path d="M0 20 l-40 60 40 84 40 -84z" fill="url(#k-${c.uid})" opacity="0.6"/>` : ''}</g>`,
  headpiece: (c) => `<g transform="translate(450 560)"><path d="M-220 60 Q0 -160 220 60 Q0 -60 -220 60z" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="6"/>${Array.from({ length: 11 }, (_, i) => `<circle cx="${num(-190 + i * 38)}" cy="${num(30 - Math.sin(i / 10 * Math.PI) * 90)}" r="11" fill="${c.accentHex}" opacity="0.85"/>`).join('')}</g>`,
  hairpin: (c) => `<g transform="translate(450 600)"><path d="M-180 -20 Q0 60 180 -20" stroke="${c.accentHex}" stroke-width="9" fill="none"/>${[0, 1, 2, 3].map(i => `<g transform="translate(${num(-120 + i * 80)} ${num(10 + (i % 2) * 12)})"><circle r="24" fill="${c.cloth.light}" stroke="${c.accentHex}" stroke-width="4"/><circle cy="-30" r="12" fill="${c.accentHex}" opacity="0.8"/></g>`).join('')}</g>`,
  brooch: (c) => `<g transform="translate(450 580)"><path d="M0 -140 L110 -40 L60 120 L-60 120 L-110 -40z" fill="${c.cloth.base}" stroke="${c.accentHex}" stroke-width="10"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${num(-60 + (i % 4) * 40)}" cy="${num(-60 + Math.floor(i / 4) * 70)}" r="14" fill="${c.accentHex}" opacity="0.85"/>`).join('')}</g>`,
  waistbelt: (c) => `<g transform="translate(450 600)"><path d="M-260 -40 Q0 40 260 -40 L260 40 Q0 120 -260 40z" fill="${c.cloth.dark}" stroke="${c.accentHex}" stroke-width="8"/>${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${num(-220 + i * 55)} 60)"><path d="M0 0 q14 40 0 66 q-14 -26 0 -66z" fill="${c.accentHex}" opacity="0.85"/></g>`).join('')}<circle r="34" cy="-40" fill="${c.accentHex}"/></g>`,
  potli: (c) => `<g transform="translate(450 580)"><path d="M-170 -60 Q0 -140 170 -60 Q200 80 150 190 Q0 250 -150 190 Q-200 80 -170 -60z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/>${hasCraft(c) ? `<path d="M-170 -60 Q0 -140 170 -60 Q200 80 150 190 Q0 250 -150 190 Q-200 80 -170 -60z" fill="url(#k-${c.uid})" opacity="0.8"/>` : ''}${hasFabric(c) ? `<path d="M-170 -60 Q0 -140 170 -60 Q200 80 150 190 Q0 250 -150 190 Q-200 80 -170 -60z" fill="url(#f-${c.uid})"/>` : ''}<path d="M-60 -80 Q0 -40 60 -80" stroke="${c.accentHex}" stroke-width="7" fill="none"/><circle cy="-120" r="20" fill="${c.accentHex}"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${num(-120 + i * 30)}" cy="${num(120 + (i % 2) * 18)}" r="6" fill="${c.accentHex}" opacity="0.8"/>`).join('')}</g>`,
  clutch: (c) => `<g transform="translate(450 600)"><rect x="-220" y="-90" width="440" height="180" rx="18" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/>${hasCraft(c) ? `<rect x="-220" y="-90" width="440" height="180" rx="18" fill="url(#k-${c.uid})" opacity="0.8"/>` : ''}<path d="M-220 -30 h440" stroke="${c.accentHex}" stroke-width="7"/><rect x="-34" y="-52" width="68" height="44" rx="8" fill="${c.accentHex}"/></g>`,
  sling: (c) => `<g transform="translate(450 580)"><path d="M-140 -160 Q160 -60 -60 200" stroke="${c.cloth.dark}" stroke-width="20" fill="none" opacity="0.8"/><rect x="-130" y="0" width="270" height="190" rx="20" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/>${hasCraft(c) ? `<rect x="-130" y="0" width="270" height="190" rx="20" fill="url(#k-${c.uid})" opacity="0.7"/>` : ''}<path d="M-130 60 h270" stroke="${c.accentHex}" stroke-width="6"/><rect x="-22" y="36" width="46" height="30" rx="6" fill="${c.accentHex}"/></g>`,
  'flat-shoe': (c) => `<g transform="translate(450 640)">${[-120, 120].map(x => `<g transform="translate(${x} 0) scale(${x < 0 ? 1 : -1} 1)"><path d="M-110 40 Q-90 -60 20 -70 Q110 -76 130 -10 Q140 30 120 50 Q0 78 -110 60z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/>${hasCraft(c) ? `<path d="M-110 40 Q-90 -60 20 -70 Q110 -76 130 -10 Q140 30 120 50 Q0 78 -110 60z" fill="url(#k-${c.uid})" opacity="0.85"/>` : ''}<path d="M-100 62 Q10 92 122 62 l0 20 Q10 112 -100 84z" fill="${c.accentHex}" opacity="0.9"/><circle cx="60" cy="-24" r="12" fill="${c.accentHex}"/></g>`).join('')}</g>`,
  heel: (c) => `<g transform="translate(450 620)">${[-116, 116].map(x => `<g transform="translate(${x} 0) scale(${x < 0 ? 1 : -1} 1)"><path d="M-100 30 Q-70 -60 30 -66 Q110 -70 128 -6 L118 26 Q20 6 -60 44z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/><path d="M96 20 l22 6 6 74 -20 4z" fill="${c.accentHex}"/><path d="M-100 34 q60 26 220 -8 l4 20 q-160 34 -224 6z" fill="${c.accentHex}"/>${hasCraft(c) ? `<path d="M-100 30 Q-70 -60 30 -66 Q110 -70 128 -6 L118 26 Q20 6 -60 44z" fill="url(#k-${c.uid})" opacity="0.8"/>` : ''}</g>`).join('')}</g>`,
  wedge: (c) => `<g transform="translate(450 620)">${[-116, 116].map(x => `<g transform="translate(${x} 0) scale(${x < 0 ? 1 : -1} 1)"><path d="M-104 16 Q-72 -62 34 -66 Q116 -68 128 -4 L128 24 L-96 62z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/><path d="M-96 66 L128 26 l0 34 Q0 130 -96 96z" fill="${c.accentHex}" opacity="0.85"/></g>`).join('')}</g>`,
  loafer: (c) => `<g transform="translate(450 640)">${[-118, 118].map(x => `<g transform="translate(${x} 0) scale(${x < 0 ? 1 : -1} 1)"><path d="M-104 30 Q-84 -54 26 -64 Q112 -68 130 -6 Q136 28 116 44 Q0 74 -104 54z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/><path d="M-40 -30 q40 -14 74 8 q-40 22 -74 -8z" fill="${c.cloth.dark}" opacity="0.6"/><path d="M-104 56 q120 34 232 -14 l2 22 q-116 44 -236 8z" fill="#F1E8D6"/></g>`).join('')}</g>`,
  watch: (c) => `<g transform="translate(450 560)"><path d="M-42 -190 q42 -18 84 0 l0 380 q-42 18 -84 0z" fill="${c.cloth.dark}" opacity="0.85"/><g>${Array.from({ length: 9 }, (_, i) => `<rect x="-26" y="${num(-20 + i * 26)}" width="52" height="14" rx="6" fill="${c.cloth.light}" opacity="0.7"/>`).join('')}</g><circle r="104" fill="${c.accentHex}"/><circle r="86" fill="#F7F5F0"/><g stroke="#171918" stroke-width="4" fill="none"><path d="M0 -60 v60 l40 20"/></g><g>${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30})"><rect x="-2" y="-80" width="4" height="14" fill="#171918" opacity="0.7"/></g>`).join('')}</g></g>`,
  square: (c) => `<g transform="translate(450 580)"><path d="M-160 60 q60 -140 160 -140 q100 0 160 140 z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="3"/><g>${Array.from({ length: 5 }, (_, i) => `<path d="M${num(-100 + i * 50)} 40 l10 -100 10 100z" fill="${c.cloth.light}" opacity="0.8"/>`).join('')}</g><rect x="-180" y="60" width="360" height="40" rx="8" fill="${c.accentHex}" opacity="0.9"/></g>`,
  stole: (c) => `<g transform="translate(450 500)"><path d="M-210 -120 q-40 220 0 400 q40 100 20 200 l60 0 q20 -120 -20 -220 q-40 -180 0 -380z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="3"/>${hasCraft(c) ? `<path d="M-210 -120 q-40 220 0 400 q40 100 20 200 l60 0 q20 -120 -20 -220 q-40 -180 0 -380z" fill="url(#k-${c.uid})" opacity="0.75"/>` : ''}<path d="M150 -120 q40 220 0 400 q-40 100 -20 200 l-60 0 q-20 -120 20 -220 q40 -180 0 -380z" fill="${c.cloth.light}" stroke="${c.cloth.dark}" stroke-width="3"/><g>${Array.from({ length: 8 }, (_, i) => `<path d="M${num(-190 + i * 8)} 486 v40" stroke="${c.accentHex}" stroke-width="3"/>`).join('')}</g></g>`,
  belt: (c) => `<g transform="translate(450 580)"><path d="M-260 -40 h520 v70 h-520z" fill="${c.cloth.dark}" stroke="#171918" stroke-opacity="0.4"/><rect x="-44" y="-64" width="88" height="118" rx="10" fill="none" stroke="${c.accentHex}" stroke-width="14"/><g>${Array.from({ length: 9 }, (_, i) => `<circle cx="${num(-220 + i * 55)}" cy="-6" r="5" fill="${c.accentHex}" opacity="0.8"/>`).join('')}</g></g>`,
  wallet: (c) => `<g transform="translate(450 580)"><rect x="-160" y="-110" width="320" height="220" rx="16" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/><path d="M-160 0 h320" stroke="${c.cloth.dark}" stroke-width="3" opacity="0.6"/><path d="M-60 -110 q60 60 120 0" fill="${c.accentHex}" opacity="0.85"/><g stroke="${c.accentHex}" stroke-width="1.6" opacity="0.7" fill="none">${Array.from({ length: 6 }, (_, i) => `<path d="M${num(-140 + i * 56)} 60 v40"/>`).join('')}</g></g>`,
  shades: (c) => `<g transform="translate(450 560)"><path d="M-240 -40 h180 q20 90 90 90 q70 0 90 -90 h180 l0 30 h-150 q-30 100 -120 100 q-90 0 -120 -100 h-150z" fill="#2A2E2C"/><path d="M-240 -40 h480" stroke="${c.accentHex}" stroke-width="8"/><g fill="#101413" opacity="0.9"><rect x="-230" y="-30" width="160" height="80" rx="26"/><rect x="70" y="-30" width="160" height="80" rx="26"/></g><g stroke="#FFFDF7" stroke-width="4" opacity="0.4" fill="none"><path d="M-190 10 l60 -26 M110 10 l60 -26"/></g></g>`,
  kit: (c) => `<g transform="translate(450 560)"><rect x="-250" y="-70" width="230" height="140" rx="14" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="3"/>${hasCraft(c) ? `<rect x="-250" y="-70" width="230" height="140" rx="14" fill="url(#k-${c.uid})" opacity="0.8"/>` : ''}<circle cx="150" cy="0" r="80" fill="${c.accentHex}" opacity="0.9"/><path d="M96 0 q54 -60 108 0 q-54 60 -108 0z" fill="${c.cloth.light}"/><path d="M-250 70 h230" stroke="${c.accentHex}" stroke-width="6"/></g>`,
  turban: (c) => `<g transform="translate(450 520)"><path d="M-200 90 Q-120 -140 40 -150 Q220 -160 210 40 Q200 150 60 160 Q-110 170 -200 90z" fill="${c.cloth.base}" stroke="${c.cloth.dark}" stroke-width="4"/><g>${Array.from({ length: 8 }, (_, i) => `<path d="M${num(-190 + i * 48)} ${num(70 - (i % 2) * 14)} Q${num(-140 + i * 48)} ${num(-100 - (i % 3) * 20)} ${num(-90 + i * 48)} ${num(80 - (i % 2) * 10)}" stroke="${c.cloth.light}" stroke-width="9" fill="none" opacity="0.7"/>`).join('')}</g><g transform="translate(120 -110)"><path d="M0 -50 l40 50 -40 50 -40 -50z" fill="${c.accentHex}"/></g></g>`,
  lipstick: (c) => `<g transform="translate(450 560)"><rect x="-52" y="-40" width="104" height="200" rx="12" fill="#171918"/><rect x="-52" y="-40" width="104" height="56" rx="12" fill="${c.accentHex}"/><path d="M-38 160 h76 l0 90 q0 26 -38 26 q-38 0 -38 -26z" fill="${c.cloth.base}"/><path d="M-38 160 h76" stroke="${c.cloth.dark}" stroke-width="4"/><g transform="translate(150 -80)"><rect x="-38" y="0" width="76" height="240" rx="10" fill="${c.cloth.dark}"/><path d="M-38 0 q38 -60 76 0z" fill="${c.cloth.base}"/></g><g opacity="0.7" stroke="${c.cloth.dark}" fill="none"><rect x="-260" y="120" width="150" height="150" rx="10"/></g></g>`,
  kajal: (c) => `<g transform="translate(450 560)"><rect x="-30" y="-160" width="60" height="300" rx="12" fill="#171918"/><rect x="-30" y="-160" width="60" height="70" rx="12" fill="${c.accentHex}"/><path d="M0 140 l0 90" stroke="#171918" stroke-width="9"/><g stroke="${c.cloth.dark}" fill="none" stroke-width="4" opacity="0.8"><path d="M120 -60 q40 -30 80 0 q-40 40 -80 0z"/></g></g>`,
  palette: (c) => `<g transform="translate(450 540)"><rect x="-220" y="-110" width="440" height="280" rx="18" fill="#171918"/><g>${[0, 1, 2].map(r => [0, 1, 2, 3].map(cl => `<rect x="${num(-200 + cl * 100)}" y="${num(-90 + r * 90)}" width="86" height="76" rx="10" fill="${r === 1 && cl === 2 ? c.accentHex : r === 2 ? c.cloth.dark : c.cloth.base}" opacity="${num(0.6 + ((r + cl) % 3) * 0.2)}"/>`).join('')).join('')}</g><rect x="-220" y="-110" width="440" height="280" rx="18" fill="none" stroke="${c.accentHex}" stroke-width="4"/></g>`,
  bottle: (c) => `<g transform="translate(450 520)"><rect x="-100" y="-40" width="200" height="300" rx="26" fill="${c.cloth.base}" opacity="0.9"/><rect x="-100" y="-40" width="200" height="300" rx="26" fill="none" stroke="${c.cloth.dark}" stroke-width="3"/><rect x="-38" y="-140" width="76" height="104" rx="10" fill="#F7F5F0" opacity="0.55"/><rect x="-46" y="-190" width="92" height="56" rx="10" fill="${c.accentHex}"/><rect x="-70" y="60" width="140" height="90" rx="10" fill="#F7F5F0" opacity="0.85"/><g stroke="${c.accentHex}" stroke-width="2.6" opacity="0.8"><path d="M-46 92 h92 M-46 112 h60"/></g></g>`,
};
function accessoryView(c, key) {
  const view = ACC_VIEW[key] || ACC_VIEW['kit'];
  return `<ellipse cx="450" cy="1060" rx="230" ry="20" fill="#000" opacity="0.12" filter="url(#soft)"/>${view(c)}`;
}
function outfitAlt(c, main) {
  return `<g transform="translate(450 640) scale(1.14) translate(-450 -560)">${main}</g><g fill="none" stroke="${c.accentHex}" stroke-width="3" opacity="0.8"><path d="M120 140 h60 M120 140 v60"/><path d="M720 1060 h60 M780 1000 v60"/></g>`;
}
function detailView(c) {
  const sw = `<rect x="150" y="180" width="600" height="560" rx="8" fill="${c.cloth.base}"/>`;
  const overlay = [];
  if (hasFabric(c)) overlay.push(`<rect x="150" y="180" width="600" height="560" fill="url(#f-${c.uid})"/>`);
  if (hasCraft(c)) overlay.push(`<rect x="150" y="180" width="600" height="560" fill="url(#k-${c.uid})" opacity="0.9"/>`);
  const weave = Array.from({ length: 22 }, (_, i) => `<path d="M150 ${num(196 + i * 26)} h600" stroke="${c.cloth.dark}" stroke-width="1.2" opacity="0.30"/>`).join('');
  const edge = `<path d="M150 660 h600 l0 80 h-600z" fill="${shade(c.cloth.dark, -10)}"/><path d="M150 660 h600" stroke="${c.accentHex}" stroke-width="9"/>`;
  const stitch = Array.from({ length: 26 }, (_, i) => `<path d="M${num(164 + i * 23)} 700 l14 0" stroke="#F7F0DC" stroke-width="3" opacity="0.85"/>`).join('');
  const seam = `<path d="M450 180 V740" stroke="${c.cloth.dark}" stroke-width="2" opacity="0.45"/>`;
  return `${sw}${overlay.join('')}${weave}${edge}${stitch}${seam}
  <g opacity="0.92" transform="translate(450 940)">${Array.from({ length: 3 }, (_, i) => `<g transform="translate(${num(-160 + i * 160)} 0)"><rect x="-34" y="-70" width="68" height="140" rx="8" fill="${c.accentHex}" opacity="${num(0.9 - i * 0.16)}"/></g>`).join('')}</g>
  <text x="450" y="1104" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="3" fill="${c.accentHex}" opacity="0.9">${esc((c.product.fabric || 'HANDFINISHED').toUpperCase())} · ${esc((c.product.embroidery || c.product.pattern || c.product.weave || 'CLEAN LINE').toUpperCase())}</text>`;
}

// ── couple composition ────────────────────────────────────────────────────────
export function renderCouplePlate({ her, his, title }) {
  const uid = `cv${hashStr(title + her.id + his.id).toString(36)}`;
  const mk = (product, idSuffix) => {
    const p = product._plate || product;
    const cloth = resolveCloth(p);
    return {
      r: mulberry(hashStr(product.id + idSuffix)), uid: idSuffix, cloth,
      accentHex: accentOf(p), light: cloth.lightColour, skin: hashStr(product.id) % 3, view: 'a',
      product,
    };
  };
  const hc = mk(her, uid + 'h');
  const mc = mk(his, uid + 'm');
  const defs = `<defs>${[hc, mc].map(c => fabricDef(c) + craftDef(c)).join('')}<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter></defs>`;
  const bg = `<rect width="900" height="1200" fill="#F4ECDC"/><g opacity="0.5">${Array.from({ length: 9 }, (_, i) => `<circle cx="${num(70 + i * 96)}" cy="${num(120 + (i % 3) * 12)}" r="11" fill="#E39B45"/><circle cx="${num(70 + i * 96)}" cy="${num(120 + (i % 3) * 12)}" r="4" fill="#C8711F"/>`).join('')}<path d="M70 120 Q450 176 830 120" stroke="#A89163" stroke-width="2" fill="none"/></g>`;
  const figure = (c, product, scale, tx) => {
    const sil = product._plate?.silhouette || '';
    const fn = OUTFITS[sil] || ACC_VIEW[sil] || OUTFITS['kurta-set'];
    return `<g transform="translate(${tx} 40) scale(${scale})">${fn(c)}</g>`;
  };
  const content = figure(hc, her, 0.66, -80) + figure(mc, his, 0.64, 110);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200"><title>${esc(title || 'Couple look')} — VIRAAS Couple Edit</title>${defs}${bg}${content}<ellipse cx="450" cy="1120" rx="330" ry="18" fill="#000" opacity="0.12" filter="url(#soft)"/><path d="M450 170 V1090" stroke="#B7945A" stroke-width="1.6" opacity="0.35" stroke-dasharray="1 7"/><g fill="none" stroke="#B7945A" opacity="0.55" stroke-width="1.4"><path d="M60 100 V60 H132"/><path d="M768 60 H840 V100"/><path d="M60 1100 V1140 H132"/><path d="M768 1140 H840 V1100"/></g><text x="450" y="1168" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="4.6" fill="#B7945A" opacity="0.9">VIRAAS · COUPLE EDIT · ${esc((title || '').toUpperCase())}</text></svg>`;
}
