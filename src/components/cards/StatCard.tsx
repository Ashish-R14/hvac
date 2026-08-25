import { GlassCard } from '../../design-system/primitives';
import Counter from './Counter';
import './cards.css';

interface StatCardProps {
  val: number;
  suffix?: string;
  label: string;
  col: string;
}

/**
 * StatCard — extracted from the inline `<div className="stat-card">`
 * markup in the Stats section (ClimewaveWebsite.jsx). Same counter
 * animation, same per-stat color, same layout — now glass + tokenized
 * instead of a hand-written style object with a hardcoded background/
 * border. No tilt here (a static row of numbers doesn't benefit from
 * pointer-tilt the way a content card does) — just the glass hover
 * lift, consistent with the rest of the Phase 5 card family.
 */
export default function StatCard({ val, suffix, label, col }: StatCardProps) {
  return (
    <GlassCard interactive className="ds-glass-card--accent cw-stat-card" style={{ '--accent': col }}>
      <div className="cw-stat-card__value"><Counter end={val} suffix={suffix} /></div>
      <div className="cw-stat-card__label">{label}</div>
    </GlassCard>
  );
}
