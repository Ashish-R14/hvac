import { useRef, useCallback } from 'react';

/**
 * useTilt — shared 3D hover-tilt behavior for card components
 * (ServiceCard, ProjectCard, ComponentCard, SmallComponentCard).
 * Previously each card managed its own `hov` boolean state and
 * recomputed a full inline style object on every render just to
 * toggle a border color; this replaces that pattern with a single
 * imperative pointer handler that writes CSS custom properties
 * (--rx/--ry, degrees) directly to the element, read by the card's
 * `transform` in CSS. No re-renders, no duplicated hover-state logic
 * across four components.
 *
 * `strength` caps the max rotation in degrees. Disabled entirely
 * under prefers-reduced-motion.
 */
export default function useTilt(strength = 6) {
  const ref = useRef(null);
  const reduceMotion = typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onPointerMove = useCallback((e) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;  // 0..1
    const ry = (px - 0.5) * strength * 2;  // rotateY driven by x
    const rx = (0.5 - py) * strength * 2;  // rotateX driven by y
    ref.current.style.setProperty('--rx', rx.toFixed(2));
    ref.current.style.setProperty('--ry', ry.toFixed(2));
  }, [reduceMotion, strength]);
  const onPointerLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--rx', 0);
    ref.current.style.setProperty('--ry', 0);
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
