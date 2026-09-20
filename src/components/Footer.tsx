import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919644424865';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi VIRAAS, I need help finding a festive outfit.');

export default function Footer() {
  return (
    <footer className="bg-[#171918] text-[#E9E1D4]">
      {/* WhatsApp CTA */}
      <div className="bg-[#103C35] py-12 px-4">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-[#AEB8A0] text-sm tracking-widest uppercase mb-3">Need help finding a look?</p>
          <h3 className="font-playfair text-2xl lg:text-3xl text-white mb-6">
            Chat with VIRAAS
          </h3>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1fba58] transition-colors"
            onClick={() => {
              // trackEvent('whatsapp_click')
            }}
          >
            <MessageCircle size={18} />
            CHAT WITH VIRAAS
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-playfair text-2xl text-white mb-3">VIRAAS</p>
            <p className="text-[#AEB8A0] text-sm leading-relaxed mb-6">
              Rooted in Tradition.<br />Designed for Now.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#AEB8A0]/30 text-[#AEB8A0] hover:text-white hover:border-white transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#AEB8A0]/30 text-[#AEB8A0] hover:text-white hover:border-white transition-colors"
                aria-label="Pinterest"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-5">Discover</p>
            <ul className="space-y-3">
              {[
                { label: 'Women', href: '/women' },
                { label: 'Men', href: '/men' },
                { label: 'Occasions', href: '/occasions' },
                { label: 'Couple Edit', href: '/couple-edit' },
                { label: 'Trending', href: '/trending' },
                { label: 'Accessories', href: '/accessories' },
                { label: 'Journal', href: '/journal' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-[#AEB8A0] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-5">Support</p>
            <ul className="space-y-3">
              {[
                { label: 'Contact', href: '/contact' },
                { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, external: true },
                { label: 'FAQ', href: '/faq' },
                { label: 'About VIRAAS', href: '/about' },
              ].map(l => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#AEB8A0] hover:text-white transition-colors">{l.label}</a>
                  ) : (
                    <Link to={l.href} className="text-sm text-[#AEB8A0] hover:text-white transition-colors">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#B7945A] uppercase mb-5">Legal</p>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Use', href: '/terms' },
                { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
                { label: 'AI Try-On Privacy', href: '/ai-try-on-privacy' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-[#AEB8A0] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclosure + Bottom */}
        <div className="max-w-screen-xl mx-auto mt-12 pt-8 border-t border-[#AEB8A0]/10">
          <p className="text-xs text-[#AEB8A0]/60 text-center mb-4">
            VIRAAS may earn a commission when you shop through selected affiliate links. Products are curated independently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-playfair text-lg text-[#AEB8A0] italic">Wear Your Story.</p>
            <p className="text-xs text-[#AEB8A0]/40">© 2026 VIRAAS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
