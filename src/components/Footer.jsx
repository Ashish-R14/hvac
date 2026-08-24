import { Container } from '../design-system/primitives';
import './Footer.css';

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/climewave_/', title: 'Instagram', col: '#e1306c', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
  { href: 'https://www.linkedin.com/company/clime-wave-engineers-llp/?viewAsMember=true', title: 'LinkedIn', col: '#0077b5', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
  { href: 'https://www.youtube.com/@ClimeWaveEngineers', title: 'YouTube', col: '#ff0000', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg> },
  { href: 'https://wa.me/919911992271', title: 'WhatsApp', col: '#25d366', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
];

const NAV_LINKS = [['#how-it-works', 'How It Works'], ['#tool', 'Free Analysis'], ['#services', 'Services'], ['#components', 'Components'], ['#projects', 'Projects'], ['#about', 'About Us']];
const SERVICES = ['Residential HVAC', 'Commercial Systems', 'Industrial Cooling', 'VRF / VRV Design', 'Central AC', 'Maintenance AMC'];
const CONTACT = [
  { icon: '📞', label: 'Call Us', val: '+91 5946-317680', href: 'tel:+915946317680' },
  { icon: '💬', label: 'WhatsApp', val: '+91 9911992271', href: 'https://wa.me/9911992271' },
  { icon: '📧', label: 'Email', val: 'info@climewaveengineers.com', href: 'mailto:info@climewaveengineers.com' },
  { icon: '📍', label: 'Location', val:"Haldwani, Ramnagar, Bahadurghar & Pan India", href: '#' },
];
const LEGAL_LINKS = ['Privacy Policy', 'Terms of Use', 'Cookie Policy'];

/**
 * Footer — Phase 6. Same 4-column layout, links, and contact details
 * as the original inline <footer>. Now self-contained (owns its own
 * social link data — previously the parent component held
 * `socialLinks` purely to hand it down here) and fully tokenized —
 * every hover state that used to be an imperative
 * onMouseEnter/onMouseLeave DOM write is now a CSS :hover rule.
 */
export default function Footer() {
  return (
    <footer className="cw-footer">
      <Container>
        <div className="cw-footer__grid">
          <div>
            <div className="cw-footer__brand">
              <img src="/logo.png" alt="Climewave" className="cw-footer__logo" />
              <div>
                <div className="cw-footer__brand-name">CLIMEWAVE</div>
                <div className="cw-footer__brand-sub">ENGINEERS</div>
              </div>
            </div>
            <p className="cw-footer__tagline">India's intelligent HVAC design platform. We calculate, visualize, and optimize your climate system before installation.</p>
            <div className="cw-footer__socials">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.title} href={s.href} target="_blank" rel="noreferrer" title={s.title} className="cw-footer__social-link" style={{ '--accent': s.col }}>
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="cw-footer__col-title">NAVIGATE</div>
            <div className="cw-footer__col-links">
              {NAV_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="cw-footer__link">{label}</a>
              ))}
            </div>
          </div>

          <div>
            <div className="cw-footer__col-title">SERVICES</div>
            <div className="cw-footer__col-links">
              {SERVICES.map((s) => (
                <a key={s} href="#services" className="cw-footer__link">{s}</a>
              ))}
            </div>
          </div>

          <div>
            <div className="cw-footer__col-title">CONTACT</div>
            <div className="cw-footer__contact-list">
              {CONTACT.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="cw-footer__contact-item">
                  <span className="cw-footer__contact-icon">{c.icon}</span>
                  <div>
                    <div className="cw-footer__contact-label">{c.label}</div>
                    <div className="cw-footer__contact-val">{c.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="cw-footer__bottom">
          <div className="cw-footer__copyright">© 2025 Climewave Engineers · Based on BEE & ASHRAE standards</div>
          <div className="cw-footer__legal">
            {LEGAL_LINKS.map((l) => (
              <a key={l} href="#" className="cw-footer__legal-link">{l}</a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
