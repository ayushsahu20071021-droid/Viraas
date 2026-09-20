import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { products, TRENDING_STYLE_TAGS } from '../data/products';
import { coupleLooks, allLooks, lookItems } from '../data/looks';
import { getProductById } from '../data/products';
import ProductCard from '../components/ProductCard';

const WHATSAPP_NUMBER = '919644424865';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi VIRAAS, I need help finding a festive outfit.');

function PageWrapper({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="bg-[#171918] py-16 lg:py-20 px-4 sm:px-8 mb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-playfair text-3xl lg:text-5xl text-white mb-3">{title}</h1>
          {subtitle && <p className="text-[#AEB8A0]">{subtitle}</p>}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
        {children}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <PageWrapper title="About VIRAAS" subtitle="Rooted in Tradition. Designed for Now.">
      <div className="space-y-8 text-[#171918]">
        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-playfair text-2xl mb-4">What is VIRAAS?</h2>
          <p className="text-base leading-relaxed text-[#AEB8A0] mb-4">
            VIRAAS is a modern Indian fashion discovery platform. We curate festive and contemporary ethnic fashion
            from India's leading retailers — Myntra, AJIO, Flipkart, Shopsy, Meesho, and Nykaa — and present them
            as thoughtfully styled, complete looks with 500+ pieces, occasion edits, a couple edit and a full journal.
          </p>
          <p className="text-base leading-relaxed text-[#AEB8A0]">
            VIRAAS does not own inventory and does not process final checkout. When you click "Shop" on a VIRAAS product,
            you are directed to the external retailer's product page to complete your purchase. Our editorial plates are
            original VIRAAS visuals — we never repurpose retailer photography.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-playfair text-2xl mb-4">The Core Experience</h2>
          <div className="space-y-4">
            {[
              { title: 'Discover', desc: 'Browse curated Indian festive fashion organized by occasion, style, colour, craft and budget — with result-aware filters, so no click dead-ends.' },
              { title: 'Style it', desc: '120+ complete looks, a Couple Edit with 16 styled pairs, and a tag-based Complete-the-Look engine on every product page.' },
              { title: 'Try On', desc: 'Use our AI Try-On feature to visualise how a selected outfit might look on you before shopping (18+).' },
              { title: 'Shop', desc: 'Click through to the external retailer to complete your purchase. VIRAAS may earn an affiliate commission.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#103C35]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#103C35]">→</span>
                </div>
                <div>
                  <p className="font-medium text-[#171918] mb-1">{item.title}</p>
                  <p className="text-sm text-[#AEB8A0]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-playfair text-2xl mb-4">Our Audience</h2>
          <p className="text-base leading-relaxed text-[#AEB8A0]">
            VIRAAS is built for young India — the 16–30 audience navigating contemporary ethnic fashion for Diwali,
            weddings, Navratri, college fests, and every celebration in between. We curate across women, men, couples,
            accessories and beauty. Under-18 shoppers can browse, save, share and shop freely; personal-photo Try-On is
            reserved for adults, because a face deserves consent rules.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-playfair text-2xl mb-4">How curation stays honest</h2>
          <ul className="text-sm text-[#AEB8A0] space-y-2 leading-relaxed list-disc pl-5">
            <li>Every product carries its own original VIRAAS visual, generated from its metadata — never stock photography.</li>
            <li>No invented ratings, review counts, "sold out" timers or discount badges. Unverified lines are marked CHECK until manually confirmed against the retailer.</li>
            <li>Affiliate links are only added manually, per product, when real tracked links exist. Until then the Shop button goes to the retailer directly and says so.</li>
            <li>Prices are curated reference points with a "last checked" date; the retailer's checkout is always the source of truth.</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}

export function ContactPage() {
  return (
    <PageWrapper title="Contact" subtitle="We're here to help.">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8">
          <h2 className="font-playfair text-2xl mb-4">Get in Touch</h2>
          <p className="text-[#AEB8A0] mb-8">
            Need help finding a look? Question about a product, a retailer listing, or affiliate links? Chat with us on WhatsApp — a human replies.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1fba58] transition-colors"
          >
            <MessageCircle size={20} />
            CHAT WITH VIRAAS
          </a>
          <p className="text-sm text-[#AEB8A0] mt-4">WhatsApp: +91 96444 24865 · Response within a day, festive weeks included.</p>
        </div>
      </div>
    </PageWrapper>
  );
}

export function FAQPage() {
  const faqs = [
    { q: 'Does VIRAAS sell products directly?', a: 'No. VIRAAS is a fashion discovery and curation platform. We curate and present looks, but the actual purchase happens on the external retailer\'s website (Myntra, AJIO, Flipkart, Shopsy, Meesho, Nykaa).' },
    { q: 'What is the AI Try-On feature?', a: 'AI Try-On lets you upload a photo of yourself and see how a selected VIRAAS outfit might look on your body. It is available for users aged 18 and above, and runs in demo mode until the paid vision provider is connected — the UI always tells you which mode you are in.' },
    { q: 'Is my photo stored by VIRAAS?', a: 'Your uploaded photo is used only to generate the try-on result and is never sent to analytics. Please see our AI Try-On Privacy page for full details.' },
    { q: 'Why does a product say "Affiliate link not configured"?', a: 'Because honesty beats monetisation. We never paste guessed links. Until a real EarnKaro/retailer affiliate link is added manually per product, the Shop button takes you straight to the retailer\'s product page and the note tells you so.' },
    { q: 'What does the CHECK badge mean?', a: 'It means the product exists in our editorial catalog but a human has not yet re-verified the retailer listing for price, image rights and stock today. We only remove the badge after manual verification — see the last-checked date on each product.' },
    { q: 'Does VIRAAS earn money from my purchase?', a: 'VIRAAS may earn a commission when you shop through selected affiliate links. This does not affect the price you pay. See our Affiliate Disclosure for details.' },
    { q: 'Are the prices shown accurate?', a: 'Prices are curated reference points at the listed "last checked" date and may change on the retailer\'s website. Always verify the final price on the retailer\'s checkout.' },
    { q: 'Can I return a product?', a: 'Returns are handled directly by the retailer (Myntra, AJIO, etc.) according to their own return policy.' },
    { q: 'I\'m 17 — can I use VIRAAS?', a: 'Absolutely: browse, save, share and shop without limits. The one boundary is personal-photo AI Try-On, which is 18+ because it involves a real photo of your face.' },
    { q: 'How do I contact VIRAAS?', a: 'WhatsApp us at +91 96444 24865. We\'re happy to help you find the right look.' },
  ];

  return (
    <PageWrapper title="FAQ" subtitle="Frequently asked questions.">
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl p-6">
            <h3 className="font-medium text-[#171918] mb-3">{faq.q}</h3>
            <p className="text-sm text-[#AEB8A0] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

export function PrivacyPage() {
  return (
    <PageWrapper title="Privacy Policy" subtitle="How we handle your information.">
      <div className="bg-white rounded-2xl p-8 space-y-6 text-sm text-[#AEB8A0] leading-relaxed">
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">What we collect</h2>
          <p>VIRAAS does not require account registration. We do not collect personal information beyond what is necessary to operate the platform. Analytics (where configured via Google Analytics / Meta Pixel environment keys) are event-level only — page views, searches, filter use, outbound clicks. Analytics payloads never contain uploaded photos, email addresses or names.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">AI Try-On photos</h2>
          <p>Photos uploaded for AI Try-On are sent only to our serverless function for processing, used only to generate the try-on result, and are not retained by VIRAAS, not shared, and not published. See our AI Try-On Privacy page for full details.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Saved looks</h2>
          <p>Your saved pieces and looks live in your browser's localStorage only. They never leave your device and you can clear them at any time from the Saved page or your browser settings.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Affiliate links</h2>
          <p>When you click "Shop" on VIRAAS, you are redirected to an external retailer, through an affiliate link only where one has been manually configured. The retailer's own privacy policy applies to any data collected during your purchase.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Cookies</h2>
          <p>VIRAAS itself sets no first-party cookies. Analytics platforms configured by the site owner may set their own; consent to analytics is handled by their configured consent mode.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Contact</h2>
          <p>For privacy questions, WhatsApp us at +91 96444 24865.</p>
        </div>
        <p className="text-xs pt-4 border-t border-[#F6F0E6]">Last updated: 20 September 2026.</p>
      </div>
    </PageWrapper>
  );
}

export function TermsPage() {
  return (
    <PageWrapper title="Terms of Use" subtitle="Please read before using VIRAAS.">
      <div className="bg-white rounded-2xl p-8 space-y-6 text-sm text-[#AEB8A0] leading-relaxed">
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Nature of the platform</h2>
          <p>VIRAAS is a fashion discovery and curation platform. We do not sell products, take payments or process checkout. All purchases are completed on external retailer websites. Editorial product data (descriptions, styling notes, curated reference prices) is provided for shopping guidance, not as a contractual offer.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Verification status</h2>
          <p>Products marked CHECK carry data curated by VIRAAS that is pending manual re-verification against the retailer. Live price, availability and product imagery must be confirmed on the retailer page before purchase. VIRAAS is not liable for retailer-side changes after our curation date.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Affiliate commission</h2>
          <p>VIRAAS may earn an affiliate commission from qualifying purchases made through curated links where configured. This is disclosed on every relevant page and does not affect the price you pay.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">AI Try-On</h2>
          <p>AI Try-On is provided for visualisation purposes only. Results are illustrative and may vary from the actual product appearance. VIRAAS does not guarantee accuracy of AI-generated results. Photo upload is restricted to users aged 18 and above.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Original visuals</h2>
          <p>All editorial plates on VIRAAS are original generated artwork owned or licensed by VIRAAS. Retailer brand names are referenced for navigation only; no retailer imagery or logos are reproduced without permission.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Governing law</h2>
          <p>These terms are governed by the laws of India. Questions: WhatsApp +91 96444 24865.</p>
        </div>
      </div>
    </PageWrapper>
  );
}

export function AffiliateDisclosurePage() {
  return (
    <PageWrapper title="Affiliate Disclosure" subtitle="How VIRAAS earns.">
      <div className="bg-white rounded-2xl p-8 text-sm text-[#AEB8A0] leading-relaxed space-y-5">
        <p className="text-base font-medium text-[#171918]">
          VIRAAS may earn a commission when you shop through selected affiliate links.
        </p>
        <p>
          When you click "Shop" on a VIRAAS product and make a purchase on the retailer's website, VIRAAS may receive
          an affiliate commission through platforms such as EarnKaro. This commission is paid by the retailer
          and does not affect the price you pay.
        </p>
        <p>
          VIRAAS curates products independently. Curation decisions are based on style, occasion relevance,
          fabric quality, visual appeal and value — never on commission rate.
        </p>
        <p>
          Not all products have an active affiliate link. Where none is configured, product pages state
          "Affiliate link not configured" and the button routes you straight to the retailer's product search — we do not
          paste guessed links or invent tracking parameters.
        </p>
        <p>Supported affiliate retailers: Myntra, AJIO, Flipkart, Shopsy, Meesho, Nykaa.</p>
        <div className="bg-[#103C35]/5 rounded-xl p-4 mt-4">
          <p className="text-[#103C35] font-medium text-sm">Questions? WhatsApp us at +91 96444 24865.</p>
        </div>
      </div>
    </PageWrapper>
  );
}

export function AITryOnPrivacyPage() {
  return (
    <PageWrapper title="AI Try-On Privacy" subtitle="How your photo is used.">
      <div className="bg-white rounded-2xl p-8 text-sm text-[#AEB8A0] leading-relaxed space-y-6">
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">What is AI Try-On?</h2>
          <p>AI Try-On lets you upload a personal photo and see how a selected VIRAAS outfit might look on your body, processed through our serverless function and a vision provider abstraction. While the feature runs in demo mode, the UI labels it explicitly and no real body-swap is performed on your image.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">How your photo is used</h2>
          <p>Your photo is transmitted once, to the VIRAAS function endpoint, used only to generate the try-on result, and never included in analytics payloads (which carry event names and product ids only). The AI focuses on clothing transformation while preserving facial structure and body proportions where technically possible.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Storage and retention</h2>
          <p>VIRAAS does not permanently store uploaded photos. The result exists only during your active session; closing the modal or page ends it. Server-side logs are configured to keep no image data.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Sharing is manual, never automatic</h2>
          <p>Your photo and the AI result are never auto-published. The "Share result" action uses your device's native share sheet with a VIRAAS link — you choose recipients.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Age policy</h2>
          <p>Photo upload is restricted to 18+ by a hard gate before any upload dialog appears. Under-18 visitors keep full access to browsing, saving, sharing and shopping — those parts of VIRAAS never need a photo. This boundary exists because a face in a training-adjacent pipeline is consent, not a feature flag.</p>
        </div>
        <div>
          <h2 className="font-playfair text-xl text-[#171918] mb-3">Your control</h2>
          <p>You may cancel at any time, delete the result, and never use Try-On at all — the rest of VIRAAS works without it. Questions: +91 96444 24865.</p>
        </div>
      </div>
    </PageWrapper>
  );
}

// ── COUPLE EDIT (canonical /couple-edit) ─────────────────────────────────────
export function CoupleEditPage() {
  const [occ, setOcc] = useState<string | null>(null);
  const occList = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of coupleLooks) for (const o of c.occasions) m.set(o, (m.get(o) || 0) + 1);
    return [...m.entries()];
  }, []);
  const filtered = occ ? coupleLooks.filter((c) => c.occasions.includes(occ)) : coupleLooks;
  const pairSets = products.filter((p) => p.category === 'couple-edit');

  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/couple-edit.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171918]/70 to-[#103C35]/85" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">Dressed Together · {coupleLooks.length} Looks</p>
          <h1 className="font-playfair text-5xl lg:text-7xl text-white mb-4">Couple Edit</h1>
          <p className="text-[#E9E1D4]/80 text-base max-w-md mx-auto">Coordinated, complementary, colour-story matched — never matchy. Every pair below styles her + him in one frame and shops as separate pieces.</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOcc(null)} className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${!occ ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>
              All pairs <span className="opacity-60 tabular-nums">{coupleLooks.length}</span>
            </button>
            {occList.map(([o, n]) => (
              <button key={o} onClick={() => setOcc(o === occ ? null : o)} className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${occ === o ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>
                {o} <span className="opacity-60 tabular-nums">{n}</span>
              </button>
            ))}
          </div>
          <Link to="/journal/the-couple-harmony-rule" className="text-[13px] font-semibold text-[#103C35] hover:text-[#D95E3F] flex items-center gap-1.5">
            How couple matching works <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const her = lookItems({ ...c, productIds: c.herProductIds || [] });
            const his = lookItems({ ...c, productIds: c.hisProductIds || [] });
            return (
              <div key={c.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/look/${c.id}`} className="block relative aspect-square bg-[#F6F0E6]">
                  <img src={c.imageUrl} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#171918]/70 text-white text-[10px] font-semibold tracking-widest uppercase">{c.occasions.join(' · ')}</span>
                </Link>
                <div className="p-5">
                  <Link to={`/look/${c.id}`}><h3 className="font-playfair text-xl text-[#171918] mb-1 hover:text-[#103C35]">{c.title}</h3></Link>
                  <p className="text-xs text-[#AEB8A0] line-clamp-2 mb-4">{c.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Half label="Her" items={her} accent="text-[#D95E3F]" />
                    <Half label="Him" items={his} accent="text-[#103C35]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#103C35] tabular-nums">₹{c.price.toLocaleString('en-IN')}<span className="block text-[10px] font-normal text-[#AEB8A0]">both looks</span></p>
                    <Link to={`/look/${c.id}`} className="px-4 py-2 bg-[#103C35] text-white text-xs font-semibold rounded-full hover:bg-[#D95E3F] transition-colors">
                      STYLE IT TOGETHER
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pairSets.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">One Card, Two People</p>
                <h2 className="font-playfair text-3xl text-[#171918]">Shop as a Couple Set</h2>
              </div>
              <Link to="/women" className="text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] flex items-center gap-1">Mix your own <ArrowRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pairSets.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        <div className="mt-16 bg-[#103C35] rounded-3xl p-8 md:p-12 text-center">
          <Sparkles size={22} className="text-[#B7945A] mx-auto mb-4" />
          <h2 className="font-playfair text-2xl md:text-3xl text-white mb-3">Want a pair styled for your exact event?</h2>
          <p className="text-[#AEB8A0] text-sm max-w-md mx-auto mb-6">Send us the occasion, date and colour comfort zone — we'll reply with a her + him board from the live catalog.</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi VIRAAS, I need help finding a festive outfit for two.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1fba58] transition-colors text-sm">
            <MessageCircle size={16} /> REQUEST A COUPLE BOARD
          </a>
        </div>
      </div>
    </div>
  );
}

function Half({ label, items, accent }: { label: string; items: ReturnType<typeof lookItems>; accent: string }) {
  return (
    <div className="bg-[#F6F0E6] rounded-xl p-2.5">
      <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${accent}`}>{label}</p>
      <div className="flex gap-1.5">
        {items.slice(0, 3).map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-[#E9E1D4]" title={p.title}>
            <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-full h-full object-cover object-top" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── TRENDING ──────────────────────────────────────────────────────────────────
export function TrendingPage() {
  const [tag, setTag] = useState(TRENDING_STYLE_TAGS[0]);
  const pool = useMemo(() => products.filter((p) => p.category !== 'couple-edit'), []);
  const items = useMemo(() => pool.filter((p) => p.styleTags.includes(tag)), [pool, tag]);
  const topColours = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pool) m.set(p.colour, (m.get(p.colour) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [pool]);
  const trendingLooks = useMemo(
    () => allLooks.filter((l) => { const anchor = getProductById(l.productIds[0]); return anchor ? anchor.styleTags.includes(tag) : false; }).slice(0, 3),
    [tag]
  );

  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="bg-[#171918] py-20 px-4 sm:px-8 mb-12">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">The Edit · no fake hype</p>
          <h1 className="font-playfair text-4xl lg:text-6xl text-white mb-3">Trending Now</h1>
          <p className="text-[#AEB8A0] text-sm max-w-xl">Trending here means "most styled by VIRAAS editors this season" — every rail below is a real tag across the live catalog, not a manufactured bestseller list.</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-16">
        <div className="flex gap-2 flex-wrap mb-8">
          {TRENDING_STYLE_TAGS.map((t) => {
            const n = pool.filter((p) => p.styleTags.includes(t)).length;
            return (
              <button key={t} onClick={() => setTag(t)} className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${tag === t ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>
                {t} <span className="opacity-60 tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[#AEB8A0] mb-6">
          <span className="font-semibold text-[#103C35] tabular-nums">{items.length}</span> pieces tagged <span className="font-semibold text-[#171918]">{tag}</span> across women, men and accessories
        </p>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center text-sm text-[#AEB8A0]">No {tag} pieces this season yet — the tag updates as the catalog does.</div>
        )}
        {items.length > 12 && (
          <div className="text-center mt-8">
            <Link to={`/women?style=${encodeURIComponent(tag)}`} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#103C35] text-[#F6F0E6] text-sm font-semibold hover:bg-[#0d3028] transition-colors">
              Shop all {items.length} <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <Heart size={16} className="text-[#D95E3F]" />
              <h2 className="font-playfair text-2xl text-[#171918]">Colours leading the edit</h2>
            </div>
            <div className="space-y-3">
              {topColours.map(([colour, n]) => (
                <Link key={colour} to={`/women?colour=${encodeURIComponent(colour)}`} className="flex items-center gap-3 group">
                  <span className="w-7 h-7 rounded-full border border-[#E9E1D4]" style={{ backgroundColor: hexOf(colour) }} />
                  <span className="text-sm font-medium text-[#171918] group-hover:text-[#103C35] flex-1">{colour}</span>
                  <span className="text-xs text-[#AEB8A0] tabular-nums">{n} pieces</span>
                  <ArrowRight size={13} className="text-[#AEB8A0] group-hover:text-[#D95E3F]" />
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-[#B7945A]" />
              <h2 className="font-playfair text-2xl text-[#171918]">Trending as complete looks</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {trendingLooks.map((l) => (
                <Link key={l.id} to={`/look/${l.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#F6F0E6]">
                  <img src={l.imageUrl} alt={l.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/80 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white leading-tight">{l.title}</p>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/women?style=Statement" className="px-4 py-2 rounded-full bg-[#F6F0E6] text-xs font-semibold text-[#103C35] hover:bg-[#E9E1D4]">Statement women</Link>
              <Link to="/men?style=Modern Luxury" className="px-4 py-2 rounded-full bg-[#F6F0E6] text-xs font-semibold text-[#103C35] hover:bg-[#E9E1D4]">Modern luxury men</Link>
              <Link to="/accessories?style=Handloom & Artisan" className="px-4 py-2 rounded-full bg-[#F6F0E6] text-xs font-semibold text-[#103C35] hover:bg-[#E9E1D4]">Artisan accessories</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function hexOf(name: string): string {
  // editorial mirror of the plate engine's palette for UI swatches
  const m: Record<string, string> = {
    Ivory: '#F1E8D6', Emerald: '#103C35', Wine: '#6B2233', Mustard: '#D8A21F', Terracotta: '#D95E3F',
    Rust: '#A85A32', Peach: '#F3CBA6', Blush: '#EFC9C4', Lilac: '#C8BEDC', Sage: '#C2CAB2',
    'Powder Blue': '#A9C4D4', Mint: '#BFDCCB', Turquoise: '#2C9AA6', Gold: '#B7945A', Silver: '#C4C9CC',
    Charcoal: '#2A2E2C', Black: '#171918', White: '#F7F5F0', Navy: '#1F2A4A', Plum: '#5D2E4E',
  };
  if (m[name]) return m[name];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 35% 55%)`;
}
