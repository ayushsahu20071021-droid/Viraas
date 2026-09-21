import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, AlertTriangle } from 'lucide-react';
import { type Product } from '../data/products';
import { getAffiliateUrl } from '../data/affiliate-links';
import { toggleSavedLook, isLookSaved } from '../utils/savedLooks';
import { trackAffiliateClick, trackEvent } from '../utils/analytics';
import { formatPrice, isMoney, discountPct } from '../utils/format';

interface Props {
  product: Product;
  onTryOn?: (product: Product) => void;
}

const merchantTints: Record<string, string> = {
  Myntra: 'bg-[#FF3F6C]/10 text-[#FF3F6C]',
  AJIO: 'bg-[#F26522]/10 text-[#F26522]',
  Flipkart: 'bg-[#2874F0]/10 text-[#2874F0]',
  Shopsy: 'bg-[#2874F0]/10 text-[#2874F0]',
  Meesho: 'bg-[#9C27B0]/10 text-[#9C27B0]',
  Nykaa: 'bg-[#FC2779]/10 text-[#FC2779]',
  'VIRAAS Curated': 'bg-[#103C35]/10 text-[#103C35]',
};

export default function ProductCard({ product, onTryOn }: Props) {
  const [saved, setSaved] = useState(() => isLookSaved(product.id));
  const [imgFailed, setImgFailed] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleSavedLook(product.id);
    setSaved(isNowSaved);
    if (isNowSaved) trackEvent('save_product', { productId: product.id });
  };

  const handleShop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getAffiliateUrl(product.id) || product.merchantUrl;
    if (url) {
      trackAffiliateClick(product.id, product.merchantLabel, product.category);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTryOn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTryOn?.(product);
    trackEvent('click_try_on', { productId: product.id });
  };

  // Discounts are only ever shown when verified data exists — the generator
  // never fabricates originalPrice, so this stays hidden until a human fills it.
  const pct = discountPct(product.price, product.originalPrice)
  const discount = pct !== null ? `${pct}% off` : null;
  const hasPrice = isMoney(product.price);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onClick={() => trackEvent('view_product', { productId: product.id, category: product.category })}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#E9E1D4]">
        <img
          src={imgFailed || !product.imageUrl ? '/images/placeholder.svg' : product.imageUrl}
          alt={imgFailed || !product.imageUrl ? `${product.title || 'This piece'} — visual pending` : product.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500"
        />

        {discount && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-[#D95E3F] text-white text-xs font-semibold rounded-full">
            {discount}
          </span>
        )}
        {(imgFailed || product.status === 'CHECK') && !discount && (
          <span
            title={imgFailed ? 'Product visual pending — replace before publishing' : 'Details pending manual verification against the retailer'}
            className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 text-[10px] font-semibold tracking-wide rounded-full ${imgFailed ? 'bg-[#171918]/80 text-[#F6F0E6]' : 'bg-[#F6F0E6]/90 text-[#B7945A]'} ${discount ? 'top-10' : ''}`}
          >
            <AlertTriangle size={10} /> {imgFailed ? 'CHECK · REPLACE' : 'CHECK'}
          </span>
        )}

        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all ${
            saved ? 'bg-[#D95E3F] text-white' : 'bg-white/90 text-[#171918] hover:bg-[#D95E3F] hover:text-white'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save look'}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#171918]/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            {product.inHouseTryOn && (
              <button
                onClick={handleTryOn}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F6F0E6] text-[#103C35] text-xs font-semibold rounded-full hover:bg-white transition-colors"
              >
                <Sparkles size={13} />
                TRY ON
              </button>
            )}
            <button
              onClick={handleShop}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#D95E3F] text-white text-xs font-semibold rounded-full hover:bg-[#c24e31] transition-colors"
            >
              <ShoppingBag size={13} />
              SHOP
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-medium text-[#171918] leading-snug line-clamp-2 flex-1">{product.title || 'Verified piece'}</h3>
          {product.merchantLabel ? (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${merchantTints[product.merchantLabel] || 'bg-gray-100 text-gray-500'}`}>
              {product.merchantLabel}
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 bg-[#103C35]/10 text-[#103C35]">VIRAAS</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={hasPrice ? 'text-base font-bold text-[#103C35]' : 'text-sm font-medium text-[#AEB8A0] italic'}>
            {formatPrice(product.price)}
          </span>
          {hasPrice && isMoney(product.originalPrice) && product.originalPrice > product.price && (
            <span className="text-xs text-[#AEB8A0] line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {product.brand && <span className="text-xs text-[#AEB8A0] ml-auto">{product.brand}</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {(product.styleTags ?? []).slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-[#AEB8A0] bg-[#F6F0E6] px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
