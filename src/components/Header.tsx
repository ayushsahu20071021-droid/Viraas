import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Sparkles, Menu, X, ChevronDown } from 'lucide-react';
import { categoriesForGender, getProductsByOccasion } from '../data/products';
import { featuredOccasions } from '../data/occasions';
import { BUDGET_RANGES } from '../data/products';

const womenCategories = categoriesForGender('women').map((c) => ({ key: c.key, label: c.label, count: c.count }));
const menCategories = categoriesForGender('men').map((c) => ({ key: c.key, label: c.label, count: c.count }));

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const headerClass = scrolled
    ? 'bg-[#F6F0E6]/95 backdrop-blur-md shadow-sm border-b border-[#D95E3F]/10'
    : 'bg-transparent';

  const textColor = scrolled || mobileOpen ? 'text-[#171918]' : 'text-white';
  const logoColor = scrolled || mobileOpen ? 'text-[#103C35]' : 'text-white';

  return (
    <>
      <header
        ref={menuRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className={`font-playfair text-2xl lg:text-3xl font-bold tracking-tight ${logoColor} transition-colors duration-300`}>
              VIRAAS
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: 'Women', key: 'women', href: '/women' },
                { label: 'Men', key: 'men', href: '/men' },
                { label: 'Occasions', key: 'occasions', href: '/occasions' },
                { label: 'Couple Edit', key: null, href: '/couple-edit' },
                { label: 'Trending', key: null, href: '/trending' },
                { label: 'Accessories', key: null, href: '/accessories' },
                { label: 'Journal', key: null, href: '/journal' },
              ].map(item => (
                <div key={item.label} className="relative">
                  {item.key ? (
                    <button
                      className={`flex items-center gap-1 text-sm font-medium tracking-wide ${textColor} hover:text-[#D95E3F] transition-colors duration-200 py-2`}
                      onMouseEnter={() => setActiveMenu(item.key)}
                      onFocus={() => setActiveMenu(item.key)}
                      onClick={() => navigate(item.href)}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform ${activeMenu === item.key ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`text-sm font-medium tracking-wide ${textColor} hover:text-[#D95E3F] transition-colors duration-200`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 ${textColor} hover:text-[#D95E3F] transition-colors`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/saved"
                className={`p-2 ${textColor} hover:text-[#D95E3F] transition-colors`}
                aria-label="Saved Looks"
              >
                <Heart size={20} />
              </Link>
              <Link
                to="/try-on"
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#D95E3F] text-white text-sm font-medium rounded-full hover:bg-[#c24e31] transition-colors`}
              >
                <Sparkles size={15} />
                Try On
              </Link>
              <button
                className={`lg:hidden p-2 ${textColor}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu — Women */}
        {activeMenu === 'women' && (
          <div
            className="hidden lg:block absolute top-full left-0 right-0 bg-[#F6F0E6] border-t border-[#E9E1D4] shadow-xl"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-3 gap-10">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Categories</p>
                <ul className="space-y-2">
                  {womenCategories.map(c => (
                    <li key={c.key}>
                      <Link
                        to={`/women?category=${c.key}`}
                        className="flex items-center justify-between text-sm text-[#171918] hover:text-[#103C35] transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        <span>{c.label}</span>
                        <span className="text-[10px] text-[#AEB8A0] tabular-nums">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Occasions</p>
                <ul className="space-y-2">
                  {featuredOccasions.slice(0, 9).map(o => (
                    <li key={o.id}>
                      <Link
                        to={`/occasions/${o.id}`}
                        className="text-sm text-[#171918] hover:text-[#103C35] hover:font-medium transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        {o.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/occasions" className="text-sm font-semibold text-[#D95E3F] hover:underline" onClick={() => setActiveMenu(null)}>
                      All 18 occasion edits →
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Budget</p>
                <ul className="space-y-2">
                  {BUDGET_RANGES.map(b => (
                    <li key={b.key}>
                      <Link
                        to={`/women?budget=${encodeURIComponent(b.key)}`}
                        className="text-sm text-[#171918] hover:text-[#103C35] hover:font-medium transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        {b.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 bg-[#103C35] rounded-xl">
                  <p className="text-xs text-[#AEB8A0] mb-2">AI-Powered</p>
                  <p className="text-sm text-white font-medium mb-3">Try any outfit on yourself before you shop</p>
                  <Link
                    to="/try-on"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D95E3F] hover:text-[#B7945A] transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    <Sparkles size={12} /> TRY ON NOW →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu — Men */}
        {activeMenu === 'men' && (
          <div
            className="hidden lg:block absolute top-full left-0 right-0 bg-[#F6F0E6] border-t border-[#E9E1D4] shadow-xl"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-3 gap-10">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Categories</p>
                <ul className="space-y-2">
                  {menCategories.map(c => (
                    <li key={c.key}>
                      <Link
                        to={`/men?category=${c.key}`}
                        className="flex items-center justify-between text-sm text-[#171918] hover:text-[#103C35] transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        <span>{c.label}</span>
                        <span className="text-[10px] text-[#AEB8A0] tabular-nums">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Occasions</p>
                <ul className="space-y-2">
                  {featuredOccasions.slice(0, 9).map(o => (
                    <li key={o.id}>
                      <Link
                        to={`/occasions/${o.id}`}
                        className="text-sm text-[#171918] hover:text-[#103C35] hover:font-medium transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        {o.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/occasions" className="text-sm font-semibold text-[#D95E3F] hover:underline" onClick={() => setActiveMenu(null)}>
                      All 18 occasion edits →
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-4">Budget</p>
                <ul className="space-y-2">
                  {BUDGET_RANGES.map(b => (
                    <li key={b.key}>
                      <Link
                        to={`/men?budget=${encodeURIComponent(b.key)}`}
                        className="text-sm text-[#171918] hover:text-[#103C35] hover:font-medium transition-all"
                        onClick={() => setActiveMenu(null)}
                      >
                        {b.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-[#103C35] rounded-xl h-fit">
                <p className="text-xs text-[#AEB8A0] mb-2">AI-Powered</p>
                <p className="text-sm text-white font-medium mb-3">See how a festive look translates to you</p>
                <Link
                  to="/try-on"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D95E3F] hover:text-[#B7945A] transition-colors"
                  onClick={() => setActiveMenu(null)}
                >
                  <Sparkles size={12} /> TRY ON NOW →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu — Occasions */}
        {activeMenu === 'occasions' && (
          <div
            className="hidden lg:block absolute top-full left-0 right-0 bg-[#F6F0E6] border-t border-[#E9E1D4] shadow-xl"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="max-w-screen-xl mx-auto px-8 py-8">
              <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-6">Shop by Occasion</p>
              <div className="grid grid-cols-4 gap-4">
                {featuredOccasions.map(o => (
                  <Link
                    key={o.id}
                    to={`/occasions/${o.id}`}
                    className="group p-3 rounded-lg hover:bg-[#103C35] transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    <span className="text-sm font-medium text-[#171918] group-hover:text-white transition-colors block">{o.title}</span>
                    <span className="text-[10px] text-[#AEB8A0] group-hover:text-[#AEB8A0]">{getProductsByOccasion(o.tag).length} pieces</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#F6F0E6] border-t border-[#E9E1D4] max-h-[80vh] overflow-y-auto">
            <nav className="px-4 py-6 space-y-1">
              {[
                { label: 'Women', href: '/women' },
                { label: 'Men', href: '/men' },
                { label: 'Occasions', href: '/occasions' },
                { label: 'Couple Edit', href: '/couple-edit' },
                { label: 'Trending', href: '/trending' },
                { label: 'Accessories', href: '/accessories' },
                { label: 'Journal', href: '/journal' },
                { label: 'Saved Looks', href: '/saved' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block py-3 px-2 text-[#171918] font-medium border-b border-[#E9E1D4] hover:text-[#103C35] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/try-on"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Sparkles size={16} /> Try On an Outfit
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-[#171918]/80 backdrop-blur-sm flex items-start pt-24 px-4">
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center bg-[#F6F0E6] rounded-2xl overflow-hidden shadow-2xl">
              <Search size={20} className="ml-5 text-[#AEB8A0] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search outfits, occasions, colours…"
                className="flex-1 px-4 py-5 bg-transparent text-[#171918] placeholder-[#AEB8A0] outline-none text-lg"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-5 text-[#AEB8A0] hover:text-[#171918]"
              >
                <X size={20} />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Diwali outfits', 'Pre-draped saree', 'Kurta jacket', 'Navratri look', 'Wedding guest'].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSearchQuery(s);
                    navigate(`/search?q=${encodeURIComponent(s)}`);
                    setSearchOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#F6F0E6]/20 text-white text-sm rounded-full border border-white/20 hover:bg-white/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
