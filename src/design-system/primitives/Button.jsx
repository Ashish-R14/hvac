import { useRef } from 'react';
import './primitives.css';

/**
 * Button — the single source of truth for every button/CTA-link
 * style in the app (previously reimplemented inline ~15 times across
 * ClimewaveWebsite.jsx: gradient CTA, glass CTA, ghost link, hamburger,
 * mobile-menu items all duplicated the same box-shadow/radius/font
 * declarations by hand).
 *
 * Renders an <a> when `href` is passed, otherwise a <button>.
 *
 * `magnetic` enables a subtle pointer-follow effect (Phase 3 navbar
 * requirement): the button translates a few px toward the cursor on
 * hover and springs back on leave. Implemented via CSS custom
 * properties (--mx/--my) so the actual transform lives in CSS and
 * respects prefers-reduced-motion automatically.
 */
export default function Button({
  as,
  href,
  variant = 'primary',   // primary | glass | ghost
  size = 'md',            // md | lg
  magnetic = false,
  className = '',
  style = {},
  children,
  onClick,
  ...rest
}) {
  const ref = useRef(null);
  const reduceMotion = typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMove = (e) => {
    if (!magnetic || reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const pull = 0.25; // fraction of offset the button travels
    ref.current.style.setProperty('--mx', (relX * pull).toFixed(1));
    ref.current.style.setProperty('--my', (relY * pull).toFixed(1));
  };
  const handleLeave = () => {
    if (!magnetic || !ref.current) return;
    ref.current.style.setProperty('--mx', 0);
    ref.current.style.setProperty('--my', 0);
  };

  const classes = [
    'ds-btn',
    `ds-btn--${variant}`,
    `ds-btn--${size}`,
    magnetic ? 'ds-btn--magnetic' : '',
    className,
  ].filter(Boolean).join(' ');

  const Tag = as || (href ? 'a' : 'button');
  const motionProps = magnetic ? { onPointerMove: handleMove, onPointerLeave: handleLeave } : {};

  return (
    <Tag
      ref={ref}
      href={href}
      className={classes}
      style={style}
      onClick={onClick}
      {...motionProps}
      {...rest}
    >
      {children}
    </Tag>
  );
}
