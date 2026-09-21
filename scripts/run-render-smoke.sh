#!/usr/bin/env bash
# Render smoke test — bundles the SSR harness with esbuild and renders every
# product card + every route server-side. Catches runtime crashes (undefined
# field access) that tsc and HTTP-200 checks cannot see.
set -euo pipefail
cd "$(dirname "$0")/.."
./node_modules/.bin/esbuild scripts/render-smoke.tsx \
  --bundle --platform=node --format=cjs --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' \
  --define:import.meta.env='{"VITE_TRYON_MODE":"demo"}' \
  --outfile=node_modules/.cache/viraas-render-smoke.cjs \
  --log-level=error
node node_modules/.cache/viraas-render-smoke.cjs
