import type { CSSProperties, ReactNode } from 'react';
import './primitives.css';

interface SectionProps {
  id?: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Section — vertical rhythm wrapper. Same API as the previous local
 * Section (id, children, style passthrough).
 */
export default function Section({ id, children, style = {}, className = '' }: SectionProps) {
  return (
    <section id={id} className={`ds-section ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}
