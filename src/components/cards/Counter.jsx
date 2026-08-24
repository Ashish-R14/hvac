import { useState, useRef, useEffect } from 'react';

/**
 * Counter — extracted verbatim from ClimewaveWebsite.jsx (was a local,
 * unexported function). Same IntersectionObserver-triggered count-up
 * animation, same easing, same API. Used by StatCard (Phase 5).
 */
export default function Counter({ end, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const prog = Math.min((Date.now() - start) / duration, 1);
          const ease = 1 - Math.pow(1 - prog, 3);
          setVal(Math.round(end * ease));
          if (prog < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}
