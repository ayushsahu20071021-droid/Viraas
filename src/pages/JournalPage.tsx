import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { articles, getArticle, articleRail, type Article } from '../data/articles';
import ProductCard from '../components/ProductCard';
import TryOnModal from '../components/TryOnModal';
import { type Product } from '../data/products';

export default function JournalPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [cat, setCat] = useState<string | null>(null);

  if (slug) {
    const article = getArticle(slug);
    if (!article) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F0E6] pt-20">
          <div className="text-center">
            <h1 className="font-playfair text-3xl text-[#171918] mb-4">Story not found</h1>
            <Link to="/journal" className="text-[#103C35] font-semibold hover:underline">Back to Journal</Link>
          </div>
        </div>
      );
    }
    return <ArticleView article={article} tryOnProduct={tryOnProduct} setTryOnProduct={setTryOnProduct} />;
  }

  const [featured, ...rest] = articles;
  const cats = [...new Set(articles.map((a) => a.category))];
  const shown = cat ? rest.filter((a) => a.category === cat) : rest;

  return (
    <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
      <div className="bg-[#171918] py-20 lg:py-28 px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-4">The VIRAAS Journal · {articles.length} stories</p>
          <h1 className="font-playfair text-4xl lg:text-7xl text-white">Style Stories</h1>
          <p className="text-[#AEB8A0] mt-4 max-w-xl text-sm">Craft guides, fit laws and buying math — written by our styling desk, every product rail linked to the live catalog.</p>
        </div>
      </div>

      {featured && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
          <Link to={`/journal/${featured.slug}`} className="group grid lg:grid-cols-2 gap-8 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[4/3] lg:aspect-auto bg-[#E9E1D4]">
              <img src={featured.image} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="eager" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#171918]/70 text-white text-[10px] font-bold tracking-widest uppercase">Featured</span>
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4 text-xs text-[#AEB8A0]">
                <span className="text-[#B7945A] font-semibold uppercase tracking-widest">{featured.category}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} min</span>
              </div>
              <h2 className="font-playfair text-2xl lg:text-4xl text-[#171918] leading-tight mb-4 group-hover:text-[#103C35] transition-colors">{featured.title}</h2>
              <p className="text-sm text-[#AEB8A0] leading-relaxed mb-6">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#103C35]">Read the story <ArrowRight size={15} /></span>
            </div>
          </Link>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pb-16">
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setCat(null)} className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${!cat ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>All</button>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c === cat ? null : c)} className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${cat === c ? 'bg-[#103C35] text-[#F6F0E6] border-[#103C35]' : 'bg-white/60 border-[#E9E1D4] text-[#171918]/80 hover:border-[#B7945A]'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((a) => (
            <Link key={a.id} to={`/journal/${a.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/10] bg-[#E9E1D4]">
                <img src={a.image} alt={a.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-[#AEB8A0] mb-2">
                  <span className="text-[#B7945A] font-bold uppercase tracking-widest">{a.category}</span>
                  <span>·</span><span>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span><span>{a.readTime} min</span>
                </div>
                <h3 className="text-base font-medium text-[#171918] leading-snug mb-2 group-hover:text-[#103C35] transition-colors">{a.title}</h3>
                <p className="text-xs text-[#AEB8A0] line-clamp-2">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
}

function ArticleView({ article, tryOnProduct, setTryOnProduct }: { article: Article; tryOnProduct: Product | null; setTryOnProduct: (p: Product | null) => void }) {
  const rail = articleRail(article);
  const related = articles.filter((a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t)))).slice(0, 3);
  return (
    <>
      <div className="min-h-screen bg-[#F6F0E6] pt-16 lg:pt-20">
        <div className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${article.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#171918]/80 to-[#171918]/75" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-xs font-semibold text-[#B7945A] uppercase tracking-widest">{article.category}</span>
              <span className="text-[#AEB8A0]">·</span>
              <span className="flex items-center gap-1 text-xs text-[#AEB8A0]"><Clock size={12} /> {article.readTime} min read</span>
              <span className="text-[#AEB8A0]">·</span>
              <span className="text-xs text-[#AEB8A0]">{new Date(article.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="font-playfair text-3xl lg:text-5xl text-white leading-tight mb-6">{article.title}</h1>
            <p className="text-[#AEB8A0] text-base">{article.excerpt}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-[#AEB8A0] hover:text-[#103C35] transition-colors mb-8">
            <ArrowRight size={16} className="rotate-180" /> Back to Journal
          </Link>
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
          <p className="text-[#171918] text-lg leading-relaxed mb-10 font-light">{article.intro}</p>
          {article.sections.map((sec, i) => (
            <section key={sec.heading}>
              <h2 className="font-playfair text-2xl text-[#171918] mt-10 mb-4">{i + 1}. {sec.heading}</h2>
              {sec.paras.map((p, j) => <p key={j} className="text-[#171918]/85 text-base leading-relaxed mb-5">{p}</p>)}
            </section>
          ))}

          <div className="bg-[#103C35] rounded-3xl p-8 my-12 text-center">
            <Sparkles size={20} className="text-[#B7945A] mx-auto mb-3" />
            <p className="font-playfair text-xl text-white mb-2">Try the story's picks on yourself</p>
            <p className="text-[#AEB8A0] text-sm mb-5">Every piece below is Try-On eligible where noted — see it on you before you shop.</p>
            <Link to="/try-on" className="inline-flex items-center gap-2 px-7 py-3 bg-[#D95E3F] text-white font-semibold rounded-full hover:bg-[#c24e31] transition-colors text-sm">
              OPEN AI TRY-ON
            </Link>
          </div>

          {rail.length > 0 && (
            <div className="mt-10">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#B7945A] uppercase mb-3">{article.rail?.title}</p>
              <p className="text-sm text-[#AEB8A0] mb-6">{article.rail?.note}</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {rail.map((p) => <ProductCard key={p.id} product={p} onTryOn={setTryOnProduct} />)}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((tag) => <span key={tag} className="px-3 py-1 bg-[#E9E1D4] text-[#103C35]/70 text-xs rounded-full">{tag}</span>)}
          </div>

          {related.length > 0 && (
            <div className="mt-16 border-t border-[#E9E1D4] pt-10">
              <h3 className="font-playfair text-2xl text-[#171918] mb-6">Keep reading</h3>
              <div className="grid gap-4">
                {related.map((a) => (
                  <Link key={a.id} to={`/journal/${a.slug}`} className="flex items-center gap-5 bg-white rounded-2xl p-4 group hover:shadow-md transition-shadow">
                    <img src={a.image} alt="" loading="lazy" className="w-20 h-16 object-cover rounded-xl" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#B7945A] mb-1">{a.category} · {a.readTime} min</p>
                      <p className="text-sm font-medium text-[#171918] leading-snug group-hover:text-[#103C35] line-clamp-2">{a.title}</p>
                    </div>
                    <ArrowRight size={16} className="text-[#AEB8A0] group-hover:text-[#D95E3F] shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      {tryOnProduct && <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </>
  );
}
