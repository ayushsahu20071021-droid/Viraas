# VIRAAS — Rooted in Tradition. Designed for Now.

Existing React 19 / Vite 7 / Tailwind 4 / React Router app, with a Netlify Try-On function. This branch continues PR #6's work without merging it into main or rebuilding the app.

**Status: IN PROGRESS / NOT RELEASE-READY.** The recovered catalog had repeated primary photographs and recoloured couple crops. The strict image and visual-acceptance gates intentionally fail until genuine replacements are generated and approved. See [the audit report](docs/execution-report.md), [reference/calibration blockers](docs/visual-references.md), and [pricing evidence](docs/price-research.md).

## Run

```bash
npm ci
npm run dev -- --host 0.0.0.0
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Dev and preview expose the **existing** Netlify `/api/try-on` handler on the same origin. It returns an honest demo response until a server-side provider is configured. The production Netlify redirect and provider abstraction are preserved. No API key belongs in a `VITE_` variable.

Fonts retain DM Sans / Playfair Display and are locally served. The existing cream, green, orange UI is preserved. Browser bundles omit generation prompts and image-audit metadata; source JSON retains them.

## Data and generation

- 653 preserved product IDs, including 16 former synthetic bundle IDs deliberately remapped to individual garment concepts (see migration audit).
- 100 individual styled looks plus exactly 100 couple looks, 20 each for Garba, Navratri, College Fest, Diwali and Festive Party.
- Only those five public occasion routes, filters and sitemap worlds.
- `src/data/catalog/generation-queue.json`: 753 metadata-driven image jobs with priority, exact next prompt, hash, target path and review state.
- Ten original couple calibration candidates are saved but **not published/approved**. The supplied contact sheets were unavailable; reference acceptance has not happened.
- Legacy images are preserved for recovery and labelled pending in the storefront. Raster-file existence is not proof of visual quality, correct garments or uniqueness.

```bash
npm run generate-catalog  # normalize current data, no reset and no image copying
node scripts/register-image.mjs <job-id>
node scripts/promote-image.mjs path/to/human-review.json
```

Normalization asserts counts and references before atomic per-file replacement, backs up inputs locally, restores on failure, and is byte-idempotent for an unchanged catalog. Do not restore the old crop/recolour generator to fill missing assets. Git commit `6edbe57328fa667ca35d19fd7f2f167daf5817d8` preserves the recovered input.

## Validation

With the preview running at port 4173:

```bash
npm run verify
# For another preview address:
BASE_URL=http://127.0.0.1:5173 npm run verify
```

`verify` runs **all** gates, saves `docs/audits/gates.json`, and returns nonzero if any fail. It includes typecheck, catalog, image decoding + byte/pixel/perceptual duplicates, affiliate, SSR smoke, build, five worlds, search, sitemap, actual Chromium, HTTP/API, price coverage and human visual-review state. Browser screenshots are local `.arena/screenshots` artifacts; structured reports persist in `docs/audits`.

Chromium uses Playwright's installed browser, an explicit `CHROMIUM_EXECUTABLE_PATH`, or the packaged Linux fallback. A passing structural browser audit does not imply the fashion/image gate passed.

## Shopping, evidence and privacy

- `src/data/affiliate-links.ts` has exactly one empty key per product. Paste genuine manual EarnKaro URLs here; all Shop CTAs use `resolveShopUrl`. No tracking URL or commission is invented.
- Merchant fallback URLs are searches, **not exact verified SKUs**. Only Myntra, AJIO, Flipkart, Shopsy, Meesho and Nykaa are permitted. Nykaa is limited to beauty.
- Research-supported prices are comparable-market estimates; unsupported prices are explicitly unverified. All products remain CHECK. No synthetic ratings, stock or MRP discounts.
- Product-first Try-On retains the adult gate, photo upload, preview, result, save/share and shopping flow. Uploaded blob URLs are revoked and never sent to analytics.
- Saved products remain in localStorage; Web Share, explicit Copy Link and WhatsApp links remain available. Legal/privacy routes and analytics environment hooks are preserved.

## Deployment

Netlify configuration remains in `netlify.toml`; `dist/` is the deployment output and `/api/try-on` redirects to the serverless handler. **Do not deploy this work as visually complete or merge the PR while the acceptance gates are blocked.**
