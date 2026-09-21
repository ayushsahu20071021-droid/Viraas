import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { products, BUDGET_RANGES, completeTheLook, type Product } from '../data/products';
import { trackEvent } from '../utils/analytics';
import { looks, coupleLooks, lookAnchors } from '../data/looks';
import { occasions } from '../data/occasions';
import { articles } from '../data/articles';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { formatPrice } from '../utils/format';

const WHATSAPP_NUMBER = '919644424865';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi VIRAAS, I need help finding a festive outfit.');

/** pick a visually diverse rail: one strong piece per category, no duplicates */
function pickRail(gender: 'women' | 'men', size: number): Product[] {
  const out: Product[] = [];
  const byCat = new Map<string, Product[]>();
  for (const p of products) {
    if (p.gender !== gender || p.category === 'couple-edit') continue;
    if (!byCat.has(p.category)) byCat.set(p.category, []);
    byCat.get(p.category)!.push(p);
  }
  let i = 0;
  const order = [...byCat.keys()];
  while (out.length < size && out.length < order.length * 4) {
    const cat = order[out.length % order.length];
    const pool = byCat.get(cat)!;
    const cand = pool[(i * 17 + out.length * 5) % pool.length];
    if (cand && !out.some((o) => o.id === cand.id) && !['beauty'].includes(cand.category)) out.push(cand);
    i++;
    if (i > 60) break;
  }
  return out.slice(0, size);
}

