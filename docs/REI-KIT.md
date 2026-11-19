# REI-KIT Integration Notes

Interview OS uses [rei-kit](https://www.npmjs.com/package/rei-kit) **4.4.x** as its primary UI foundation. This file
records how it was integrated and why, based on the published package (README, `dist/**/*.d.ts`, `package.json`) —
not on assumptions.

## Setup

| Step | Where |
| --- | --- |
| Tailwind 4 via `@tailwindcss/vite` | `vite.config.ts` |
| `@import 'tailwindcss'; @import 'rei-kit/web.css';` (wide-site preset: tokens, web shell, materials, palettes, motion, component styles, `@source`) | `src/styles/main.css` |
| Measures: `--measure-page: 1200px`, `--measure-reading: 72ch` | `src/styles/main.css` `@theme` |
| Storage keys namespaced: `setThemeStorageKey('ios-theme')`, `setMaterialStorageKey('ios-material')`, `setPaletteStorageKey('ios-palette')` | `src/main.ts` |
| Pre-paint theme script (avoids a light flash; reads the same keys) | `index.html` |
| Default palette `tokyo-night` on first visit (user can switch any of the 10 palettes, 4 materials, light/dark/system) | `src/main.ts`, Settings |
| `body.canvas` so the `glass` material has a backdrop | `index.html` |

Peers installed by the app: `vue`, `tailwindcss`, `lucide-vue-next` (icons), `vue-router` (used by `TabBar`),
and **`vue-i18n`** — not used by Interview OS, but rei-kit's main entry imports `createI18n` statically and Vite 8
(rolldown) fails the build with `MISSING_EXPORT` when that optional peer is absent. Worth reporting upstream:
the i18n runtime could move to its own entry like `rei-kit/supabase`.

## Entry points used

- `rei-kit` — buttons, cards, badges/chips, fields, progress, stats, empty states, alerts, toasts, settings rows,
  code block, segmented control, activity grid, file drop, tab bar.
- `rei-kit/web` — `NavLinks`, `CommandMenu` (⌘K), `ResponsiveDialog`, `BaseBreadcrumb`, `BaseAccordion`,
  `BaseDisclosure`, `BaseTooltip`, `SkipLink`.

Not used: `rei-kit/app` (phone-shell/auth parts), `rei-kit/pwa`, `rei-kit/supabase` — no auth or install flow in Alpha.

## Local components (and why)

rei-kit deliberately ships no copy, icons, Markdown or syntax highlighting. Interview OS adds, locally:

- `MarkdownContent` — `marked` + `highlight.js`; highlight colors come from rei-kit role variables so every palette/mode works.
- `CodeSnippet` — wraps rei-kit `CodeBlock`, feeding it highlighted markup.
- Learning-specific pieces (hint ladder, answer reveal, self-grading, MCQ) composed from rei-kit primitives.

Conventions: color only through rei-kit role utilities (`text-ink`, `bg-surface`, `border-hair`, `text-primary`, …),
surfaces through `surface*` / `rounded-card`, focus through `focus-ring`. No hex values in components, mirroring the
kit's own rule.
