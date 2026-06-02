# AI Agent Instructions

## Next.js version

This project uses **Next.js 16.2.6** — breaking changes exist vs. older versions.
Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.
Heed deprecation notices.

## Key project constraints

- **No CSS scroll-snap.** Scroll is controlled entirely by `goTo(idx)` in `app/page.js` via GSAP. Do not add `scroll-snap-type` or native scroll behavior.
- **CSS Modules only** for all component styles. No inline style objects except for GSAP-driven dynamic values.
- **GSAP from `@/lib/gsap`** — not imported directly from `gsap`. This ensures ScrollTrigger is registered.
- **All portfolio content in `data/profile.json`** — do not hardcode names, roles, or social links in components.
- **`app/globals.css`** is the single source of truth for design tokens. CSS custom properties defined there are used across all modules.
- **`lib/siteConfig.js`** exports `SITE_URL`. Use it in metadata and JSON-LD — not hardcoded strings.
- **Three.js components** (`components/three/`) must be loaded with `dynamic(..., { ssr: false })` — they use browser APIs.
- **`PublicationsFooterSection`** is a 300 vh sticky section covering 3 scroll steps. Do not split it into separate sections without updating `TOTAL` in `page.js`.
