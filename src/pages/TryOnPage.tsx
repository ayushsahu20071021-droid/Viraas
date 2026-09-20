import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { type Product } from '../data/products';

export default function TryOnPage() {
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  const tryOnEligible = products.filter(p => p.inHouseTryOn && p.gender !== 'couple' && p.category !== 'couple-edit');
  const tryOnMode = (import.meta.env.VITE_TRYON_MODE as string | undefined) || 'demo';

  return (
    <>
      <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-[#103C35] py-20 lg:py-28 px-4 sm:px-8">
          <div className="max-w-screen-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={24} className="text-[#D95E3F]" />
              <p className="text-xs font-semibold tracking-[0.3em] text-[#AEB8A0] uppercase">AI-Powered Try-On</p>
            </div>
            <h1 className="font-playfair text-4xl lg:text-7xl text-white mb-6 leading-tight">
              See It<br /><em>On You</em>
            </h1>
            <p className="text-[#AEB8A0] text-base lg:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Choose an outfit from VIRAAS, upload a photo of yourself, and let AI show you how the look translates to your body. Then save it, share it, or shop it.
            </p>

            {/* Flow */}
            <div className="inline-flex items-center gap-3 bg-[#0d3028] rounded-full px-8 py-4">
              {['Choose Outfit', 'Upload Photo', 'AI Magic', 'Shop'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{step}</span>
                  {i < 3 && <ArrowRight size={14} className="text-[#AEB8A0]" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Age Notice */}
        <div className="bg-[#B7945A]/10 border-b border-[#B7945A]/20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-[#B7945A] bg-[#B7945A]/20 px-2 py-1 rounded-full whitespace-nowrap">18+</span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#D95E3F] bg-[#D95E3F]/10 px-2 py-1 rounded-full whitespace-nowrap">{tryOnMode === 'live' ? 'LIVE PROVIDER' : 'DEMO MODE'}</span>
            <p className="text-sm text-[#171918]">
              Photo upload is available for users aged 18 and above — you'll confirm before uploading.{' '}
              {tryOnMode !== 'live' && 'Try-On currently runs in clearly-labelled demo mode; no real render is produced. '}
              <Link to="/ai-try-on-privacy" className="underline decoration-[#B7945A] underline-offset-2 font-semibold">How your photo is handled</Link>.
            </p>
          </div>
        </div>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-8 bg-white">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="font-playfair text-2xl lg:text-3xl text-[#171918] mb-10 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Browse & Choose', desc: 'Browse VIRAAS products and click "Try On" on any outfit you love.' },
                { step: '02', title: 'Confirm Age', desc: 'Confirm you are 18 or older. Your privacy is protected throughout.' },
                { step: '03', title: 'Upload Your Photo', desc: 'Upload a clear full-body or near-full-body photo in JPG or PNG.' },
                { step: '04', title: 'See & Shop', desc: 'View your AI try-on result, save it, share it, or shop the real outfit.' },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#103C35]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#103C35]">{item.step}</span>
                  </div>
                  <h3 className="font-playfair text-lg text-[#171918] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#AEB8A0] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy note */}
        <div className="bg-[#F6F0E6] py-8 px-4 sm:px-8">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#AEB8A0]">
              Your photo is used only to generate the try-on result and is not stored or shared.{' '}
              <Link to="/ai-try-on-privacy" className="text-[#103C35] underline">Learn more about AI Try-On Privacy</Link>
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">Try-On Ready</p>
              <h2 className="font-playfair text-3xl lg:text-4xl text-[#171918]">Choose an Outfit to Try On</h2>
              <p className="text-[#AEB8A0] mt-2">Click "Try On" on any product below to begin.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {tryOnEligible.map(product => (
                <ProductCard key={product.id} product={product} onTryOn={setTryOnProduct} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {tryOnProduct && (
        <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
      )}
    </>
  );
}
