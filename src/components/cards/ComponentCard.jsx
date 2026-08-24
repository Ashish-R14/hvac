import { useState } from 'react';
import { GlassCard } from '../../design-system/primitives';
import useTilt from '../../hooks/useTilt.js';
import './cards.css';

const IMAGES = { CHILLER: '/chiller.jpg', AHU: '/ahu.jpg', FCU: '/fcu.jpg', 'VRF/VRV': '/vrf.jpg', CT: '/ct.jpg', VHU: '/vhu.jpg' };

/**
 * ComponentCard — same props/content/image-fallback logic as the
 * original (code, icon, title, full, desc, specs, col, tags). The
 * `imgErr` state (onError fallback to the icon tile) is preserved
 * exactly; only the hover/tilt/glow mechanics moved to CSS + useTilt.
 */
export default function ComponentCard({ code, icon, title, full, desc, specs, col, tags }) {
  const [imgErr, setImgErr] = useState(false);
  const tilt = useTilt(5);
  const imgSrc = IMAGES[code];

  return (
    <GlassCard
      ref={tilt.ref}
      interactive
      className="ds-glass-card--tilt ds-glass-card--accent cw-component-card"
      style={{ '--accent': col }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="cw-component-card__media">
        {imgSrc && !imgErr ? (
          <img src={imgSrc} alt={title} onError={() => setImgErr(true)} className="cw-component-card__img" />
        ) : (
          <div className="cw-component-card__media-fallback">{icon}</div>
        )}
        <div className="cw-component-card__media-fade" />
        <div className="cw-component-card__code">{code}</div>
        <div className="cw-component-card__icon-corner">{icon}</div>
      </div>
      <div className="cw-component-card__body">
        <div className="cw-card__title">{title}</div>
        <div className="cw-component-card__full">{full}</div>
        <div className="cw-card__desc">{desc}</div>
        <div className="cw-card__list">
          {specs.map((s, i) => (
            <div key={i} className="cw-card__list-item">
              <span className="cw-card__dot" />{s}
            </div>
          ))}
        </div>
        <div className="cw-component-card__tags">
          {tags.map((tag) => <div key={tag} className="cw-component-card__tag">{tag}</div>)}
        </div>
      </div>
    </GlassCard>
  );
}
