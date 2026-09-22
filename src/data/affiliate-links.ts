/**
 * Single source of truth for VIRAAS affiliate destinations.
 *
 * Keep values empty until the owner pastes a real EarnKaro destination. The
 * catalog's merchantUrl remains the transparent retailer/search fallback; it
 * is never silently rewritten into an affiliate URL.
 */
export const affiliateLinks: Record<string, string> = {
  // 'w-garba-chaniya-production-01': 'PASTE_REAL_EARNKARO_URL_HERE',
}

export function getAffiliateUrl(productId: string): string {
  return affiliateLinks[productId] || ''
}
