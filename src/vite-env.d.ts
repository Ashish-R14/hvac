/// <reference types="vite/client" />

// Allow CSS custom properties (e.g. `style={{ '--accent': '#fff' }}`),
// which are used throughout the design system for per-card accent colors.
// The `export {}` makes this file a module, which is required for
// `declare module 'react'` below to be treated as an augmentation of
// the existing react module types rather than a from-scratch redefinition
// (which would wipe out all of react's real exports).
export {};
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
