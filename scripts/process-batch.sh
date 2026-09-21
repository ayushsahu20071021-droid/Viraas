#!/usr/bin/env bash
# Process raw generated imagery → production assets, then map into the catalog.
#   bash scripts/process-batch.sh            # process everything in assets-raw/
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p assets-raw public/images/products public/images/couple-plates

processed=0
for raw in assets-raw/*.jpg; do
  [ -e "$raw" ] || continue
  base="$(basename "$raw" .jpg)"
  # route: couple plates by slug (no prefix clash) vs product ids
  dest=""
  if [ -f "public/images/couple-plates/${base}.svg" ] || grep -q "\"public/images/couple-plates/${base}.jpg\"" .image-manifest.json 2>/dev/null; then
    dest="public/images/couple-plates/${base}.jpg"
  else
    dest="public/images/products/${base}.jpg"
  fi
  # normalise: strip metadata, sRGB, gentle quality ceiling (keeps repo lean)
  convert "$raw" -auto-orient -colorspace sRGB -strip -interlace Plane -sampling-factor 4:2:0 -quality 82 "$dest.new"
  # guard: refuse upscaled blanks / corrupt output
  if ! identify "$dest.new" >/dev/null 2>&1; then echo "✗ convert failed: $raw"; rm -f "$dest.new"; exit 1; fi
  mv "$dest.new" "$dest"
  rm -f "$raw"
  processed=$((processed+1))
done

if [ "$processed" -gt 0 ]; then
  node scripts/promote-images.mjs
fi
echo "process-batch: ${processed} image(s) promoted"
