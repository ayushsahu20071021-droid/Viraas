import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShoppingBag, Share2, ExternalLink } from 'lucide-react';
import { getLookById, lookItems } from '../data/looks';
import { getProductById } from '../data/products';
import { getAffiliateUrl } from '../data/affiliate-links';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { type Product } from '../data/products';
import { trackAffiliateClick, trackEvent } from '../utils/analytics';
import { formatPrice, sumPrices } from '../utils/format';

export default function LookPage() {
  const { id } = useParams<{ id: string }>();
  const look = getLookById(id || '');
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  if (!look) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6] pt-20">
        <div className="text-center">
          <h1 className="font-playfair text-3xl text-[#171918] mb-4">Look not found</h1>
          <p className="text-sm text-[#171918]/60 mb-6">Looks refresh with every catalog update — browse the full collection instead.</p>
          <Link to="/women" className="text-[#103C35] font-semibold hover:underline">Browse Women</Link>
        </div>
      </div>
    );
  }

  const items = lookItems(look);
  const herItems = look.herProductIds?.map((i) => getProductById(i)).filter(Boolean) as Product[] | undefined;
  const hisItems = look.hisProductIds?.map((i) => getProductById(i)).filter(Boolean) as Product[] | undefined;
  const isCouple = look.gender === 'couple';
  const anchor = items[0];

  const handleShare = async () => {
    const data = { title: look.title, text: 'Found my festive look on VIRAAS ✨', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(window.location.href);
      trackEvent('share_look', { productId: look.id });
    } catch { /* cancelled */ }
  };
  const shopItem = (p: Product) => {
    // Affiliate URLs resolve ONLY through the central file (src/data/affiliate-links.ts).
    trackAffiliateClick(p.id, p.merchantLabel, p.category);
    window.open(getAffiliateUrl(p.id) || p.merchantUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
        {/* Hero */}
        <div className="relative py-14 lg:py-20 bg-[#103C35] overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${anchor?.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'top center' }} aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-[#103C35]/95 via-[#103C35]/70 to-[#103C35]/30" />
          <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-8">
            <Link to={isCouple ? '/couple-edit' : look.gender === 'men' ? '/men' : '/women'} className="inline-flex items-center gap-2 text-sm text-[#AEB8A0] hover:text-white transition-colors mb-8">
              <ArrowLeft size={16} /> {isCouple ? 'Couple Edit' : `All ${look.gender === 'men' ? 'men' : 'women'}`}
            </Link>
            <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-center">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">
                  {look.occasions.join(' · ')}{look.mood ? ` · ${look.mood}` : ''}{isCouple ? ' · COUPLE EDIT' : ''}
                </p>
                <h1 className="font-playfair text-4xl lg:text-5xl text-white mb-4 leading-tight">{look.title}</h1>
                <p className="text-[#AEB8A0] text-base mb-6 leading-relaxed">{look.description}</p>
                <p className="text-white/90 mb-8">
                  <span className="text-xs text-[#AEB8A0] block mb-1">Full look, all pieces together</span>
                  <span className="text-2xl font-bold tabular-nums">{formatPrice(sumPrices(items.map((p) => p.price)))}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {anchor?.inHouseTryOn && (
                    <button onClick={() => setTryOnProduct(anchor)} className="flex items-center gap-2 px-6 py-3 bg-[#F6F0E6] text-[#103C35] font-semibold rounded-full hover:bg-white transition-colors text-sm">
                      <Sparkles size={16} /> TRY THE ANCHOR PIECE
                    </button>
                  )}
                  <a href="#shop-look" className="flex items-center gap-2 px-6 py-3 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors text-sm">
                    <ShoppingBag size={16} /> SHOP EACH PIECE
                  </a>
                  <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors text-sm">
                    <Share2 size={16} /> SHARE
                  </button>
                </div>
              </div>
              <div className="hidden lg:block bg-[#F6F0E6] rounded-3xl overflow-hidden shadow-xl aspect-[3/4]">
                <img src={look.imageUrl} alt={look.title} className="w-full h-full object-cover object-top" />
              </div>
            </div>
          </div>
        </div>

        {/* Couple halves */}
        {isCouple && herItems && hisItems && (
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pt-14">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border-t-4 border-[#D95E3F]">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#D95E3F] uppercase mb-4">For Her</p>
                <div className="space-y-3">
                  {herItems.map((p) => <RowItem key={p.id} p={p} onShop={() => shopItem(p)} />)}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border-t-4 border-[#103C35]">
                <p className="text-xs font-semibold tracking-[0.3em] text-[#103C35] uppercase mb-4">For Him</p>
                <div className="space-y-3">
                  {hisItems.map((p) => <RowItem key={p.id} p={p} onShop={() => shopItem(p)} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div id="shop-look" className="max-w-screen-xl mx-auto px-4 sm:px-8 py-14">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Products in This Look</p>
          <h2 className="font-playfair text-2xl lg:text-3xl text-[#171918] mb-8">Shop This Look</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />
            ))}
          </div>
          <p className="mt-6 text-xs text-[#AEB8A0]">
            Every piece links to its retailer product page. VIRAAS may earn a commission when you shop through selected affiliate links;
            affiliate links are still being wired up, so buttons currently go directly to {items.length > 0 ? items[0].merchantLabel : 'the retailer'}.
          </p>
        </div>
      </div>
      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </>
  );
}

function RowItem({ p, onShop }: { p: Product; onShop: () => void }) {
  return (
    <div className="flex items-center gap-4 bg-[#F6F0E6] rounded-2xl p-3">
      <Link to={`/product/${p.id}`} className="shrink-0">
        <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-16 h-20 object-cover object-top rounded-xl bg-[#E9E1D4]" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${p.id}`} className="block text-sm font-medium text-[#171918] truncate hover:text-[#103C35]">{p.title}</Link>
        <p className="text-xs text-[#AEB8A0]">{p.brand} · {p.merchantLabel}</p>
        <p className="text-sm font-bold text-[#103C35] tabular-nums">{formatPrice(p.price)}</p>
      </div>
      <button onClick={onShop} className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#103C35] text-white text-xs font-semibold rounded-full hover:bg-[#D95E3F] transition-colors">
        SHOP <ExternalLink size={11} />
      </button>
    </div>
  );
}
