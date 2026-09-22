#!/usr/bin/env bash
# Search relevance audit (directive §40) — real searchProducts against the real catalog.
set -euo pipefail
cd "$(dirname "$0")/.."
./node_modules/.bin/esbuild scripts/search-audit.tsx \
  --bundle --platform=node --format=cjs --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' \
  --define:import.meta.env='{"VITE_TRYON_MODE":"demo"}' \
  --outfile=node_modules/.cache/viraas-search-audit.cjs \
  --log-level=error
node node_modules/.cache/viraas-search-audit.cjs
