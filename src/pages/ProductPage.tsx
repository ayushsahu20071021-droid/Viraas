import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, ArrowLeft, Share2, ExternalLink, AlertTriangle, Layers } from 'lucide-react';
import { getProductById, completeTheLook, OCCASION_TAG_BY_ID } from '../data/products';
import { getLooksForProduct } from '../data/looks';
import { toggleSavedLook, isLookSaved } from '../utils/savedLooks';
import { trackAffiliateClick, trackEvent } from '../utils/analytics';
import TryOnModal from '../components/TryOnModal';
import ProductCard from '../components/ProductCard';
import { formatPrice, isMoney } from '../utils/format';

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [saved, setSaved] = useState(() => isLookSaved(id || ''));
  const [activeImage, setActiveImage] = useState(0);
  const [imgFailed, setImgFailed] = useState<Set<number>>(new Set());

  useEffect(() => {
    setImgFailed(new Set());
    setActiveImage(0);
    if (product) {
      document.title = `${product.title} — VIRAAS`;
      const setMeta = (sel: string, attr: string, val: string) => {
        let el = document.head.querySelector<HTMLMetaElement>(sel);
        if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
        el.setAttribute(attr, val);
      };
      setMeta('meta[name="description"]', 'content', product.description.slice(0, 155));
      setMeta('meta[property="og:title"]', 'content', `${product.title} — VIRAAS`);
      setMeta('meta[property="og:description"]', 'content', product.description.slice(0, 155));
      setMeta('meta[property="og:image"]', 'content', `${window.location.origin}${product.imageUrl}`);
      let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
      canon.href = `${window.location.origin}/product/${product.id}`;
    } else {
      document.title = 'Product not found — VIRAAS';
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6] pt-20">
        <div className="text-center">
          <h1 className="font-playfair text-3xl text-[#171918] mb-4">Product not found</h1>
          <p className="text-sm text-[#171918]/60 mb-6">It may have been removed while we verify retailer listings.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/women" className="px-6 py-2.5 rounded-full bg-[#103C35] text-[#F6F0E6] text-sm font-semibold">Shop Women</Link>
            <Link to="/men" className="px-6 py-2.5 rounded-full border border-[#103C35] text-[#103C35] text-sm font-semibold">Shop Men</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, ...(product.gallery || [])];
  const coupleHis = product.herProductId && product.hisProductId ? getProductById(product.hisProductId) : undefined;
  const coupleHer = product.herProductId && product.hisProductId ? getProductById(product.herProductId) : undefined;
  const complete = product.category !== 'couple-edit' ? completeTheLook(product) : [];
  const looks = getLooksForProduct(product.id);
  const related = complete;

  const handleSave = () => {
    const isNowSaved = toggleSavedLook(product.id);
    setSaved(isNowSaved);
    if (isNowSaved) trackEvent('save_product', { productId: product.id });
  };
  const handleShop = () => {
    const url = product.affiliateUrl || product.merchantUrl;
    if (url) {
      trackAffiliateClick(product.id, product.merchantLabel, product.category);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const handleShare = async () => {
    const data = { title: product.title, text: 'Found my festive look on VIRAAS ✨', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(window.location.href); }
      trackEvent('share_look', { productId: product.id });
    } catch { /* user cancelled */ }
  };

  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4">
        <Link to={product.gender === 'men' ? '/men' : product.category === 'couple-edit' ? '/couple-edit' : '/women'} className="inline-flex items-center gap-2 text-sm text-[#AEB8A0] hover:text-[#103C35] transition-colors">
          <ArrowLeft size={16} /> Back to {product.gender === 'men' ? 'For Him' : product.category === 'couple-edit' ? 'Couple Edit' : 'For Her'}
        </Link>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery — every piece has its own plates, no stock fallbacks */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#E9E1D4]">
              <img
                src={imgFailed.has(activeImage) ? '/images/placeholder.svg' : images[activeImage]}
                alt={imgFailed.has(activeImage) ? `${product.title} — visual pending` : `${product.title} — view ${activeImage + 1}`}
                onError={() => setImgFailed((s) => new Set(s).add(activeImage))}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {imgFailed.has(activeImage) && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#D95E3F] font-semibold tracking-wide">
                <AlertTriangle size={12} /> VISUAL PENDING · MARKED CHECK / REPLACE
              </p>
            )}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button key={img} onClick={() => setActiveImage(i)} aria-label={`View ${i + 1}`}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-[#B7945A]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={imgFailed.has(i) ? '/images/placeholder.svg' : img} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleSave}
              className={`absolute top-5 right-5 w-12 h-12 flex items-center justify-center rounded-full shadow-md transition-all ${
                saved ? 'bg-[#D95E3F] text-white' : 'bg-white text-[#171918] hover:bg-[#D95E3F] hover:text-white'
              }`}
              aria-label={saved ? 'Remove from saved' : 'Save look'}
            >
              <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Info */}
          <div className="lg:pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase">{titleCase(product.category)}</span>
              <span className="text-[#E9E1D4]">·</span>
              <span className="text-xs text-[#AEB8A0]">{product.brand}</span>
              {product.status === 'CHECK' && (
                <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-[#F6F0E6] border border-[#E9E1D4] text-[#B7945A]">CHECK</span>
              )}
            </div>

            <h1 className="font-playfair text-3xl lg:text-4xl text-[#171918] mb-4 leading-tight">{product.title}</h1>

            <div className="flex items-center gap-3 mb-2">
              <span className={isMoney(product.price) ? 'text-3xl font-bold text-[#103C35]' : 'text-sm font-medium text-[#AEB8A0] italic'}>
                {formatPrice(product.price)}
              </span>
              {isMoney(product.price) && isMoney(product.originalPrice) && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-[#AEB8A0] line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="px-2 py-1 bg-[#D95E3F] text-white text-xs font-semibold rounded-full">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#AEB8A0] mb-6">
              Curated reference price{product.lastChecked ? ` · verified against retailer on ${product.lastChecked}` : ''}. VIRAAS does not hold stock — live price shows on {product.merchantLabel}.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
              {[
                { label: 'Colour', value: product.colour },
                { label: 'Sold at', value: product.merchantLabel },
                ...(product.fabric && product.fabric !== 'None' ? [{ label: 'Fabric', value: product.fabric }] : []),
                ...(product.embroidery ? [{ label: 'Embroidery', value: product.embroidery }] : []),
                ...(product.pattern ? [{ label: 'Pattern', value: product.pattern }] : []),
                ...(product.weave ? [{ label: 'Weave', value: product.weave }] : []),
                ...(product.sizes.length ? [{ label: 'Sizes', value: product.sizes.join(' · ') }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3">
                  <p className="text-xs text-[#AEB8A0] mb-0.5">{label}</p>
                  <p className="font-medium text-[#171918]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <p className="text-xs text-[#AEB8A0] mb-2">Made for</p>
              <div className="flex flex-wrap gap-2">
                {product.occasions.map((occ) => (
                  <Link key={occ} to={`/occasions/${OCC_ID_BY_TAG[occ] || ''}`} className="px-3 py-1 bg-[#103C35]/10 text-[#103C35] text-xs font-medium rounded-full hover:bg-[#103C35] hover:text-[#F6F0E6] transition-colors">
                    {occ}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              {product.styleTags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#F6F0E6] border border-[#E9E1D4] text-[#AEB8A0] text-xs rounded-full">{tag}</span>
              ))}
            </div>

            {/* Couple set halves */}
            {product.category === 'couple-edit' && coupleHer && coupleHis && (
              <div className="mb-6 bg-white rounded-2xl p-4 border border-[#E9E1D4]">
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-3">The pair inside this set</p>
                <div className="grid grid-cols-2 gap-3">
                  {[coupleHer, coupleHis].map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-3 hover:bg-[#F6F0E6] rounded-xl p-2 -m-2 transition-colors">
                      <img src={p.imageUrl} alt={p.title} className="w-12 h-16 object-cover object-top rounded-lg bg-[#E9E1D4]" loading="lazy" />
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-[#171918] truncate">{p.title}</span>
                        <span className="block text-xs text-[#103C35] font-semibold">{formatPrice(p.price)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3">
              {product.inHouseTryOn && (
                <button
                  onClick={() => setTryOnOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#103C35] text-white font-semibold rounded-full hover:bg-[#0d3028] transition-colors text-sm"
                >
                  <Sparkles size={18} /> TRY THIS OUTFIT ON YOU
                </button>
              )}

              <button
                onClick={handleShop}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors text-sm"
              >
                <ShoppingBag size={18} />
                {product.category === 'couple-edit' ? 'SHOP BOTH HALVES' : `SHOP THIS LOOK ON ${product.merchantLabel.toUpperCase()}`}
                <ExternalLink size={14} />
              </button>
              <p className={`text-[11px] text-center ${product.affiliateUrl ? 'text-[#AEB8A0]' : 'text-[#B7945A]'} -mt-1`}>
                {product.affiliateUrl
                  ? 'Opens your affiliate link.'
                  : 'Affiliate link not configured — this button goes straight to the retailer\'s product search. VIRAAS may earn a commission when you shop through selected affiliate links.'}
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border text-sm font-medium rounded-full transition-colors ${
                    saved ? 'border-[#D95E3F] text-[#D95E3F]' : 'border-[#E9E1D4] text-[#171918] hover:border-[#D95E3F] hover:text-[#D95E3F]'
                  }`}
                >
                  <Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save Look'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#E9E1D4] text-sm font-medium text-[#171918] rounded-full hover:border-[#103C35] transition-colors"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* Verification note — honest, never hidden */}
            {product.notes && (
              <div className="mt-6 p-4 bg-[#E9E1D4]/60 rounded-xl border border-[#E9E1D4]">
                <p className="text-[10px] font-semibold tracking-widest text-[#B7945A] uppercase mb-1.5">Editor note · {product.status === 'CHECK' ? 'pending verification' : 'verified'}</p>
                <p className="text-xs text-[#171918]/70 leading-relaxed">{product.notes}</p>
              </div>
            )}

            {/* Why we picked it */}
            <div className="mt-8 p-6 bg-white rounded-2xl">
              <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-3">Why We Picked It</p>
              <p className="text-sm text-[#171918] leading-relaxed">{product.description}</p>
            </div>

            {/* Looks featuring this piece */}
            {looks.length > 0 && (
              <div className="mt-6 p-6 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-[#B7945A]" />
                  <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase">In {looks.length} curated {looks.length === 1 ? 'look' : 'looks'}</p>
                </div>
                <div className="space-y-2">
                  {looks.slice(0, 3).map((l) => (
                    <Link key={l.id} to={`/look/${l.id}`} className="flex items-center justify-between gap-3 py-2 border-b border-[#F6F0E6] last:border-0 hover:opacity-70 transition-opacity">
                      <span className="text-sm text-[#171918]">{l.title}</span>
                      <span className="text-xs text-[#103C35] font-semibold tabular-nums shrink-0">{formatPrice(l.price)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Complete the Look — tag-based engine */}
        {related.length > 0 && (
          <div className="mt-20">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Styled to match this exact piece</p>
            <h2 className="font-playfair text-2xl lg:text-3xl text-[#171918] mb-8">Complete the Look</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} onTryOn={() => undefined} />
              ))}
            </div>
          </div>
        )}
      </div>

      {tryOnOpen && <TryOnModal product={product} onClose={() => setTryOnOpen(false)} />}
    </div>
  );
}

// occasion tag → page id, derived from the shared taxonomy map
const OCC_ID_BY_TAG: Record<string, string> = Object.fromEntries(Object.entries(OCCASION_TAG_BY_ID).map(([id, tag]) => [tag, id]));