export default function Home() {
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [ctlAnchor, setCtlAnchor] = useState(0);

  const womenProducts = useMemo(() => pickRail('women', 6), []);
  const menProducts = useMemo(() => pickRail('men', 6), []);
  const trendingProducts = useMemo(
    () => products.filter((p) => p.styleTags.includes('Pinterest Inspired') && p.category !== 'couple-edit').slice(20, 24),
    [],
  );
  const accessoryProducts = useMemo(() => {
    const cats = ['jewellery', 'footwear', 'bags', 'beauty'];
    return cats.map((c) => products.find((p) => p.category === c && p.gender === 'women' && p.price > 400)).filter(Boolean) as Product[];
  }, []);
  const ctlAnchors = useMemo(() => [lookAnchors(looks[2])[0], lookAnchors(looks[30])[0], lookAnchors(coupleLooks[0])[0]].filter(Boolean) as Product[], []);
  const anchor = ctlAnchors[ctlAnchor % Math.max(1, ctlAnchors.length)];
  const ctlMatches = anchor ? completeTheLook(anchor, 4) : [];
  const budgetCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (p.category === 'couple-edit') continue;
      for (const r of BUDGET_RANGES) if (p.price >= r.min && p.price <= r.max) counts.set(r.key, (counts.get(r.key) || 0) + 1);
    }
    return counts;
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-main.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/90 via-[#171918]/30 to-transparent" />
        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-8 pb-20 lg:pb-28">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-5">The Festive Edit '26</p>
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight mb-5 max-w-3xl">
            Tradition,<br /><em className="font-normal">reimagined</em><br />for now.
          </h1>
          <p className="text-[#E9E1D4]/80 text-base lg:text-lg max-w-md mb-10 leading-relaxed">
            590+ curated Indian festive pieces, styled into complete looks — see them on you, then shop the real outfit from India's top retailers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/women" className="px-8 py-3.5 bg-[#F6F0E6] text-[#103C35] font-semibold text-sm rounded-full hover:bg-white transition-colors">SHOP WOMEN</Link>
            <Link to="/men" className="px-8 py-3.5 border border-white/50 text-white font-semibold text-sm rounded-full hover:bg-white/10 transition-colors">SHOP MEN</Link>
            <Link to="/try-on" className="flex items-center gap-2 px-8 py-3.5 bg-[#D95E3F] text-white font-semibold text-sm rounded-full hover:bg-[#c24e31] transition-colors">
              <Sparkles size={16} /> TRY AN OUTFIT ON YOU
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* OCCASION DISCOVERY */}
      <section className="py-20 lg:py-28 bg-[#F6F0E6] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Shop by Occasion · 18 edits</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Dress for<br />the Moment</h2>
            </div>
            <Link to="/occasions" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">
              All Occasions <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {occasions.slice(0, 6).map((occasion) => (
              <Link key={occasion.id} to={`/occasions/${occasion.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#E9E1D4]">
                <img src={occasion.image} alt={occasion.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/80 via-[#171918]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-playfair font-medium text-base">{occasion.title}</p>
                  <p className="text-[#AEB8A0] text-xs mt-0.5 line-clamp-1">{occasion.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link to="/occasions" className="inline-flex items-center gap-2 text-sm text-[#103C35] font-semibold">All Occasions <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* FOR HER */}
      <section className="py-20 lg:py-28 bg-white px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Women's Edit</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">For Her</h2>
              <p className="text-[#AEB8A0] mt-2">Sarees, sets, lehengas and fusion — styled for now.</p>
            </div>
            <Link to="/women" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {womenProducts.map((product) => <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />)}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link to="/women" className="inline-flex items-center gap-2 text-sm text-[#103C35] font-semibold">View All Women <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* FOR HIM */}
      <section className="py-20 lg:py-28 bg-[#F6F0E6] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Men's Edit</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">For Him</h2>
              <p className="text-[#AEB8A0] mt-2">Modern festive tailoring, rooted in tradition.</p>
            </div>
            <Link to="/men" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {menProducts.map((product) => <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />)}
          </div>
        </div>
      </section>

      {/* AI TRY-ON */}
      <section className="py-20 lg:py-28 bg-[#103C35] px-4 sm:px-8 overflow-hidden">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#D95E3F]" />
                <p className="text-xs font-semibold tracking-[0.3em] text-[#AEB8A0] uppercase">AI-Powered</p>
              </div>
              <h2 className="font-playfair text-3xl lg:text-5xl text-white mb-6 leading-tight">See It<br /><em>On You</em></h2>
              <p className="text-[#AEB8A0] text-base leading-relaxed mb-8 max-w-md">
                Love the outfit? See how the look could translate to you. Choose a product, upload a photo, and let AI visualise the outfit on your body. 18+ only, photos never leave the private processing pipeline.
              </p>
              <div className="flex items-center gap-3 mb-10 flex-wrap">
                {['Choose Outfit', 'Upload Photo', 'AI Try-On', 'Save & Shop'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#D95E3F]/20 flex items-center justify-center text-[#D95E3F] text-sm font-bold">{i + 1}</div>
                      <span className="text-xs text-[#AEB8A0] mt-1">{step}</span>
                    </div>
                    {i < 3 && <div className="w-8 h-px bg-[#AEB8A0]/30 mt-0 -mt-4" />}
                  </div>
                ))}
              </div>
              <Link to="/try-on" className="inline-flex items-center gap-2 px-8 py-4 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors">
                <Sparkles size={18} /> TRY A LOOK NOW
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#0d3028]">
                <img src="/images/tryon-demo.jpg" alt="AI Virtual Try-On demonstration" className="w-full h-full object-cover opacity-80" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-[#171918]/60 backdrop-blur-sm rounded-2xl px-8 py-6">
                    <Sparkles size={32} className="text-[#D95E3F] mx-auto mb-3" />
                    <p className="text-white font-playfair text-xl">Discover → Try On → Shop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trendingProducts.length > 0 && (
        <section className="py-20 lg:py-28 bg-white px-4 sm:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">On the Edit</p>
                <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Trending Now</h2>
              </div>
              <Link to="/trending" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">View All <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingProducts.map((product) => <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />)}
            </div>
          </div>
        </section>
      )}

      {/* COUPLE EDIT */}
      <section className="py-20 lg:py-28 bg-[#E9E1D4] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Couple Edit · {coupleLooks.length} looks</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918] mb-6">Dress<br />Together</h2>
              <p className="text-[#AEB8A0] text-base leading-relaxed mb-8">
                Coordinated, complementary, colour-story matched — never matchy. Festive dressing for two, styled her + him in one frame and shoppable as a pair.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {coupleLooks.slice(0, 3).map((c) => (
                  <Link key={c.id} to={`/look/${c.id}`} className="group rounded-2xl overflow-hidden bg-white aspect-[3/4] relative">
                    <img src={c.imageUrl} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute inset-x-0 bottom-0 p-2 text-[10px] font-semibold text-white bg-gradient-to-t from-[#171918]/85 to-transparent leading-tight">{c.title}</span>
                  </Link>
                ))}
              </div>
              <Link to="/couple-edit" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#103C35] text-white font-semibold rounded-full hover:bg-[#0d3028] transition-colors">
                EXPLORE COUPLE EDIT <ArrowRight size={16} />
              </Link>
            </div>
            <div>
              <img src="/images/couple-edit.jpg" alt="VIRAAS Couple Edit" className="w-full rounded-3xl object-cover aspect-[4/3]" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CURATED LOOKS */}
      <section className="py-20 lg:py-28 bg-[#F6F0E6] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Curated Looks · {looks.length} edits</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Complete Looks</h2>
              <p className="text-[#AEB8A0] mt-2">Styled head to toe. One click to shop each piece.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[looks[7], looks[19], looks[41]].filter(Boolean).map((look) => (
              <Link key={look.id} to={`/look/${look.id}`} className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-[#E9E1D4]">
                <img src={look.imageUrl} alt={look.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/90 via-[#171918]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs text-[#B7945A] font-semibold tracking-widest uppercase mb-2">{look.occasions.join(' · ')}</p>
                  <h3 className="font-playfair text-2xl text-white mb-2">{look.title}</h3>
                  <p className="text-[#AEB8A0] text-sm line-clamp-2 mb-4">{look.description}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white border border-white/30 px-4 py-2 rounded-full group-hover:bg-white group-hover:text-[#103C35] transition-colors">
                    VIEW LOOK <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESSORIES */}
      <section className="py-20 lg:py-28 bg-white px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">The Finishing Layer</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Accessories &amp; Beauty</h2>
            </div>
            <Link to="/accessories" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {accessoryProducts.map((product) => <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />)}
          </div>
        </div>
      </section>

      {/* BUDGET COLLECTIONS */}
      <section className="py-20 lg:py-28 bg-[#F6F0E6] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">For Every Budget</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Shop Your Budget</h2>
              <p className="text-[#AEB8A0] mt-2">Live counts from {products.filter((p) => p.category !== 'couple-edit').length.toLocaleString('en-IN')} pieces in the catalog.</p>
            </div>
            <Link to="/women?budget=Under%20%E2%82%B91,999" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">
              Browse budget edit <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BUDGET_RANGES.map((b, i) => {
              const count = budgetCounts.get(b.key) || 0;
              if (count === 0) return null;
              const bgs = ['bg-[#E9E1D4]', 'bg-[#AEB8A0]/30', 'bg-[#103C35]/10', 'bg-[#D95E3F]/10', 'bg-[#B7945A]/10', 'bg-[#AEB8A0]/20', 'bg-[#103C35]/15', 'bg-[#D95E3F]/15'];
              return (
                <Link key={b.key} to={`/women?budget=${encodeURIComponent(b.key)}`} className={`${bgs[i % bgs.length]} rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:shadow-md transition-all group ${i >= 4 ? 'sm:py-5' : ''}`}>
                  <p className="font-playfair text-lg lg:text-2xl text-[#171918] mb-1 group-hover:text-[#103C35] transition-colors">{b.label}</p>
                  <p className="text-xs text-[#AEB8A0] tabular-nums mb-1">{count} pieces</p>
                  <span className="text-xs text-[#103C35]/70 flex items-center gap-1 group-hover:text-[#D95E3F] transition-colors">Explore <ArrowRight size={12} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPLETE THE LOOK — engine demo */}
      {anchor && (
        <section className="py-20 lg:py-28 bg-[#103C35] px-4 sm:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#AEB8A0] uppercase mb-3">The VIRAAS Engine</p>
                <h2 className="font-playfair text-3xl lg:text-5xl text-white">Complete the Look</h2>
                <p className="text-[#AEB8A0] mt-2 max-w-md text-sm">Pick a hero piece — our tag-based engine finds the footwear, jewellery and bag that share its colour family and occasion DNA.</p>
              </div>
              <div className="hidden sm:flex gap-2">
                {ctlAnchors.map((a, i) => (
                  <button key={a.id} onClick={() => setCtlAnchor(i)} className={`w-14 h-18 rounded-xl overflow-hidden border-2 transition-colors ${i === ctlAnchor % ctlAnchors.length ? 'border-[#B7945A]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover object-top" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:hidden flex gap-2 mb-2">
                {ctlAnchors.map((a, i) => (
                  <button key={a.id} onClick={() => setCtlAnchor(i)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i === ctlAnchor % ctlAnchors.length ? 'bg-[#B7945A] text-white' : 'bg-white/10 text-[#F6F0E6]'}`}>
                    {a.title.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2 bg-[#F6F0E6] rounded-2xl p-4 flex gap-4 items-center">
                <img src={anchor.imageUrl} alt={anchor.title} className="w-24 h-32 rounded-xl object-cover object-top bg-[#E9E1D4]" loading="lazy" />
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-[#B7945A] uppercase mb-1">Your hero piece</p>
                  <p className="font-playfair text-lg text-[#171918] leading-snug mb-1">{anchor.title}</p>
                  <p className="text-sm text-[#103C35] font-semibold">{formatPrice(anchor.price)}</p>
                  <Link to={`/product/${anchor.id}`} className="inline-flex items-center gap-1 text-xs text-[#D95E3F] font-semibold mt-2">View piece <ArrowRight size={12} /></Link>
                </div>
              </div>
              {ctlMatches.slice(0, 2).map((p) => (
                <div key={p.id} className="lg:col-span-1"><ProductCard product={p} /></div>
              ))}
            </div>
            <Link to={`/product/${anchor.id}`} className="mt-6 inline-flex items-center gap-2 text-sm text-[#F6F0E6]/80 hover:text-white underline underline-offset-4">
              See the full matched set on the product page <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* JOURNAL */}
      <section className="py-20 lg:py-28 bg-white px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">The Journal · {articles.length} stories</p>
              <h2 className="font-playfair text-3xl lg:text-5xl text-[#171918]">Style Stories</h2>
            </div>
            <Link to="/journal" className="hidden sm:flex items-center gap-2 text-sm text-[#103C35] font-semibold hover:text-[#D95E3F] transition-colors">All Articles <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.slice(0, 4).map((article) => (
              <Link key={article.id} to={`/journal/${article.slug}`} className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E9E1D4] mb-4">
                  <img src={article.image} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-xs text-[#B7945A] font-semibold uppercase tracking-widest mb-2">{article.category}</p>
                <h3 className="text-sm font-medium text-[#171918] leading-snug group-hover:text-[#103C35] transition-colors line-clamp-2 mb-2">{article.title}</h3>
                <p className="text-xs text-[#AEB8A0]">{article.readTime} min read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section className="py-16 bg-[#103C35] px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-playfair text-2xl lg:text-3xl text-white mb-2">Need help finding a look?</h3>
            <p className="text-[#AEB8A0] text-sm">Our team is just a message away.</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { pageSource: 'home' })}
            className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1fba58] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            CHAT WITH VIRAAS
          </a>
        </div>
      </section>

      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </>
  );
}
