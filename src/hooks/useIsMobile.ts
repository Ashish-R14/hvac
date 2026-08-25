import { useState, useEffect } from 'react';

/**
 * useIsMobile — extracted from ClimewaveWebsite.jsx (was a local,
 * unexported function redefined-in-place). Same 768px threshold as
 * --breakpoint-md in tokens.css. Shared by ClimewaveWebsite, Navbar,
 * and Hero so the breakpoint logic exists in exactly one place.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
}
