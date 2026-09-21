import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { occasions, getOccasion } from '../data/occasions';
import { getProductsByOccasion, products, type Product } from '../data/products';
import { looksForOccasion } from '../data/looks';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';

export default function OccasionsPage() {
  const { id } = useParams<{ id?: string }>();
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [genderTab, setGenderTab] = useState<'all' | 'women' | 'men'>('all');
  const [shownCount, setShownCount] = useState(8);

  if (id) {
    const occasion = getOccasion(id);
    if (!occasion) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6] pt-20">
          <div className="text-center px-4">
            <h1 className="font-playfair text-3xl text-[#171918] mb-4">Occasion not found</h1>
            <p className="text-sm text-[#AEB8A0] mb-6">We publish 18 occasion edits — pick one from the index.</p>
            <Link to="/occasions" className="px-6 py-2.5 rounded-full bg-[#103C35] text-white text-sm font-semibold">All Occasions</Link>
          </div>
        </div>
      );
    }
    const all = getProductsByOccasion(occasion.tag).filter((p) => p.category !== 'couple-edit');
    const pool = genderTab === 'all' ? all : all.filter((p) => p.gender === genderTab);
    const occLooks = looksForOccasion(occasion.tag);
    const countFor = (g: 'all' | 'women' | 'men') => (g === 'all' ? all : all.filter((p) => p.gender === g)).length;
    const related = occasion.related.map((r) => getOccasion(r)).filter(Boolean) as NonNullable<ReturnType<typeof getOccasion>>[];

    return (
      <>
        <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
          {/* Hero */}
          <div className="relative py-20 lg:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${occasion.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#171918]/75 to-[#103C35]/85" />
            <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8 text-center">
              <Link to="/occasions" className="text-xs text-[#AEB8A0] hover:text-white uppercase tracking-widest">All Occasions</Link>
              <h1 className="font-playfair text-4xl lg:text-7xl text-white mb-4 mt-3">{occasion.title}</h1>
              <p className="text-[#E9E1D4]/85 text-base max-w-xl mx-auto">{occasion.subtitle}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to={`/women?occasion=${occasion.id}`} className="flex items-center gap-2 px-6 py-3 bg-[#F6F0E6] text-[#103C35] font-semibold rounded-full text-sm hover:bg-white transition-colors">
                  <ShoppingBag size={15} /> SHOP FOR HER · {countFor('women')}
                </Link>
                <Link to={`/men?occasion=${occasion.id}`} className="flex items-center gap-2 px-6 py-3 bg-[#D95E3F] text-white font-semibold rounded-full text-sm hover:bg-[#c24e31] transition-colors">
                  <ShoppingBag size={15} /> SHOP FOR HIM · {countFor('men')}
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-14">
            {/* Editorial intro */}
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 mb-14">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">The VIRAAS take</p>
                {occasion.intro.map((para, i) => (
                  <p key={i} className="text-[#171918]/85 text-base leading-relaxed mb-4">{para}</p>
                ))}
              </div>
              <div className="bg-white rounded-3xl p-6 h-fit">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">Colour story</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {occasion.palette.map((c) => (
                    <Link key={c} to={`/women?occasion=${occasion.id}&colour=${encodeURIComponent(c)}`} className="px-3 py-1.5 rounded-full bg-[#F6F0E6] text-xs font-medium text-[#103C35] hover:bg-[#E9E1D4] transition-colors">
                      {c}
                    </Link>
                  ))}
                </div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Dress code</p>
                <div className="space-y-3 text-sm">
                  <div><p className="text-[#D95E3F] text-[10px] font-bold uppercase tracking-widest mb-0.5">Her</p><p className="text-[#171918]/80 leading-snug">{occasion.dressCode.women}</p></div>
                  <div><p className="text-[#103C35] text-[10px] font-bold uppercase tracking-widest mb-0.5">Him</p><p className="text-[#171918]/80 leading-snug">{occasion.dressCode.men}</p></div>
                </div>
              </div>
            </div>

            {/* Styling rules */}
            <div className="bg-[#103C35] rounded-3xl p-7 md:p-9 mb-14">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#AEB8A0] uppercase mb-5">Style notes that actually matter</p>
              <ul className="grid md:grid-cols-3 gap-5">
                {occasion.styling.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <Check size={16} className="text-[#B7945A] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#F6F0E6]/90 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Looks */}
            {occLooks.length > 0 && (
              <div className="mb-14">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-2">Complete Looks</p>
                    <h2 className="font-playfair text-2xl lg:text-3xl text-[#171918]">{occLooks.length} styled {occasion.title} {occLooks.length === 1 ? 'look' : 'looks'}</h2>
                  </div>
                  {occLooks.some((l) => l.gender === 'couple') && (
                    <Link to="/couple-edit" className="text-sm font-semibold text-[#103C35] hover:text-[#D95E3F] flex items-center gap-1.5">Couple Edit <ArrowRight size={14} /></Link>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {occLooks.slice(0, 4).map((l) => (
                    <Link key={l.id} to={`/look/${l.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#E9E1D4]">
                      <img src={l.imageUrl} alt={l.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/85 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <p className="text-[10px] text-[#B7945A] font-semibold tracking-widest uppercase">{l.gender === 'couple' ? 'Couple' : l.gender}</p>
                        <p className="font-playfair text-white text-base leading-tight">{l.title}</p>
                        <p className="text-[#AEB8A0] text-[11px] mt-0.5">₹{l.price.toLocaleString('en-IN')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-2">Shop the edit</p>
                <h2 className="font-playfair text-2xl lg:text-3xl text-[#171918]">{pool.length.toLocaleString('en-IN')} pieces tagged for {occasion.title}</h2>
              </div>
              <div className="flex gap-2">
                {(['all', 'women', 'men'] as const).map((g) => (
                  <button key={g} onClick={() => { setGenderTab(g); setShownCount(8); }} className={`px-4 py-2 rounded-full text-[13px] font-medium capitalize border transition-colors ${genderTab === g ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>
                    {g === 'all' ? 'Everyone' : g} <span className="opacity-60 tabular-nums">{countFor(g)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pool.slice(0, shownCount).map((p) => <ProductCard key={p.id} product={p} onTryOn={setTryOnProduct} />)}
            </div>
            {shownCount < pool.length && (
              <div className="text-center mt-8 flex gap-3 justify-center">
                <button onClick={() => setShownCount((c) => c + 8)} className="px-7 py-3 rounded-full bg-[#103C35] text-[#F6F0E6] text-sm font-semibold hover:bg-[#0d3028] transition-colors">
                  Show more ({pool.length - shownCount} left)
                </button>
                <Link to={`/${genderTab === 'men' ? 'men' : 'women'}?occasion=${occasion.id}`} className="px-7 py-3 rounded-full border border-[#103C35] text-[#103C35] text-sm font-semibold hover:bg-[#103C35] hover:text-white transition-colors">
                  Full {occasion.title} filter
                </Link>
              </div>
            )}

            {/* Related occasions */}
            {related.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#E9E1D4]">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-5">If {occasion.title} is over, next up</p>
                <div className="grid grid-cols-3 gap-4">
                  {related.slice(0, 3).map((r) => (
                    <Link key={r.id} to={`/occasions/${r.id}`} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#E9E1D4]">
                      <img src={r.image} alt={r.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/80 to-transparent" />
                      <p className="absolute bottom-3 left-4 font-playfair text-white text-lg">{r.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
      </>
    );
  }

  // ── index view ──
  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="bg-[#171918] py-20 lg:py-24 px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">18 living edits</p>
          <h1 className="font-playfair text-4xl lg:text-6xl text-white mb-3">Dress for the Moment</h1>
          <p className="text-[#AEB8A0] text-sm max-w-xl">Each occasion page is a real filter over {products.length.toLocaleString('en-IN')} catalog pieces — live counts, styling rules, colour stories and complete looks, not a banner with four products.</p>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {occasions.map((o) => {
          const n = getProductsByOccasion(o.tag).length;
          return (
            <Link key={o.id} to={`/occasions/${o.id}`} className="group relative rounded-3xl overflow-hidden aspect-[3/4] lg:aspect-[4/5] bg-[#E9E1D4]">
              <img src={o.image} alt={o.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/85 via-[#171918]/10 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <p className="text-[10px] text-[#B7945A] font-bold tracking-widest uppercase mb-1 flex items-center gap-1"><Sparkles size={10} /> {n} pieces</p>
                <p className="font-playfair text-xl text-white mb-0.5">{o.title}</p>
                <p className="text-[#AEB8A0] text-xs line-clamp-1">{o.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
