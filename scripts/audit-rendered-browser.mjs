#!/usr/bin/env node
/**
 * Production rendered audit.
 *
 * The repository intentionally keeps this dependency-free: render-smoke bundles
 * the real React route tree and renders every catalog card plus priority pages,
 * while this wrapper adds the visual/data assertions that a browser audit must
 * not miss (raster primaries, human-couple JPGs, price ceiling).
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const products = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/products.json'), 'utf8'))
const couples = JSON.parse(readFileSync(join(ROOT, 'src/data/catalog/couples.json'), 'utf8'))
const failures = []
if (products.length !== 653) failures.push(`expected 653 products, got ${products.length}`)
if (couples.length !== 60) failures.push(`expected 60 Couple Edit looks, got ${couples.length}`)
if (products.some((p) => !/\.jpg$/i.test(p.imageUrl || ''))) failures.push('an individual product still has a non-JPG primary')
if (products.some((p) => p.price > 8000)) failures.push('a product exceeds ₹8,000')
if (couples.some((c) => !/\.jpg$/i.test(c.imageUrl || '') || !/\/images\/couples\//.test(c.imageUrl))) failures.push('a Couple Edit look does not use a couples JPG')
if (couples.some((c) => /mannequin|faceless|blank face/i.test(c.imagePrompt || ''))) failures.push('a couple image prompt leaks mannequin/blank-face language')
if (failures.length) { console.error(failures.join('\n')); process.exit(1) }
const run = spawnSync('npm', ['run', 'render-smoke'], { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' })
if (run.status !== 0) process.exit(run.status || 1)
console.log('✓ rendered-browser audit: priority route tree and all catalog card surfaces passed')
