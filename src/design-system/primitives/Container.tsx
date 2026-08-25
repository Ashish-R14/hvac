import type { CSSProperties, ReactNode } from 'react';
import './primitives.css';

interface ContainerProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Container — centers content and caps it at --container-max.
 * Same API as the local Container previously defined inline in
 * ClimewaveWebsite.jsx (children, style passthrough) so every
 * existing call site keeps working unmodified.
 */
export default function Container({ children, style = {}, className = '' }: ContainerProps) {
  return (
    <div className={`ds-container ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
