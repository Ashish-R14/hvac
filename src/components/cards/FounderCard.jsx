import { useState } from 'react';
import { GlassCard } from '../../design-system/primitives';
import useTilt from '../../hooks/useTilt.js';
import './cards.css';
import './founder-card.css';

const SOCIAL_ICONS = {
  linkedin: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  email: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,12 2,6" /></svg>,
};

const ACCENTS = ['#00d4ff', '#00e5a0', '#ffb800'];

/**
 * FounderCard — Phase 6, extended with a `variant` prop for the
 * leadership hierarchy layout (Founder spotlight above COO/CFO).
 * Same content/image-fallback/social-link logic regardless of
 * variant — only presentation differs, via one modifier class and a
 * stronger tilt angle, so there's a single card implementation for
 * both roles rather than a duplicate "FounderHeroCard" component.
 */
export default function FounderCard({ founder, index, variant = 'executive' }) {
  const [imgErr, setImgErr] = useState(false);
  const isFounder = variant === 'founder';
  const tilt = useTilt(isFounder ? 6 : 4);
  const col = ACCENTS[index % ACCENTS.length];

  return (
    <GlassCard
      ref={tilt.ref}
      interactive
      strong={isFounder}
      className={`ds-glass-card--tilt ds-glass-card--accent cw-founder-card ${isFounder ? 'cw-founder-card--founder' : ''}`}
      style={{ '--accent': col }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="cw-founder-card__media">
        {!imgErr ? (
          <img
            src={founder.img}
            alt={founder.name}
            onError={() => setImgErr(true)}
            className="cw-founder-card__img"
          />
        ) : (
          <div className="cw-founder-card__media-fallback">
            <div className="cw-founder-card__initial">{founder.name.charAt(0)}</div>
          </div>
        )}
        <div className="cw-founder-card__media-fade" />
        <div className="cw-founder-card__exp">{founder.exp} exp</div>
      </div>
      <div className="cw-founder-card__body">
        <div className="cw-founder-card__name">{founder.name}</div>
        <div className="cw-founder-card__role">{founder.role}</div>
        <div className="cw-founder-card__tag">{founder.tag}</div>
        <p className="cw-card__desc">{founder.bio}</p>
        <div className="cw-founder-card__badges">
          {founder.badges.map((badge) => (
            <div key={badge} className="cw-founder-card__badge">{badge}</div>
          ))}
        </div>
        <div className="cw-founder-card__socials">
          <a href={founder.links.linkedin} target="_blank" rel="noreferrer" className="cw-founder-card__social-link">
            {SOCIAL_ICONS.linkedin}LinkedIn
          </a>
          <a href={`mailto:${founder.links.email}`} target="_blank" rel="noreferrer" className="cw-founder-card__social-link">
            {SOCIAL_ICONS.email}Email
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
