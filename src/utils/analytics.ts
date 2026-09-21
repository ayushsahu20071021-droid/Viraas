// Analytics utility — replace GA_ID and META_PIXEL_ID with real env values

/* eslint-disable @typescript-eslint/no-explicit-any */

type EventName =
  | 'view_product'
  | 'click_try_on'
  | 'try_on_success'
  | 'try_on_error'
  | 'save_look'
  | 'share_look'
  | 'affiliate_outbound_click'
  | 'whatsapp_click'
  | 'search'
  | 'filter_used'
  | 'save_product'
  | 'view_look'
  | 'open_try_on';

interface EventParams {
  productId?: string;
  merchant?: string;
  category?: string;
  pageSource?: string;
  query?: string;
  filter?: string;
  occasion?: string;
  results?: number;
  searchScope?: string;
  price?: number;
  gender?: string;
  linkType?: string;
  lookId?: string;
  [key: string]: string | number | undefined;
}

export const trackEvent = (name: EventName, params?: EventParams) => {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if ((window as any).gtag) {
    (window as any).gtag('event', name, params || {});
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('trackCustom', name, params || {});
  }
};

export const trackAffiliateClick = (productId: string, merchant: string, category: string) => {
  trackEvent('affiliate_outbound_click', { productId, merchant, category });
};

export const trackTryOn = (productId: string, success: boolean) => {
  trackEvent(success ? 'try_on_success' : 'try_on_error', { productId });
};

/** SPA route changes: GA is initialised with send_page_view:false, so we push these manually. */
export const trackPageView = (path: string) => {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
  if (w.gtag) w.gtag('event', 'page_view', { page_path: path });
  if (w.fbq) w.fbq('track', 'PageView');
};
