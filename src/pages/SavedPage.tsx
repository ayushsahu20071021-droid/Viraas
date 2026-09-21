import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Layers } from 'lucide-react';
import { getSavedLooks, toggleSavedLook } from '../utils/savedLooks';
import { getProductById, type Product } from '../data/products';
import { allLooks, lookItems } from '../data/looks';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { trackEvent } from '../utils/analytics';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  const refresh = () => setSavedIds(getSavedLooks());
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const onVisible = () => refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onVisible); };
  }, []);

  const savedProducts = savedIds.map((id) => getProductById(id)).filter(Boolean) as Product[];
  // looks that contain at least one saved piece — "finish what you started"
  const relatedLooks = allLooks.filter((l) => l.productIds.some((id) => savedIds.includes(id))).slice(0, 3);
  const totalValue = savedProducts.reduce((s, p) => s + p.price, 0);
  const tryOnReady = savedProducts.find((p) => p.inHouseTryOn);

  if (savedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D95E3F]/10 flex items-center justify-center">
            <Heart size={32} className="text-[#D95E3F]" />
          </div>
          <h1 className="font-playfair text-3xl text-[#171918] mb-4">No saved pieces yet</h1>
          <p className="text-[#AEB8A0] mb-8 max-w-sm mx-auto text-sm">
            Tap the heart on any product to save it here — saved pieces power look suggestions, budget maths and your Try-On queue. Stored only on this device.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/women" className="px-8 py-3.5 bg-[#103C35] text-white font-semibold rounded-full hover:bg-[#0d3028] transition-colors">Browse Women</Link>
            <Link to="/men" className="px-8 py-3.5 border border-[#103C35] text-[#103C35] font-semibold rounded-full hover:bg-[#103C35] hover:text-white transition-colors">Browse Men</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-16">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Your Collection</p>
            <div className="flex items-center gap-3">
              <Heart size={28} className="text-[#D95E3F]" fill="currentColor" />
              <h1 className="font-playfair text-3xl lg:text-5xl text-[#171918]">My Saved Looks</h1>
            </div>
          </div>
          <p className="text-sm text-[#AEB8A0]">
            <span className="font-semibold text-[#103C35] tabular-nums">{savedProducts.length}</span> pieces ·
            est. total <span className="font-semibold text-[#103C35] tabular-nums">₹{totalValue.toLocaleString('en-IN')}</span>
          </p>
        </div>

        {tryOnReady && (
          <div className="mb-10 bg-[#103C35] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-[#D95E3F]" />
              <p className="text-sm text-[#F6F0E6]">Ready for a virtual try-on: <strong>{tryOnReady.title}</strong></p>
            </div>
            <button onClick={() => { setTryOnProduct(tryOnReady); trackEvent('click_try_on', { productId: tryOnReady.id, pageSource: 'saved' }); }} className="px-5 py-2.5 bg-[#D95E3F] text-white text-sm font-semibold rounded-full hover:bg-[#c24e31] transition-colors">
              TRY IT ON
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {savedProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} onTryOn={setTryOnProduct} />
              <button
                onClick={() => { toggleSavedLook(product.id); refresh(); }}
                className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-[#171918] text-white/80 hover:bg-[#D95E3F] hover:text-white flex items-center justify-center text-xs"
                aria-label={`Remove ${product.title} from saved`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {relatedLooks.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={16} className="text-[#B7945A]" />
              <h2 className="font-playfair text-2xl text-[#171918]">Looks built around your saved pieces</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedLooks.map((l) => (
                <Link key={l.id} to={`/look/${l.id}`} className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#E9E1D4]">
                  <img src={l.imageUrl} alt={l.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171918]/85 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="text-[10px] text-[#B7945A] font-semibold tracking-widest uppercase mb-1">{l.gender === 'couple' ? 'Couple Edit' : `${l.occasions.join(' · ')}`}</p>
                    <p className="font-playfair text-xl text-white">{l.title}</p>
                    <p className="text-[#AEB8A0] text-xs mt-1">{lookItems(l).length} pieces · ₹{l.price.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
}
