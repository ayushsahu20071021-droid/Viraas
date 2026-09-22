import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { trackPageView } from './utils/analytics';

function PageViews() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const OccasionsPage = lazy(() => import('./pages/OccasionsPage'));
const TryOnPage = lazy(() => import('./pages/TryOnPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const LookPage = lazy(() => import('./pages/LookPage'));
const AboutPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.FAQPage })));
const PrivacyPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.TermsPage })));
const AffiliateDisclosurePage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.AffiliateDisclosurePage })));
const AITryOnPrivacyPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.AITryOnPrivacyPage })));
const CoupleEditPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.CoupleEditPage })));
const TrendingPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.TrendingPage })));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#E9E1D4] border-t-[#D95E3F] animate-spin" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#AEB8A0]">VIRAAS</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PageViews />
      <div className="min-h-screen bg-[#F6F0E6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Header />
        <main>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Category pages */}
              <Route
                path="/women"
                element={
                  <CategoryPage
                    gender="women"
                    title="For Her"
                    subtitle="Indian silhouettes, styled for now."
                    heroImage="/images/hero-women.jpg"
                  />
                }
              />
              <Route
                path="/men"
                element={
                  <CategoryPage
                    gender="men"
                    title="For Him"
                    subtitle="Modern festive tailoring, rooted in tradition."
                    heroImage="/images/hero-men.jpg"
                  />
                }
              />
              <Route
                path="/accessories"
                element={
                  <CategoryPage
                    gender="accessories"
                    title="Accessories & Beauty"
                    subtitle="Complete the look — jewellery, bags, footwear, grooming."
                    heroImage="/images/accessories-flatlay.jpg"
                  />
                }
              />

              {/* Occasions */}
              <Route path="/occasions" element={<OccasionsPage />} />
              <Route path="/occasions/garba" element={<OccasionsPage />} />
              <Route path="/occasions/navratri" element={<OccasionsPage />} />
              <Route path="/occasions/diwali" element={<OccasionsPage />} />
              <Route path="/occasions/festive-party" element={<OccasionsPage />} />
              <Route path="/occasions/college-fest" element={<OccasionsPage />} />

              {/* Product */}
              <Route path="/product/:id" element={<ProductPage />} />

              {/* Looks */}
              <Route path="/look/:id" element={<LookPage />} />

              {/* Try On */}
              <Route path="/try-on" element={<TryOnPage />} />

              {/* Journal */}
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/journal/:slug" element={<JournalPage />} />

              {/* Search */}
              <Route path="/search" element={<SearchPage />} />

              {/* Saved */}
              <Route path="/saved" element={<SavedPage />} />

              {/* Couple & Trending */}
              <Route path="/couple-edit" element={<CoupleEditPage />} />
              <Route path="/couple" element={<Navigate to="/couple-edit" replace />} />
              <Route path="/trending" element={<TrendingPage />} />

              {/* Static */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/affiliate-disclosure" element={<AffiliateDisclosurePage />} />
              <Route path="/ai-try-on-privacy" element={<AITryOnPrivacyPage />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6] pt-20">
                    <div className="text-center px-4">
                      <p className="font-playfair text-6xl text-[#E9E1D4] mb-4">404</p>
                      <h1 className="font-playfair text-2xl text-[#171918] mb-2">This page drifted off the runways</h1>
                      <p className="text-sm text-[#AEB8A0] mb-6">The outfit you're after may have moved — try search or the festive edit.</p>
                      <div className="flex gap-3 justify-center">
                        <a href="/" className="px-6 py-2.5 rounded-full bg-[#103C35] text-white text-sm font-semibold">Go home</a>
                        <a href="/search" className="px-6 py-2.5 rounded-full border border-[#103C35] text-[#103C35] text-sm font-semibold">Search</a>
                      </div>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
