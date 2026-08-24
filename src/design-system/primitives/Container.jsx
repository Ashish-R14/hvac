import './primitives.css';

/**
 * Container — centers content and caps it at --container-max.
 * Same API as the local Container previously defined inline in
 * ClimewaveWebsite.jsx (children, style passthrough) so every
 * existing call site keeps working unmodified.
 */
export default function Container({ children, style = {}, className = '' }) {
  return (
    <div className={`ds-container ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
