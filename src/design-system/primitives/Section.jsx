import './primitives.css';

/**
 * Section — vertical rhythm wrapper. Same API as the previous local
 * Section (id, children, style passthrough).
 */
export default function Section({ id, children, style = {}, className = '' }) {
  return (
    <section id={id} className={`ds-section ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}
