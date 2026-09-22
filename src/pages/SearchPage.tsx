import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Layers } from 'lucide-react';
import { searchProducts, products, categoriesForGender } from '../data/products';
import { allLooks } from '../data/looks';
import { getOccasion } from '../data/occasions';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { type Product } from '../data/products';
import { trackEvent } from '../utils/analytics';
import { formatPrice } from '../utils/format';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const q = searchParams.get('q') || '';
  const results = q ? searchProducts(q, 60) : [];
  const matchedLooks = q
    ? allLooks.filter((l) => {
        const hay = `${l.title} ${l.occasions.join(' ')} ${l.mood} ${l.description}`.toLowerCase();
        return q.toLowerCase().split(/\s+/).filter((t) => t.length > 1).every((t) => hay.includes(t));
      }).slice(0, 6)
    : [];
  const suggestions = ['diwali saree', 'pre-draped', 'festive party men', 'chikankari kurti', 'navratri kediyu', 'ivory organza', 'jhumka', 'bandhgala', 'garba lehenga', 'under 1500 co-ord'];
  const occGuess = q ? ['diwali', 'navratri', 'garba', 'festive-party', 'college-fest'].find((id) => q.toLowerCase().includes(id.replace('-', ' '))) : undefined;

  const submit = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim() });
      trackEvent('search', { query: value.trim(), pageSource: 'search' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
        <div className="bg-white border-b border-[#E9E1D4] sticky top-16 lg:top-20 z-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4">
            <form
              onSubmit={(e) => { e.preventDefault(); submit((e.currentTarget.elements.namedItem('q') as HTMLInputElement).value); }}
              className="flex items-center gap-3 bg-[#F6F0E6] rounded-full px-5 py-3"
            >
              <Search size={18} className="text-[#AEB8A0]" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search outfits, occasions, colours, crafts…"
                aria-label="Search VIRAAS"
                className="flex-1 bg-transparent text-[#171918] placeholder-[#AEB8A0] outline-none text-base"
              />
              <button type="submit" className="text-sm font-semibold text-[#103C35] hover:text-[#D95E3F] transition-colors">Search</button>
            </form>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
          {!q ? (
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-6">Popular Searches</p>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => submit(s)} className="px-5 py-2.5 bg-white border border-[#E9E1D4] text-sm text-[#171918] rounded-full hover:border-[#103C35] hover:text-[#103C35] transition-colors capitalize">
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-12 grid sm:grid-cols-3 gap-4">
                {(['women', 'men', 'accessories'] as const).map((g) => (
                  <Link key={g} to={`/${g}`} className="bg-white rounded-2xl p-5 border border-[#E9E1D4] hover:border-[#B7945A] transition-colors">
                    <p className="font-playfair text-lg text-[#171918] capitalize mb-1">{g === 'accessories' ? 'Accessories & Beauty' : `For ${g === 'women' ? 'Her' : 'Him'}`}</p>
                    <p className="text-xs text-[#AEB8A0]">{categoriesForGender(g).length} categories, {categoriesForGender(g).reduce((s, c) => s + c.count, 0).toLocaleString('en-IN')} pieces — browse instead of searching</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-playfair text-2xl text-[#171918] mb-4">No results for “{q}”</p>
              <p className="text-[#AEB8A0] mb-8 max-w-md mx-auto text-sm">
                Search covers {products.filter((p) => p.category !== 'couple-edit').length.toLocaleString('en-IN')} pieces, {allLooks.length} curated looks and every occasion edit. Try a colour (ivory, wine), a craft (chikankari, bandhani), an occasion or a silhouette (anarkali, bandhgala).
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {occGuess && getOccasion(occGuess) && (
                  <Link to={`/occasions/${occGuess}`} className="px-6 py-3 bg-[#B7945A] text-white font-semibold rounded-full text-sm hover:bg-[#a3834e] transition-colors">
                    Open the {getOccasion(occGuess)!.title} edit
                  </Link>
                )}
                <Link to="/women" className="px-6 py-3 bg-[#103C35] text-white font-semibold rounded-full text-sm hover:bg-[#0d3028] transition-colors">Browse Women</Link>
                <Link to="/men" className="px-6 py-3 border border-[#103C35] text-[#103C35] font-semibold rounded-full text-sm hover:bg-[#103C35] hover:text-white transition-colors">Browse Men</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div>
                <p className="text-sm text-[#AEB8A0] mb-6">
                  <strong className="text-[#171918] tabular-nums">{results.length}</strong> product{results.length !== 1 ? 's' : ''} for “{q}”{matchedLooks.length > 0 ? ` · ${matchedLooks.length} curated look${matchedLooks.length > 1 ? 's' : ''}` : ''}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.map((product) => <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />)}
                </div>
              </div>
              {matchedLooks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Layers size={16} className="text-[#B7945A]" />
                    <h2 className="font-playfair text-xl text-[#171918]">Complete looks featuring “{q}”</h2>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchedLooks.map((l) => (
                      <Link key={l.id} to={`/look/${l.id}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#E9E1D4]">
                        <img src={l.imageUrl} alt={l.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/85 to-transparent" />
                        <div className="absolute bottom-0 p-4">
                          <p className="text-[10px] text-[#B7945A] font-semibold tracking-widest uppercase">{l.gender === 'couple' ? 'Couple Edit' : `${l.gender} · ${l.occasions.join(' ')}`}</p>
                          <p className="font-playfair text-white text-lg leading-tight">{l.title}</p>
                          <p className="text-[#AEB8A0] text-xs mt-1">{formatPrice(l.price)} for the full look</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </>
  );
}
