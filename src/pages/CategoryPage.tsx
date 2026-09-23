// Category pages (/women /men /accessories) — result-aware faceting.
// Every chip, rail option and count is computed against the CURRENT result
// pool, so a click never lands on a dead end; filters are URL-driven.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, Sparkles, ArrowRight } from 'lucide-react';
import {
  BUDGET_RANGES, CATEGORY_LABELS, filterProducts, getProductsByGender,
  OCCASION_TAG_BY_ID, type BudgetKey, type Product,
} from '../data/products';
import { curatedProductIds } from '../data/looks';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { trackEvent } from '../utils/analytics';

interface Props {
  gender: 'women' | 'men' | 'accessories';
  title: string;
  subtitle: string;
  heroImage: string;
}

const PAGE_SIZE = 12;

function normalizeBudget(raw: string | null): BudgetKey | undefined {
  if (!raw) return undefined;
  const t = decodeURIComponent(raw);
  const exact = BUDGET_RANGES.find((r) => r.key === t);
  if (exact) return exact.key as BudgetKey;
  const m = t.toLowerCase().replace(/[₹,\s–-]+/g, ' ').trim();
  const under = m.match(/^under (\d+)$/);
  if (under) {
    const hit = BUDGET_RANGES.find((r) => r.max === Number(under[1]));
    if (hit) return hit.key as BudgetKey;
  }
  return undefined;
}

