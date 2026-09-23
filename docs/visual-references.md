# Visual references and calibration — BLOCKED

Date: 2026-09-23.

## Required reference access

No Sheet A or Sheet B attachment was present in this session or found in the checkout. The contact sheets produced in `.arena/audit` are **our audit of repository assets**, not the user's Pinterest references. They must never be described as the supplied 20 panels.

The supplied main pin and these supplied search pages returned HTTP 403 through the page-fetch tool:

- https://in.pinterest.com/pin/999869554780077604/
- Couple Garba 18–25 query
- Men's traditional Garba 2026 query
- `garbaoutfitswomen` query
- Navratri couple query

**None of the 20 required screenshot panels was inspected.** No panel-by-panel visual acceptance is claimed. Other supplied Pinterest queries have not been successfully inspected either.

Accessible supplementary search extracts supported only general craft vocabulary: flared chaniya choli, mirrorwork, colourful dupattas and black/multicolour Garba combinations. These text extracts do not replace the supplied images. [1](https://in.pinterest.com/indiatodaytabcuration/couples-garba-outfits-inspo/) [2](https://www.pinterest.com/ideas/garba-chaniya-choli-black/907180642231/)

## What was actually inspected

1. A repository menswear contact sheet: visibly identical olive jacket/ivory kurta photograph repeated across unrelated names.
2. A repository couple contact sheet: repeated source frames under recolours/crops, with several primary crops losing a partner.
3. Ten newly generated, original calibration candidates, two for each world. All are saved under `public/images/original-couples/`. They are compressed portraits, not copies of Pinterest photos. They have **not** been substituted into the catalog or counted as approved visuals.
4. Actual Chromium renders of desktop/mobile catalog, couple, occasion, search, look and product routes. Structural render success does not override the duplicate or garment mismatch findings.

## Calibration review

| Candidate | Preliminary observation | Acceptance |
|---|---|---|
| couple-garba-01 | Ivory/multicolour skirt, navy kurta, raised-hand twirl. Youthful primary pair; inspect joined hands and hem margins at full resolution. | Pending references + linked product visuals |
| couple-garba-02 | Red/blue Bandhani-style skirt, dark-green printed kurta, walking interaction. Skirt flare/detail should be compared with the actual sheets. | Pending references + linked product visuals |
| couple-navratri-01 | Pink/blue back-view walking shot; wine kurta. Distinct pose. | Pending references + linked product visuals |
| couple-navratri-02 | Black/red craft-focused chaniya, white kurta; laughing interaction. | Pending references + linked product visuals |
| couple-college-fest-01 | Sand/blush saree, navy kurta; sleeve-adjusting interaction in campus corridor. | Pending references + linked product visuals |
| couple-college-fest-02 | Orange ready-to-wear saree, wine kurta; relaxed laughing interaction. Shares corridor visual language with previous shot. | Review background diversity; references blocked |
| couple-diwali-01 | Green/blue saree, ivory kurta; walking across a lit terrace. | Pending references + linked product visuals |
| couple-diwali-02 | Aubergine/green ready-to-wear saree, wine kurta; light turning movement. Inspect pearl details and pre-draped construction. | Pending references + linked product visuals |
| couple-festive-party-01 | Aubergine saree/white kurta, side embrace. | Reject for mass-rollout calibration until differentiated from next candidate |
| couple-festive-party-02 | Plum saree/white kurta, woman facing camera. Too close to previous colour/pose/environment family despite a distinct file. | Rework pair palette/pose/environment, then regenerate |

The new candidates look like human young-adult primary subjects at contact-sheet scale, not faceless mannequins. That is a preliminary observation, **not** a claim that every anatomical, age, reference, construction and composition test passed. Several backgrounds contain additional bystanders despite the prompts; decide against the supplied crowd references whether these are acceptable secondary context. No image-generation cap was reported. Mass generation is blocked by the unpassed calibration/reference gate, not falsely attributed to a tool cap.

## Resume without losing work

- `src/data/catalog/generation-queue.json`: 753 exact next-job specifications, target paths, prompt hashes, candidate hashes, review state and phase priority.
- `npm run generate-catalog`: normalize current data, preserve IDs/accepted image mappings and manual affiliate map, rebuild queue, sitemap and research report. Does NOT create or recolour any images.
- `node scripts/register-image.mjs <id>`: register a generated candidate without promoting it.
- `node scripts/promote-image.mjs <review.json>`: publish only with explicit human review tied to image SHA256 and reference panels. Couples require approved linked garment visuals first.
- Calibration must be independently reviewed before setting its gate to passed. Do not auto-approve based on the existence of JPG files.
- Continue generation in saved phase order after calibration passes. Each product/couple needs its own original composition, not a crop, tint, aliased path or photo renamed to defeat hashing.
- `npm run validate-images`: byte/pixel/perceptual collision checks. Near matches are review flags, not guaranteed duplicates; exact duplicates are deterministic failures.
- `npm run verify`: all gates run and the command fails if visual or research acceptance is outstanding.
