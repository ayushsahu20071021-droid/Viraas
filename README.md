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

- `src/data/catalog/products.json` — **653 products** (women and men apparel/accessories, 25 beauty, 16 couple-set references) with real metadata: fabric, weave, embroidery, silhouette, occasion tags, colour, budget tier, style tags, per-product `imagePrompt`
- `src/data/catalog/looks.json` — **100 curated looks**, anchor + accessories, priced from the catalog itself
- `src/data/catalog/couples.json` — **100 Couple Edit looks** with her/his halves and human-couple JPG photography
- `src/data/catalog/image-manifest.json` — generated raster-primary inventory used by the catalog and HTTP/image audits
- `public/images/production-products/*.jpg` — 637 raster product primaries for the apparel/accessory catalog; the 16 couple-set product records point to the 100 human-couple JPG primaries, with faceless mannequin apparel photography / accessory still life; original SVG plates remain preserved as fallbacks
- `public/images/couples-v2/*.jpg` — 100 original human-couple JPG photographs with varied festive pose language
- `public/sitemap.xml` (derived from the data) and `robots.txt`

```bash
node scripts/generate-catalog.mjs
npm run check-catalog
npm run audit-affiliate
npm run render-smoke
npm run audit-http-images
```

## Honesty policy (enforced in code + data)

- Every product ships `status: "CHECK"` with an honest `lastChecked` date until a human verifies the live retailer page.
- Affiliate destinations are centralized in `src/data/affiliate-links.ts` and intentionally empty. Paste a real EarnKaro URL there only after manual verification; catalog `affiliateUrl` values stay empty and no tracking URL is fabricated.
- `merchantUrl`s are retailer **search deep-links** (Myntra / AJIO / Flipkart / Shopsy / Meesho / Nykaa). No Amazon anywhere.
- No ratings, review counts, "bestseller" badges, stock claims, or discount badges unless verified. ProductCard shows a CHECK badge and a neutral placeholder on image error — never a hero image as fallback.
- AI Try-On: 18+ confirmation before any upload UI; photos are never stored client-side after generation and never enter analytics; demo results are always labelled "not a rendered try-on".
- Affiliate disclosure on every outbound surface: "VIRAAS may earn a commission when you shop through selected affiliate links."

## Routing map

`/` home · `/women` `/men` `/accessories` (URL faceting: `category, occasion, colour, budget, style, craft, q, sort, tryon, curated`) · `/product/:id` · `/look/:id` · `/occasions` plus exactly `/occasions/garba`, `/occasions/navratri`, `/occasions/diwali`, `/occasions/festive-party`, `/occasions/college-fest` · `/couple-edit` (100 human-couple looks; `/couple` redirects) · `/trending` · `/journal` + `/journal/:slug` (16 articles) · `/search` (products + looks) · `/saved` · `/try-on` · `/about /contact /faq /privacy /terms /affiliate-disclosure /ai-try-on-privacy`

## Deploying to Netlify

`netlify.toml` handles it: build `npm run build`, publish `dist/`, functions in `netlify/functions/`, `/api/try-on` → function redirect, SPA fallback for route refresh, Node 22. Set the env vars in the Netlify UI (not in git).
