import type { CSSProperties, ReactNode } from 'react';
import './primitives.css';

interface BadgeProps {
  children?: ReactNode;
  icon?: string;
  size?: 'md' | 'lg';
  tone?: string;
  style?: CSSProperties;
}

/**
 * Badge — pill label. Replaces the local SectionLabel component
 * (which always rendered "◆ {children}") with a generalized version;
 * SectionLabel is kept as a thin wrapper for backward compatibility
 * (see ClimewaveWebsite.jsx).
 */
export default function Badge({ children, icon = '◆', size = 'md', tone = 'blue', style = {} }: BadgeProps) {
  const toneClass = tone === 'blue' ? '' : `ds-badge--${tone}`;
  const sizeClass = size === 'lg' ? 'ds-badge--lg' : '';
  return (
    <div className={`ds-badge ${sizeClass} ${toneClass}`.trim()} style={style}>
      {icon} {children}
    </div>
  );
}
