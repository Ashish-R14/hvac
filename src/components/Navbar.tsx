import { useState, useEffect } from 'react';
import useIsMobile from '../hooks/useIsMobile.js';
import { Container, Button, GlassCard } from '../design-system/primitives';
import { CLOUDINARY_IMAGES } from '../cloudinaryImages';
import './Navbar.css';

const NAV_LINKS = [
  ['#how-it-works', 'How It Works'],
  ['#tool', 'Free Analysis'],
  ['#services', 'Services'],
  ['#components', 'Components'],
  ['#projects', 'Projects'],
  ['#about', 'About Us'],
];

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/climewave_/', title: 'Instagram', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { href: 'https://www.linkedin.com/company/clime-wave-engineers-llp/?viewAsMember=true', title: 'LinkedIn', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { href: 'https://www.youtube.com/@ClimeWaveEngineers', title: 'YouTube', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
  { href: 'https://wa.me/919911992271', title: 'WhatsApp', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
];

/**
 * Navbar — Phase 3.
 *
 * Same links, same anchors, same logo, same CTA destination, same
 * mobile-menu behavior as the markup it replaces in
 * ClimewaveWebsite.jsx — only the presentation layer changed:
 *   - Floating: detaches from the viewport edge with a top margin
 *     and rounded corners once the page scrolls.
 *   - Adaptive transparency: fully transparent, no border, no blur
 *     at the top of the page; glass (blur + border + shadow) once
 *     scrolled — same threshold (40px) as the original.
 *   - Magnetic CTA: the "Get Consultation" button pulls toward the
 *     cursor on hover (desktop only, via Button's `magnetic` prop).
 *   - Every color/spacing/radius/timing value is a design token —
 *     zero hardcoded hex codes or px magic numbers in Navbar.css.
 */
export default function Navbar() {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`cw-navbar ${scrolled ? 'cw-navbar--scrolled' : ''}`}>
        <Container>
          <div className="cw-navbar__inner">
            <a href="#" className="cw-navbar__brand" aria-label="Climewave Engineers — home">
              <img src={CLOUDINARY_IMAGES.logo} alt="Climewave Engineers" className="cw-navbar__logo" />
              <div>
                <div className="cw-navbar__brand-name">CLIMEWAVE</div>
                <div className="cw-navbar__brand-sub">ENGINEERS</div>
              </div>
            </a>

            {!isMobile && (
              <div className="cw-navbar__links" role="navigation" aria-label="Primary">
                {NAV_LINKS.map(([href, label]) => (
                  <a key={href} href={href} className="cw-navbar__link">{label}</a>
                ))}
              </div>
            )}

            {!isMobile && (
              <Button href="#contact" variant="primary" size="md" magnetic>
                Get Consultation
              </Button>
            )}

            {isMobile && (
              <button
                className="cw-navbar__hamburger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="cw-mobile-menu"
              >
                <span className={menuOpen ? 'is-open' : ''} />
                <span className={menuOpen ? 'is-open' : ''} />
                <span className={menuOpen ? 'is-open' : ''} />
              </button>
            )}
          </div>
        </Container>
      </nav>

      {menuOpen && (
        <div id="cw-mobile-menu" className="cw-mobile-menu" role="dialog" aria-modal="true">
          <GlassCard strong className="cw-mobile-menu__sheet">
            <button
              onClick={() => setMenuOpen(false)}
              className="cw-mobile-menu__close"
              aria-label="Close menu"
            >
              ✕
            </button>
            {NAV_LINKS.concat([['#contact', 'Get Consultation']]).map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="cw-mobile-menu__link">
                {label}
              </a>
            ))}
            <div className="cw-mobile-menu__social">
              {SOCIAL_LINKS.slice(0, 3).map((s) => (
                <a key={s.title} href={s.href} target="_blank" rel="noreferrer" title={s.title} className="cw-mobile-menu__social-link">
                  {s.svg}
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
