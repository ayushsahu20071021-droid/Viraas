import { useState, useRef } from 'react';
import { X, Upload, Sparkles, Camera, AlertCircle, Download, Share2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Product } from '../data/products';
import { trackEvent, trackTryOn } from '../utils/analytics';
import { trackAffiliateClick } from '../utils/analytics';

interface Props {
  product: Product | null;
  onClose: () => void;
}

type Step = 'age-check' | 'upload' | 'processing' | 'result' | 'error';

export default function TryOnModal({ product, onClose }: Props) {
  const [step, setStep] = useState<Step>('age-check');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultNote, setResultNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!product) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!uploadedFile) return;
    setStep('processing');
    trackEvent('click_try_on', { productId: product.id });

    try {
      // Read the photo as base64 and hand it to the server-side function.
      // Keys live ONLY in the Netlify function env — never in this bundle.
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read-failed'));
        reader.readAsDataURL(uploadedFile);
      });

      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageBase64: dataUrl,
          productId: product.id,
          garmentDescription: product.title,
          colour: product.colour,
          silhouette: product.silhouette,
        }),
      });

      if (!res.ok) throw new Error(`endpoint-${res.status}`);
      const json = (await res.json()) as { status?: string; resultImageUrl?: string | null; message?: string };

      // The photo never persists client-side beyond this session step.
      setUploadedFile(null);

      if (json.status === 'ok' && json.resultImageUrl) {
        setResultUrl(json.resultImageUrl);
        setResultNote('');
      } else {
        setResultUrl(null);
        setResultNote(json.message || 'Demo mode active — no AI provider is connected yet, so this is a labelled preview, not a rendered try-on.');
      }
      trackTryOn(product.id, true);
      setStep('result');
    } catch {
      // Endpoint unreachable (e.g. local dev without netlify functions).
      // Fail honestly — still show a clearly-labelled demo preview, never fake a render.
      setUploadedFile(null);
      setResultUrl(null);
      setResultNote('Try-On service is offline right now — showing the product plate as a clearly-labelled demo preview. No photo was processed.');
      trackTryOn(product.id, false);
      setStep('result');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My VIRAAS Look',
      text: `Found my festive look on VIRAAS ✨ — ${product.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
      trackEvent('share_look', { productId: product.id });
    } catch {
      // user cancelled
    }
  };

  const handleShop = () => {
    const url = product.affiliateUrl || product.merchantUrl;
    if (url && url !== '#') {
      trackAffiliateClick(product.id, product.merchantLabel, product.category);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#171918]/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#F6F0E6] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E1D4]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#D95E3F]" />
            <span className="font-playfair text-lg font-medium text-[#171918]">Try It On You</span>
          </div>
          <button onClick={onClose} className="p-2 text-[#AEB8A0] hover:text-[#171918] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Product mini */}
        <div className="flex items-center gap-4 px-6 py-4 bg-[#E9E1D4]/40">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-medium text-[#171918] line-clamp-1">{product.title}</p>
            <p className="text-xs text-[#AEB8A0]">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step: Age Check */}
          {step === 'age-check' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#103C35]/10 flex items-center justify-center">
                <Camera size={28} className="text-[#103C35]" />
              </div>
              <h3 className="font-playfair text-xl mb-3 text-[#171918]">Before We Begin</h3>
              <p className="text-sm text-[#AEB8A0] leading-relaxed mb-6">
                AI Try-On uses your photo to visualize how the outfit might look on you.
                This feature is available for users aged 18 and above.
              </p>
              <div className="bg-[#103C35]/5 rounded-xl p-4 text-left mb-6">
                <p className="text-xs text-[#171918] font-medium mb-1">Your privacy matters.</p>
                <p className="text-xs text-[#AEB8A0]">
                  Your photo is used only to generate the try-on result. It is not stored, shared, or published without your consent. It never appears in analytics.
                </p>
                <Link to="/ai-try-on-privacy" className="text-xs font-semibold text-[#103C35] underline decoration-[#B7945A] underline-offset-2 inline-block mt-2">
                  Read our AI Try-On privacy notice
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setAgeConfirmed(true); setStep('upload'); }}
                  className="w-full py-3.5 bg-[#103C35] text-white font-semibold rounded-full hover:bg-[#0d3028] transition-colors"
                >
                  I am 18 or older — Continue
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm text-[#AEB8A0] hover:text-[#171918] transition-colors"
                >
                  I'm under 18 — Go back
                </button>
              </div>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && ageConfirmed && (
            <div>
              <h3 className="font-playfair text-xl mb-2 text-[#171918]">Upload Your Photo</h3>
              <p className="text-sm text-[#AEB8A0] mb-6">
                Upload a clear, full-body or near-full-body photo in a standing pose for best results.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-[#D95E3F]/10 rounded-xl text-sm text-[#D95E3F]">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {!previewUrl ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video border-2 border-dashed border-[#AEB8A0] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#103C35] hover:bg-[#103C35]/5 transition-all"
                >
                  <Upload size={28} className="text-[#AEB8A0]" />
                  <p className="text-sm font-medium text-[#171918]">Choose Photo</p>
                  <p className="text-xs text-[#AEB8A0]">JPG or PNG, max 10MB</p>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
                  <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setPreviewUrl(null); setUploadedFile(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-[#171918]/70 text-white rounded-full flex items-center justify-center hover:bg-[#171918] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-[#E9E1D4] text-sm text-[#AEB8A0] rounded-full hover:text-[#171918] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!uploadedFile}
                  className="flex-1 py-3 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Generate Try-On
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#E9E1D4] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#D95E3F] animate-spin" />
                <Sparkles size={28} className="absolute inset-0 m-auto text-[#D95E3F]" />
              </div>
              <h3 className="font-playfair text-xl mb-2 text-[#171918]">Creating Your Look…</h3>
              <p className="text-sm text-[#AEB8A0]">This takes a few moments. Please wait.</p>
            </div>
          )}

          {/* Step: Result (Demo) */}
          {step === 'result' && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-[#B7945A]" />
                <p className="text-xs text-[#B7945A] font-semibold tracking-widest uppercase">Demo Mode</p>
              </div>
              <h3 className="font-playfair text-xl mb-4 text-[#171918]">Your VIRAAS Look</h3>

              <div className="rounded-2xl overflow-hidden mb-6 bg-[#E9E1D4] aspect-[3/4]">
                <img
                  src={resultUrl || product.imageUrl}
                  alt="Your VIRAAS try-on result"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-[#AEB8A0] text-center mb-4">{resultNote || 'Demo result shown — labelled as demo until a provider is connected.'}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 border border-[#E9E1D4] text-sm font-medium text-[#171918] rounded-full hover:border-[#103C35] transition-colors"
                >
                  <Share2 size={15} />
                  Share
                </button>
                <a
                  href={product.imageUrl}
                  download={`viraas-look-${product.id}.jpg`}
                  className="flex items-center justify-center gap-2 py-3 border border-[#E9E1D4] text-sm font-medium text-[#171918] rounded-full hover:border-[#103C35] transition-colors"
                >
                  <Download size={15} />
                  Save
                </a>
              </div>
              <button
                onClick={handleShop}
                className="w-full py-3.5 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Shop This Outfit
              </button>
              <button
                onClick={() => { setStep('upload'); setPreviewUrl(null); setUploadedFile(null); }}
                className="w-full mt-2 py-2 text-sm text-[#AEB8A0] hover:text-[#171918] transition-colors"
              >
                Try Another Outfit
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#D95E3F]/10 flex items-center justify-center">
                <AlertCircle size={28} className="text-[#D95E3F]" />
              </div>
              <h3 className="font-playfair text-xl mb-3 text-[#171918]">Something Went Wrong</h3>
              <p className="text-sm text-[#AEB8A0] mb-6">
                Something went wrong while creating your look. Please try again with a clearer photo.
              </p>
              <button
                onClick={() => setStep('upload')}
                className="px-8 py-3 bg-[#103C35] text-white font-semibold rounded-full hover:bg-[#0d3028] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
