import './primitives.css';

/**
 * Heading — tokenized heading scale. `as` controls the rendered tag
 * independently of the visual `size`, so h1/h2 semantics stay correct
 * for SEO/accessibility regardless of how large a heading looks.
 */
export default function Heading({ as = 'h2', size = 'section', children, style = {}, className = '' }) {
  const Tag = as;
  const sizeClass = { hero: 'ds-heading--hero', section: 'ds-heading--section', sub: 'ds-heading--sub' }[size] || '';
  return (
    <Tag className={`ds-heading ${sizeClass} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
