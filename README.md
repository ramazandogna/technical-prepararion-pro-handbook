# Interview OS

**Personalized Software Engineering Interview Preparation** — a long-term, offline-capable learning environment for a
mid-level Full-Stack Product Software Engineer preparing for technical interviews in Tokyo and internationally.

> Status: **Alpha** (`0.1.0-alpha`). Fully client-side. No account, no backend — your progress lives in your browser
> (IndexedDB) and can be exported as a JSON backup at any time.

Built with **Vue 3 + TypeScript + Vite**, on **[rei-kit](https://www.npmjs.com/package/rei-kit)** as the UI foundation.

## What it does

- **Curriculum roadmap** — 233 questions in 20 tracks (A–T) across 4 phases: interview process, DSA, JavaScript, TypeScript, frontend,
  React, Vue, Next.js, backend/NestJS, databases, OS, networking, computer architecture, compilers, system design,
  DevOps, security, testing, behavioral/project deep dives and the Tokyo job market.
- **Active-recall question pages** — attempt first, then progressive hints, then the hidden model answer with key
  points, pitfalls, follow-ups and a *personal angle* tying the topic to your own experience.
- **Question types** — concept, trade-off, output prediction, debugging, coding, multiple choice, system design,
  behavioral and project deep dive.
- **Spaced review** — self-grade (Again / Hard / Good / Easy) schedules each question; the review queue shows what is due.
- **Notes** per question with autosave, plus a notes index.
- **Search & filters** — by track, type, difficulty, priority, status, bookmarks and notes; ⌘K / Ctrl+K command menu.
- **Dashboard** — daily goal, streak, due count, per-track progress and activity history.
- **Backup / restore** — export everything to JSON; import with merge or replace; reset.
- **Appearance** — rei-kit's 4 materials × 10 palettes × light/dark.
- **Research notes** — methodology, interview stages, company types and sources (About page).

## Quick start

Requirements: Node.js **22.18+** (or 24.12+), npm.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (vue-tsc) + production build to dist/
npm run preview    # serve the production build
```

## Deploy (Vercel)

1. Push the repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository. Framework preset **Vite** is detected;
   `vercel.json` already sets build command `npm run build`, output `dist` and the SPA rewrite.
3. Every push to a branch gets a preview URL; the default branch deploys to production. No environment variables.

Details: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Your data

All progress, notes and settings are stored locally in IndexedDB for the site's origin. Clearing site data, using a
private window, or switching between preview URLs means different/empty data — **export a backup regularly**
(Settings → Data). See [docs/DATA.md](docs/DATA.md).

## Project structure

```
src/
  app/            router, layouts, views (pages)
  components/     layout, dashboard, questions, content (markdown/code), common
  content/        curriculum data — tracks/*.ts (one per track), meta/ (roadmap, research)
  services/       storage (IndexedDB), backup, progress (spaced-review scheduler)
  stores/         Pinia stores: progress, notes, settings
  composables/    search/filter and other reusable logic
  types/          content + persistence contracts
  styles/         Tailwind + rei-kit wiring, app styles
docs/             architecture, UX, data, deployment, content guide, rei-kit notes
```

## Adding content

Each track is a typed file in `src/content/tracks/`. Follow [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) and the
`Question` type in `src/types/content.ts`. **Never rename a question `id`** — progress and notes are keyed by it.

## Documentation

- [Architecture & contracts](docs/ARCHITECTURE.md)
- [UX specification](docs/UX.md)
- [Data & persistence](docs/DATA.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Content guide](docs/CONTENT_GUIDE.md) · [Learner profile](docs/LEARNER_PROFILE.md)
- [rei-kit integration](docs/REI-KIT.md)

## Alpha scope & roadmap

In scope now: curriculum, learning flow, persistence, review, search, backup, deployment. Deliberately **not** in
Alpha: automated tests, accounts/sync, backend, AI features. Next candidates: test suite (Vitest + Playwright),
optional cloud sync, mock-interview timer mode, content expansion, PWA offline install.

## Known Alpha caveats

- Research source links in `src/content/meta/research.ts` were gathered partly from search summaries and could not all be
  opened from the build environment — spot-check them (especially company career pages) before relying on them.
- Content is a first pass by the curriculum team: review answers against your own understanding and refine over time.
- Two question-row components exist (`common/QuestionRow` for lists, `questions/QuestionListItem`); consolidate later.

## License

Content and code © the author. rei-kit is MIT.
