'use client';
import { useEffect } from 'react';

/**
 * Browsers restore the previous scroll position on a hard reload by
 * default. That's surprising here — a reload should behave like a
 * fresh page load, landing at the top. Opting out of the browser's
 * automatic restoration is a one-line, one-time effect.
 */
export default function ScrollRestorationReset() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);
  return null;
}
