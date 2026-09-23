# Catalog migration audit

Source: PR #6 HEAD `6edbe57328fa667ca35d19fd7f2f167daf5817d8`. Working branch: `arena/01a0cdd1-viraas`.

- Before: 653 records. After: 653 records. ID additions/deletions: **0 / 0**.
- After: 435 women, 218 men. These are editorial concepts, not verified merchant SKUs.
- 16 former synthetic `cp-set-*` bundle products were remapped to individual garments (8 women, 8 men). Their inherited primary images are NOT accepted for these new garments and remain in the replacement queue.
- Category/gender remaps: 340. No image was recoloured or automatically approved to accompany a remap.
- All couple totals now equal actual referenced product sums; no ₹8,000 cap or invented bundle discount.
- Product brands previously assigned synthetically have been cleared. None of the 653 concepts has an exact verified SKU/brand identity.
- Primary visuals remain an explicit blocker, not hidden by data validation.

## Resulting categories

| Gender | Category | Count |
|---|---|---|
| men | accessories | 30 |
| men | embroidered-ethnic-shirt | 13 |
| men | festive-kurta-set | 42 |
| men | footwear | 11 |
| men | garba-navratri-traditional | 10 |
| men | printed-ethnic-shirt | 11 |
| men | traditional-festive-set | 54 |
| men | traditional-kurta | 47 |
| women | anarkali | 27 |
| women | bags | 15 |
| women | beauty | 25 |
| women | chaniya-choli | 55 |
| women | footwear | 14 |
| women | gharara | 20 |
| women | jewellery | 61 |
| women | kurta-sets | 84 |
| women | lehenga | 27 |
| women | pre-draped-saree | 29 |
| women | sarees | 58 |
| women | sharara | 20 |

## Former bundle ID preservation

| ID | New gender | New category |
|---|---|---|
| cp-set-01 | men | traditional-kurta |
| cp-set-02 | women | chaniya-choli |
| cp-set-03 | men | traditional-kurta |
| cp-set-04 | women | chaniya-choli |
| cp-set-05 | men | traditional-kurta |
| cp-set-06 | women | chaniya-choli |
| cp-set-07 | men | traditional-kurta |
| cp-set-08 | women | chaniya-choli |
| cp-set-09 | men | traditional-kurta |
| cp-set-10 | women | chaniya-choli |
| cp-set-11 | men | traditional-kurta |
| cp-set-12 | women | chaniya-choli |
| cp-set-13 | men | traditional-kurta |
| cp-set-14 | women | chaniya-choli |
| cp-set-15 | men | traditional-kurta |
| cp-set-16 | women | chaniya-choli |
