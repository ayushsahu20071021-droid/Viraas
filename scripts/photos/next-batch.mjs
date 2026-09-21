#!/usr/bin/env node
/**
 * Prints the next batch of pending photo slots (couples first, then men,
 * women apparel, accessories) as copy-ready generation lines.
 *
 *   node scripts/photos/next-batch.mjs [count] [--slot <name>]
 *
 * Each line: SLOTNAME <tab> PROMPT — feed the prompt to the image generator,
 * stage the raw output as <staging>/<slotname>.jpg, then run process.mjs.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (f) => { const p = join(ROOT, 'scripts/photos', f); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : [] }

const productBrief = read('product-brief.json')
const coupleBrief = read('couple-brief.json')
const extras = read('extras.json')
const PRIORITY = { men: 1, 'women-apparel': 2, accessory: 3 }
const pending = [
  ...coupleBrief.filter((b) => !existsSync(join(ROOT, 'public', b.file))).map((b) => ({ slot: b.cid, file: b.file, prompt: b.prompt, pr: 0 })),
  ...extras.filter((b) => !existsSync(join(ROOT, 'public', b.file))).map((b) => ({ slot: b.slot, file: b.file, prompt: b.prompt, pr: 0 })),
  ...productBrief.filter((b) => !existsSync(join(ROOT, 'public', b.file))).map((b) => ({ slot: b.slot, file: b.file, prompt: b.prompt, pr: PRIORITY[b.kind] || 4 })),
].sort((a, b) => a.pr - b.pr || a.slot.localeCompare(b.slot))

const count = Number(process.argv[2] || 5)
const only = process.argv.includes('--slot') ? process.argv[process.argv.indexOf('--slot') + 1] : null
const batch = only ? pending.filter((p) => p.slot === only) : pending.slice(0, count)
console.log(`PENDING ${pending.length} (couples ${pending.filter((p) => p.pr === 0).length} · men ${pending.filter((p) => p.pr === 1).length} · women ${pending.filter((p) => p.pr === 2).length} · acc ${pending.filter((p) => p.pr === 3).length})`)
for (const b of batch) console.log(`\n### ${b.slot} → ${b.file}\n${b.prompt}`)
