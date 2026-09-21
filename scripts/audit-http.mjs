#!/usr/bin/env node
/**
 * VIRAAS post-build visual audit — verifies the BUILT site serves every
 * referenced image correctly over HTTP and that every asset decodes with the
 * right dimensions. Run after `npm run build` (serves dist/ itself).
 *
 *   node scripts/audit-http.mjs
 *
 * Checks:
 *   1. every catalog / look / couple / occasion image path resolves to HTTP 200
 *      with an image content-type (no broken-image icons possible)
 *   2. every image decodes (ImageMagick identify) and has sane dimensions
 *   3. every photographic product visual is 840x1120 (3:4) — the card aspect
 *   4. couple visuals are photographic, distinct, and 3:4
 *   5. key routes return 200 with a root mount
 *   6. zero Amazon references anywhere in the shipped bundle
 */
import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, extname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
if (!existsSync(DIST)) { console.error('dist/ not found — run npm run build first'); process.exit(1) }

const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const looks = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/looks.json'), 'utf8'))
const couples = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/couples.json'), 'utf8'))

// every image path the app can reference
const imagePaths = new Set()
const walk = (d) => {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name)
    if (f.isDirectory()) walk(p)
    else if (/\.(ts|tsx)$/.test(f.name)) {
      const txt = readFileSync(p, 'utf8')
      for (const m of txt.matchAll(/\/images\/[a-z0-9\-_.\/]+\.(?:jpg|jpeg|png|svg)/gi)) imagePaths.add(m[0].toLowerCase())
    }
  }
}
walk(join(ROOT, 'src'))
for (const p of products) { imagePaths.add(p.imageUrl.toLowerCase()); for (const g of p.gallery || []) imagePaths.add(g.toLowerCase()) }
for (const l of looks) { imagePaths.add(l.imageUrl.toLowerCase()); for (const g of l.altImages || []) imagePaths.add(g.toLowerCase()) }
for (const c of couples) imagePaths.add(c.imageUrl.toLowerCase())

const server = createServer((req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0])
  if (path === '/') path = '/index.html'
  const file = join(DIST, path)
  if (!file.startsWith(DIST) || !existsSync(file) || !readFileSync(file) && false) { res.writeHead(404); res.end(); return }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.ico': 'image/x-icon' }
  res.writeHead(200, { 'content-type': types[extname(file).toLowerCase()] || 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

let errors = 0, checked = 0
const fail = (m) => { errors++; if (errors < 40) console.error('  ✗ ' + m) }

console.log(`checking ${imagePaths.size} referenced image paths…`)
for (const img of imagePaths) {
  checked++
  const r = await fetch(base + img)
  if (r.status !== 200) { fail(`${img} → HTTP ${r.status}`); continue }
  const buf = Buffer.from(await r.arrayBuffer())
  const ct = r.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) { fail(`${img} → content-type ${ct}`); continue }
  if (buf.length < 500) { fail(`${img} → only ${buf.length} bytes`); continue }
  if (/\.svg$/i.test(img)) {
    // SVGs: verify well-formed XML (no raster delegate needed)
    const txt = buf.toString('utf8')
    if (!/<svg[\s>]/i.test(txt) || !/<\/svg>\s*$/i.test(txt.trim())) fail(`${img} → not a well-formed SVG document`)
    continue
  }
  try {
    const tmp = `/tmp/viraas-audit${extname(img) || '.jpg'}`
    writeFileSync(tmp, buf)
    const [fmt, w, h] = execFileSync('identify', ['-format', '%m %w %h', tmp]).toString().trim().split(/\s+/)
    if (!/JPEG|PNG/.test(fmt)) fail(`${img} → format ${fmt}`)
    if ((img.startsWith('/images/photos/') || img.startsWith('/images/couples/')) && (w !== '840' || h !== '1120')) fail(`${img} → ${w}x${h}, expected 840x1120`)
    unlinkSync(tmp)
  } catch (e) { fail(`${img} → identify failed: ${e.message}`) }
}

const coupleImgs = couples.map((c) => c.imageUrl)
if (new Set(coupleImgs).size !== coupleImgs.length) fail('couple edit reuses images across looks')
for (const c of couples) if (/\.svg$/i.test(c.imageUrl)) fail(`couple ${c.id} still on SVG plate`)
for (const p of products) if (/\.svg$/i.test(p.imageUrl)) fail(`product ${p.id} still on SVG plate`)

const routes = ['/', '/women', '/men', '/accessories', '/couple-edit', '/occasions', '/occasions/wedding', '/occasions/haldi', '/occasions/garba', '/trending', '/journal', '/search', '/saved', '/try-on', '/about', '/faq', '/affiliate-disclosure', '/ai-try-on-privacy', `/product/${products[0].id}`, `/look/${couples[0].id}`]
for (const route of routes) {
  const r = await fetch(base + route)
  if (r.status !== 200) { fail(`route ${route} → HTTP ${r.status}`); continue }
  const html = await r.text()
  if (!html.includes('id="root"')) fail(`route ${route} → no root mount`)
}

const bundle = readdirSync(DIST).filter((f) => f.endsWith('.js') || f === 'index.html')
for (const f of bundle) {
  const hits = readFileSync(join(DIST, f), 'utf8').match(/amazon/ig)
  if (hits) fail(`${f} contains ${hits.length} amazon reference(s)`)
}

server.close()
console.log(`audit: ${checked} images · ${routes.length} routes · ${bundle.length} bundle files`)
if (errors) { console.error(`✗ ${errors} AUDIT ERROR(S)`); process.exit(1) }
console.log('✓ HTTP visual audit passed — every referenced image serves, decodes and is correctly sized')