export default function CategoryPage({ gender, title, subtitle, heroImage }: Props) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [visiblePages, setVisiblePages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);

  const f = {
    scope: gender,
    category: params.get('category') || undefined,
    occasionId: params.get('occasion') || undefined,
    colour: params.get('colour') || undefined,
    budget: normalizeBudget(params.get('budget')),
    style: params.get('style') || undefined,
    craft: params.get('craft') || undefined,
    query: params.get('q') || undefined,
    sort: (params.get('sort') as 'recommended' | 'price-asc' | 'price-desc' | 'newest') || 'recommended',
    tryOn: params.get('tryon') === '1',
    curated: params.get('curated') === '1',
  };

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === null || value === '') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    trackEvent('filter_used', { filter: `${key}:${value ?? 'clear'}`, pageSource: gender });
  };

  const { items, total, facets } = useMemo(
    () => filterProducts({ ...f }, { curatedIds: curatedProductIds }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search],
  );
  const shown = items.slice(0, visiblePages * PAGE_SIZE);
  useEffect(() => setVisiblePages(1), [location.search]);

  const categoryPool = filterProducts({ ...f, category: undefined }).items;
  const cats = [...new Set(categoryPool.map(p => p.category))].sort((a,b) => Object.keys(CATEGORY_LABELS).indexOf(a) - Object.keys(CATEGORY_LABELS).indexOf(b)).map(key => ({key, label: CATEGORY_LABELS[key] || key, count: categoryPool.filter(p => p.category === key).length}));
  const totalScope = getProductsByGender(gender).length;
  const activeChips = [
    f.category && { key: 'category', label: cats.find((c) => c.key === f.category)?.label || f.category },
    f.occasionId && { key: 'occasion', label: OCCASION_TAG_BY_ID[f.occasionId] || f.occasionId },
    f.colour && { key: 'colour', label: f.colour },
    f.budget && { key: 'budget', label: f.budget },
    f.style && { key: 'style', label: f.style },
    f.craft && { key: 'craft', label: f.craft },
    f.tryOn && { key: 'tryon', label: 'Try-On ready' },
    f.curated && { key: 'curated', label: 'In a curated look' },
    f.query && { key: 'q', label: `"${f.query}"` },
  ].filter(Boolean) as { key: string; label: string }[];

  const occasionFacet = facets.find((g) => g.key === 'occasion');

  const rail = (
    <div className="space-y-6">
      {facets.filter((g) => g.key !== 'category').map((group) => (
        <div key={group.key}>
          <p className="font-playfair text-[15px] text-[#171918] mb-2.5">{group.label}</p>
          <ul className="space-y-1.5">
            {group.options.slice(0, group.key === 'budget' ? 8 : 7).map((o) => {
              const active = (f as Record<string, unknown>)[group.key === 'age' ? 'age' : group.key] === o.value;
              return (
                <li key={o.value}>
                  <button
                    onClick={() => setParam(group.key === 'occasion' ? 'occasion' : group.key, active ? undefined : o.value)}
                    className={`w-full flex items-center justify-between text-[13px] leading-6 px-1 rounded transition-colors ${active ? 'text-[#D95E3F] font-semibold' : 'text-[#171918]/75 hover:text-[#103C35]'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {active && <X size={11} />}
                      {o.label}
                    </span>
                    <span className="text-[11px] text-[#AEB8A0] tabular-nums">{o.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="pt-2 border-t border-[#E9E1D4]">
        <Link to="/couple-edit" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#103C35] hover:text-[#D95E3F]">
          Style her + him together <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="pt-16 lg:pt-20">
      {/* Editorial banner — page chrome only; never used as a product image */}
      <section className="relative h-56 md:h-72 overflow-hidden">
        <img src={heroImage} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-top" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#103C35]/85 via-[#103C35]/55 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center">
          <p className="text-[#B7945A] tracking-[0.3em] text-xs mb-2">ROOTED IN TRADITION. DESIGNED FOR NOW.</p>
          <h1 className="font-playfair text-3xl md:text-5xl text-[#F6F0E6] mb-2">{title}</h1>
          <p className="text-[#F6F0E6]/75 text-sm md:text-base max-w-md">{subtitle}</p>
          <p className="mt-3 text-xs text-[#F6F0E6]/60 tabular-nums">{totalScope.toLocaleString('en-IN')} pieces in this edit · {cats.length} categories</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Category chips — dynamic, from real data, with counts */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
          <button
            onClick={() => setParam('category', undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${!f.category ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}
          >
            All <span className="opacity-60 tabular-nums">{totalScope}</span>
          </button>
          {cats.map((c) => (
            <button
              key={c.key}
              onClick={() => setParam('category', f.category === c.key ? undefined : c.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${f.category === c.key ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}
            >
              {c.label} <span className="opacity-60 tabular-nums">{c.count}</span>
            </button>
          ))}
        </div>

        {/* Budget rail — mirrors the homepage tiles, counts are live */}
        {!f.category && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {BUDGET_RANGES.map((b) => {
              const hit = facets.find((g) => g.key === 'budget')?.options.find((o) => o.value === b.key);
              if (!hit) return null;
              return (
                <button
                  key={b.key}
                  onClick={() => setParam('budget', f.budget === b.key ? undefined : b.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${f.budget === b.key ? 'bg-[#B7945A] text-white border-[#B7945A]' : 'bg-transparent border-[#E9E1D4] text-[#171918]/70 hover:border-[#B7945A]'}`}
                >
                  {b.label} <span className="opacity-60 tabular-nums">{hit.count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">{rail}</div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E9E1D4] text-[13px] font-medium text-[#171918]"
              >
                <SlidersHorizontal size={14} /> Filters {activeChips.length > 0 && <span className="bg-[#D95E3F] text-white rounded-full px-1.5 text-[10px]">{activeChips.length}</span>}
              </button>
              <p className="text-[13px] text-[#171918]/60">
                <span className="font-semibold text-[#103C35] tabular-nums">{Math.min(shown.length, total)}</span> of{' '}
                <span className="tabular-nums">{total.toLocaleString('en-IN')}</span> {total === 1 ? 'piece' : 'pieces'}
              </p>
              {activeChips.map((c) => (
                <button key={c.key} onClick={() => setParam(c.key, undefined)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E9E1D4] text-xs text-[#103C35] font-medium hover:bg-[#D95E3F] hover:text-white transition-colors">
                  {c.label} <X size={11} />
                </button>
              ))}
              {activeChips.length > 0 && (
                <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="text-xs underline text-[#171918]/50 hover:text-[#D95E3F]">
                  Clear all
                </button>
              )}
              <label className="ml-auto flex items-center gap-2 text-xs text-[#171918]/60">
                Sort
                <select
                  value={f.sort}
                  onChange={(e) => setParam('sort', e.target.value === 'recommended' ? undefined : e.target.value)}
                  className="bg-white border border-[#E9E1D4] rounded-full px-3 py-1.5 text-[12px] text-[#171918] focus:outline-none focus:border-[#B7945A]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price · low to high</option>
                  <option value="price-desc">Price · high to low</option>
                  <option value="newest">Newest in</option>
                </select>
              </label>
            </div>

            {total === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E9E1D4] p-8 text-center">
                <p className="font-playfair text-xl text-[#171918] mb-2">This combination has no pieces yet</p>
                <p className="text-sm text-[#171918]/60 mb-5">Remove a filter — the counts above show exactly where results live, so every chip below has catalog results.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {activeChips.map((c) => (
                    <button key={c.key} onClick={() => setParam(c.key, undefined)} className="px-3.5 py-2 rounded-full border border-[#B7945A] text-[13px] text-[#103C35] font-medium hover:bg-[#B7945A] hover:text-white transition-colors">
                      Drop “{c.label}”
                    </button>
                  ))}
                  {cats.filter((c) => c.count > 0).slice(0, 4).map((c) => (
                    <button key={c.key} onClick={() => setParams(new URLSearchParams({ category: c.key }), { replace: true })} className="px-3.5 py-2 rounded-full bg-[#F6F0E6] text-[13px] text-[#171918]/80 hover:bg-[#E9E1D4]">
                      {c.label} · {c.count}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {shown.map((p) => (
                    <ProductCard key={p.id} product={p} onTryOn={setTryOnProduct} />
                  ))}
                </div>
                {shown.length < total && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisiblePages((v) => v + 1)}
                      className="px-8 py-3 rounded-full bg-[#103C35] text-[#F6F0E6] text-sm font-semibold hover:bg-[#0c2f2a] transition-colors"
                    >
                      Load 12 more <span className="opacity-70 text-xs">({total - shown.length} left)</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Occasion crosslink, only when results actually exist */}
            {occasionFacet && occasionFacet.options.length > 0 && !f.occasionId && (
              <div className="mt-10 bg-[#F6F0E6] rounded-2xl p-6 border border-[#E9E1D4]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-[#B7945A]" />
                  <p className="font-playfair text-lg text-[#171918]">Shop these pieces by occasion</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {occasionFacet.options.slice(0, 8).map((o) => {
                    const occId = Object.keys(OCCASION_TAG_BY_ID).find((k) => OCCASION_TAG_BY_ID[k] === o.value);
                    if (!occId) return null;
                    return (
                      <Link key={o.value} to={`/occasions/${occId}`} className="px-3.5 py-1.5 rounded-full bg-white border border-[#E9E1D4] text-[13px] text-[#103C35] hover:border-[#B7945A] transition-colors">
                        {o.value} <span className="text-[#AEB8A0] tabular-nums">{o.count}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#171918]/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-[#F6F0E6] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="font-playfair text-lg">Filters</p>
              <button onClick={() => setFiltersOpen(false)} className="p-2 -mr-2 text-[#171918]/60" aria-label="Close filters"><X size={18} /></button>
            </div>
            {rail}
          </div>
        </div>
      )}

      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
}
