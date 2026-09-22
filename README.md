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

- `src/data/catalog/products.json` — **595 products** (women 280 apparel + 115 accessories, men 100 apparel + 84 accessories, 25 beauty, 16 couple sets) with real metadata: fabric, weave, embroidery, silhouette, occasion tags, colour, budget tier, style tags, per-product `imagePrompt`
- `src/data/catalog/looks.json` — **122 curated looks**, anchor + accessories, priced from the catalog itself
- `src/data/catalog/couples.json` — **16 couple looks** with her/his halves
- `public/images/products/*.svg` — 1,785 garment plates (+ 16 couple plates)
- `public/sitemap.xml` (752 URLs, derived from the data) and `robots.txt`

```bash
node scripts/generate-catalog.mjs
```

## Honesty policy (enforced in code + data)

- Every product ships `status: "CHECK"` with an honest `lastChecked` date until a human verifies the live retailer page.
- `affiliateUrl` is **empty by design** — paste EarnKaro (or other network) links into the catalog and the UI flips from "Affiliate link not configured" to "Open in EarnKaro". No fabricated tracking params, ever.
- `merchantUrl`s are retailer **search deep-links** from the whitelisted set only (Myntra / AJIO / Flipkart / Shopsy / Meesho / Nykaa) — no retailers outside this list, ever.
- No ratings, review counts, "bestseller" badges, stock claims, or discount badges unless verified. ProductCard shows a CHECK badge and a neutral placeholder on image error — never a hero image as fallback.
- AI Try-On: 18+ confirmation before any upload UI; photos are never stored client-side after generation and never enter analytics; demo results are always labelled "not a rendered try-on".
- Affiliate disclosure on every outbound surface: "VIRAAS may earn a commission when you shop through selected affiliate links."

## Routing map

`/` home · `/women` `/men` `/accessories` (URL faceting: `category, occasion, colour, budget, style, craft, q, sort, tryon, curated`) · `/product/:id` · `/look/:id` · `/occasions` + `/occasions/:id` (18 rich edits) · `/couple-edit` (canonical; `/couple` redirects) · `/trending` · `/journal` + `/journal/:slug` (16 articles) · `/search` (products + looks) · `/saved` · `/try-on` · `/about /contact /faq /privacy /terms /affiliate-disclosure /ai-try-on-privacy`

## Deploying to Netlify

`netlify.toml` handles it: build `npm run build`, publish `dist/`, functions in `netlify/functions/`, `/api/try-on` → function redirect, SPA fallback for route refresh, Node 22. Set the env vars in the Netlify UI (not in git).
