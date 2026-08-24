import { GlassCard } from '../../design-system/primitives';
import useTilt from '../../hooks/useTilt.js';
import './cards.css';

/**
 * ServiceCard — same props/content as the original inline version
 * (icon, title, desc, features, accent). Previously managed its own
 * `hov` boolean + a fully recomputed inline style object per render;
 * now the hover state lives entirely in CSS (ds-glass-card--interactive
 * + --accent color-mix rules) and the only JS-driven motion is the
 * pointer-follow 3D tilt from useTilt.
 */
export default function ServiceCard({ icon, title, desc, features, accent }) {
  const tilt = useTilt(5);
  return (
    <GlassCard
      ref={tilt.ref}
      interactive
      className="ds-glass-card--tilt ds-glass-card--accent cw-card cw-service-card"
      style={{ '--accent': accent }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="cw-card__icon">{icon}</div>
      <div className="cw-card__title">{title}</div>
      <div className="cw-card__desc">{desc}</div>
      <div className="cw-card__list">
        {features.map((f, i) => (
          <div key={i} className="cw-card__list-item">
            <span className="cw-card__dot" />{f}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
