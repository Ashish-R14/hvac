import { GlassCard } from '../../design-system/primitives';
import useTilt from '../../hooks/useTilt.js';
import './cards.css';

interface ProjectCardProps {
  tag: string;
  title: string;
  area: string;
  system: string;
  saving: string;
  desc: string;
}

/**
 * ProjectCard — same props/content/SVG diagram as the original
 * (tag, title, area, system, saving, desc). The original always used
 * cyan for the hover glow/border regardless of project, so no
 * --accent override is passed here — the CSS default (--cyan-500)
 * matches that exactly.
 */
export default function ProjectCard({ tag, title, area, system, saving, desc }: ProjectCardProps) {
  const tilt = useTilt(4);
  return (
    <GlassCard
      ref={tilt.ref}
      interactive
      className="ds-glass-card--tilt cw-project-card"
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      <div className="cw-project-card__cover">
        <svg width="100%" height="100%" viewBox="0 0 340 140" style={{ position: 'absolute', inset: 0 }}>
          <line x1="0" y1="70" x2="340" y2="70" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="6 4" />
          <line x1="170" y1="0" x2="170" y2="140" stroke="#00d4ff" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 4" />
          <circle cx="170" cy="70" r="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="170" cy="70" r="6" fill="#00d4ff" opacity="0.6" />
          <circle cx="80" cy="70" r="4" fill="#00d4ff" opacity="0.3" />
          <circle cx="260" cy="70" r="4" fill="#00d4ff" opacity="0.3" />
        </svg>
        <div className="cw-project-card__tag">{tag}</div>
      </div>
      <div className="cw-project-card__body">
        <div className="cw-card__title">{title}</div>
        <div className="cw-card__desc">{desc}</div>
        <div className="cw-project-card__stats">
          {[['Area', area], ['System', system], ['Saving', saving]].map(([lbl, val]) => (
            <div key={lbl} className="cw-project-card__stat">
              <div className="cw-project-card__stat-label">{lbl}</div>
              <div className="cw-project-card__stat-value">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
