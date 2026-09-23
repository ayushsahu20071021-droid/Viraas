#!/usr/bin/env node
// Run every acceptance gate even when one fails; never hide visual failure behind a build success.
import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
const gates=['typecheck','check-catalog','validate-images','audit-affiliate','render-smoke','build','audit-worlds','audit-search','audit-sitemap','audit-rendered-browser','audit-http','audit-pricing','audit-visual-acceptance']
const results=[]
for(const gate of gates){console.log(`\n=== ${gate} ===`);const r=spawnSync('npm',['run',gate],{stdio:'inherit',env:process.env});results.push({gate,exitCode:r.status,passed:r.status===0})}
fs.mkdirSync('docs/audits',{recursive:true});fs.writeFileSync('docs/audits/gates.json',JSON.stringify({date:'2026-09-23',complete:results.every(r=>r.passed),gates:results},null,2)+'\n')
console.table(results);if(results.some(r=>!r.passed))process.exitCode=1
