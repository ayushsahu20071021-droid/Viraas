/**
 * Analytics bootstrap — GA4 + Meta Pixel.
 * IDs come from Vite env vars ONLY (VITE_GA_ID / VITE_META_PIXEL_ID).
 * If they are not set, nothing loads — we never send data to a made-up property.
 */

const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined) || '';
const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || '';

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void };

  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', GA_ID, { send_page_view: false });
  }

  if (META_PIXEL_ID) {
    const s = document.createElement('script');
    s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;
    document.head.appendChild(s);
  }
}
