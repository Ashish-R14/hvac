import { forwardRef } from 'react';
import './primitives.css';

/**
 * GlassCard — the tokenized glass-panel surface used for the navbar,
 * mobile menu sheet, and (Phase 5) service/project/component cards.
 * `interactive` adds hover lift + glow; `strong` uses the denser
 * glass-bg-strong background for panels that sit over busy content
 * (e.g. the mobile nav overlay).
 *
 * Wrapped in forwardRef so Phase 5's useTilt hook (which needs a DOM
 * node reference for getBoundingClientRect/pointer math) can attach
 * directly to it — existing call sites that don't pass a ref are
 * unaffected.
 */
const GlassCard = forwardRef(function GlassCard({
  as: Tag = 'div',
  interactive = false,
  strong = false,
  className = '',
  style = {},
  children,
  ...rest
}, ref) {
  const classes = [
    'ds-glass-card',
    interactive ? 'ds-glass-card--interactive' : '',
    strong ? 'ds-glass-card--strong' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
});

export default GlassCard;
