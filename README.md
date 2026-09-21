# VIRAAS — Rooted in Tradition. Designed for Now.

A festive Indian-fashion discovery platform: **Discover → Try On → Shop**.
VIRAAS never owns inventory or checkout — it curates, styles, and hands shoppers off to partner retailers via links.

## Stack

React 19 · Vite 7 · Tailwind CSS v4 (`@tailwindcss/vite`) · react-router-dom v7 · lucide-react · deployed on Netlify (SPA + one serverless function).

```bash
npm install
npm run dev          # local dev (Try-On degrades honestly when the function isn't running)
npm run build        # production bundle → dist/
npx netlify dev      # full local stack incl. /api/try-on function
```

## Environment variables

Copy `.env.example` → `.env`. **Nothing is required to run the site** — every integration degrades to a safe, clearly-labelled state when unset. We never invent IDs, links, prices, or performance claims.

| Variable | Used by | If unset |
|---|---|---|
| `VITE_GA_ID` | GA4 bootstrap (`src/utils/analytics-init.ts`) | No analytics script loads |
| `VITE_META_PIXEL_ID` | Meta Pixel bootstrap | No pixel loads |
| `TRYON_MODE` | Netlify function (`netlify/functions/try-on.js`) | Defaults to `demo` |
| `AI_PROVIDER_API_KEY` etc. | server-side only, when you wire a real provider | Function returns labelled demo response |

The client shows `VITE_TRYON_MODE` as a DEMO MODE / LIVE PROVIDER badge on `/try-on`.

## Catalog (generated, never hand-edited)

`scripts/generate-catalog.mjs` deterministically produces:

- `src/data/catalog/products.json` — **607 products** (women 280 apparel + 115 accessories, men 143 apparel + 84 accessories, 12 Wedding Formals, 25 beauty, 16 couple sets) with real metadata: fabric, weave, embroidery, silhouette, occasion tags, colour, budget tier, style tags, per-product `imagePrompt`
- `src/data/catalog/looks.json` — **122 curated looks**, anchor + accessories, priced from the catalog itself
- `src/data/catalog/couples.json` — **60 couple looks** — unique editorial scenes, colour stories and 5 real product references each
- `src/data/affiliate-links.ts` — **THE central affiliate file** (see below)
- `public/images/photos/*.jpg` + `public/images/couples/*.jpg` — original AI-shot editorial photography (840×1120, 3:4); SVG plates exist only as a pre-photo fallback
- `public/sitemap.xml` (derived from the data) and `robots.txt`

```bash
node scripts/generate-catalog.mjs
```

### Photographic asset pipeline

Every product and couple look gets an original editorial photograph. The system is
brief-driven and fully reproducible:

- `scripts/photos/slots.json` — committed map of product id → photo slot (stable across regenerations)
- `scripts/photos/product-brief.json` / `couple-brief.json` — the generation worklist (prompt, expected colour, target file) for every photo not yet on disk
- `scripts/photos/next-batch.mjs` — prints the next pending slots (couples → men → women → accessories)
- `scripts/photos/process.mjs` — normalises raw generations to 840×1120 q80 JPEG and QA-checks them (decode, blank detection, dominant-colour match against the product's colour family)
- `scripts/audit-http.mjs` — post-build audit: every referenced image must serve over HTTP, decode, and be exactly 3:4; every couple visual must be photographic and distinct; zero Amazon references in the bundle

### Affiliate links — one file, and only one file

`src/data/affiliate-links.ts` maps **every product id** to its affiliate URL and exports
`getAffiliateUrl(productId)`. Values ship empty by design. To wire links: paste your
EarnKaro URLs into that file and nothing else — the product card, product page, look page
and try-on modal all resolve through `getAffiliateUrl`. `npm run check-catalog` fails if
the file is missing ids, has malformed URLs, or contains an Amazon link. The generator
preserves any pasted values when the catalog is regenerated.

## Honesty policy (enforced in code + data)

- Every product ships `status: "CHECK"` with an honest `lastChecked` date until a human verifies the live retailer page.
- Affiliate URLs live **only** in `src/data/affiliate-links.ts` (initially empty by design) — paste EarnKaro links there and the UI flips from "Affiliate link not configured" to opening your link. No fabricated tracking params, ever.
- `merchantUrl`s are retailer **search deep-links** (Myntra / AJIO / Flipkart / Shopsy / Meesho / Nykaa). No Amazon anywhere.
- No ratings, review counts, "bestseller" badges, stock claims, or discount badges unless verified. ProductCard shows a CHECK badge and a neutral placeholder on image error — never a hero image as fallback.
- AI Try-On: 18+ confirmation before any upload UI; photos are never stored client-side after generation and never enter analytics; demo results are always labelled "not a rendered try-on".
- Affiliate disclosure on every outbound surface: "VIRAAS may earn a commission when you shop through selected affiliate links."

## Routing map

`/` home · `/women` `/men` `/accessories` (URL faceting: `category, occasion, colour, budget, style, craft, q, sort, tryon, curated`; men includes the **Wedding Formals** category) · `/product/:id` · `/look/:id` · `/occasions` + `/occasions/:id` (20 rich edits incl. Haldi and Garba & Dandiya) · `/couple-edit` (canonical, 60 looks; `/couple` redirects) · `/trending` · `/journal` + `/journal/:slug` (16 articles) · `/search` (products + looks) · `/saved` · `/try-on` · `/about /contact /faq /privacy /terms /affiliate-disclosure /ai-try-on-privacy`

## Deploying to Netlify

`netlify.toml` handles it: build `npm run build`, publish `dist/`, functions in `netlify/functions/`, `/api/try-on` → function redirect, SPA fallback for route refresh, Node 22. Set the env vars in the Netlify UI (not in git).
