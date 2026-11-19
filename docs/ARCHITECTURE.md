# Interview OS — Architecture & Team Contracts

Single source of truth for architecture decisions (Team Lead owned). Alpha, client-side only, no backend, no tests yet.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Vue 3.5 + `<script setup lang="ts">` | Required; learner's own stack |
| Build | Vite 8 + `@tailwindcss/vite` | rei-kit requires Tailwind 4 |
| UI | **rei-kit 4.4** (`rei-kit`, `rei-kit/web`) + `lucide-vue-next` icons | Learner's own library; primary UI foundation |
| Routing | vue-router 5 (history mode, Vercel SPA rewrite) | rei-kit's `TabBar` peers on it |
| State | Pinia 4 setup stores | Shared progress/notes/settings across many views |
| Persistence | IndexedDB via `idb` | Structured, async, large quota; no backend |
| Markdown | `marked` + `highlight.js` (core + selected languages) | Content answers are Markdown with fenced code |
| Deploy | Vercel static (`vercel.json`) | Zero-config SPA hosting |

`vue-i18n` is installed only because rei-kit's main entry imports it statically and Vite 8 (rolldown) fails on a missing optional peer. It is not used by the app.

## Directory layout & ownership

```
src/
  main.ts                    Team Lead
  App.vue                    Frontend Architect
  app/router/                Frontend Architect
  app/layouts/               Frontend Architect (AppLayout: sidebar desktop, TabBar mobile)
  app/views/                 Frontend Architect, EXCEPT QuestionView.vue + ReviewView.vue (UX Engineer)
  components/layout/         Frontend Architect (sidebar, top bar, mobile nav, command menu)
  components/dashboard/      Frontend Architect
  components/common/         Frontend Architect (shared small pieces: TrackIcon, DifficultyBadge, StatusBadge, TypeBadge)
  components/questions/      UX Engineer (question card, prompt, hints, reveal, MCQ, self-grade, notes editor)
  components/content/        UX Engineer (MarkdownContent, CodeSnippet)
  composables/               Frontend Architect (useSearch, useFilters...), UX Engineer may add useMarkdown
  content/tracks/*.ts        Curriculum authors (one file per track)
  content/meta/              Curriculum Architect (research.ts, roadmap.ts)
  content/index.ts           Team Lead (registry + lookup helpers)
  services/storage/          Data Engineer (IndexedDB, repositories, migrations)
  services/backup/           Data Engineer (export/import/validate)
  services/progress/         Data Engineer (spaced-review scheduler, pure functions)
  stores/                    Data Engineer (Pinia: progress, notes, settings)
  styles/main.css            Team Lead (imports only)
  styles/app.css             UX Engineer (prose, hljs theme, app helpers)
  types/                     Team Lead (content.ts, progress.ts are the contracts)
```

Rule: **do not edit files you do not own.** If you need a change in someone else's file, write it in your final report and the Team Lead integrates.

## Content contract

See `src/types/content.ts`. Content is typed TS data, one default-exported `Track` per file in `src/content/tracks/`. `src/content/index.ts` exposes:

- `tracks`, `allEntries` (`{ question, track, module }` in curriculum order), `allQuestionIds`, `allTags`
- `getEntry(id)`, `getTrack(id)`, `trackQuestionIds(trackId)`, `neighbours(id)`

Question ids are permanent: progress and notes are keyed by them.

## Persistence contract (Pinia stores — implemented by Data Engineer)

Types in `src/types/progress.ts`. All stores are setup stores in `src/stores/`.

### `useProgressStore()` — `src/stores/progress.ts`
```ts
ready: Ref<boolean>                       // true after init() loaded IndexedDB
error: Ref<string | null>                 // last persistence error (UI shows BaseAlert)
records: Ref<Record<string, ProgressRecord>>
activity: Ref<Record<string, ActivityDay>> // keyed by YYYY-MM-DD
init(): Promise<void>                     // idempotent; called once in App.vue
get(id): ProgressRecord                   // returns a default 'new' record if none stored (not persisted)
statusOf(id): ProgressStatus
setStatus(id, status): Promise<void>
revealHint(id, index): Promise<void>      // hintsRevealed = max(current, index)
revealAnswer(id): Promise<void>
toggleBookmark(id): Promise<void>
grade(id, grade: ReviewGrade): Promise<void> // SM-2-lite; updates status/interval/nextReviewAt/attempts/confidence + activity
resetQuestion(id): Promise<void>
dueIds: ComputedRef<string[]>             // ids with nextReviewAt <= now, oldest first (only ids that exist in content)
bookmarkedIds: ComputedRef<string[]>
counts: ComputedRef<Record<ProgressStatus, number>> // over all content ids (missing = 'new')
trackStats(trackId): { total: number; mastered: number; started: number; percent: number }
streak: ComputedRef<number>               // consecutive days with reviewed > 0 ending today/yesterday
todayCount: ComputedRef<number>           // reviewed today
```

### `useNotesStore()` — `src/stores/notes.ts`
```ts
ready, error
notes: Ref<Record<string, Note>>
init(): Promise<void>
get(id): Note | undefined
save(id, body: string): Promise<void>     // empty body => remove
remove(id): Promise<void>
sorted: ComputedRef<Note[]>               // updatedAt desc
```

### `useSettingsStore()` — `src/stores/settings.ts`
```ts
ready, error
settings: Ref<AppSettings>
init(): Promise<void>
update(patch: Partial<AppSettings>): Promise<void>
```
Theme / material / palette are NOT in this store: use rei-kit's `useTheme()`, `useMaterial()`, `usePalette()` (persisted to localStorage under `ios-*` keys, configured in `main.ts`).

### Backup service — `src/services/backup/index.ts`
```ts
createBackup(): Promise<BackupFile>
downloadBackup(): Promise<void>                    // uses rei-kit downloadJson; updates settings.lastBackupAt
parseBackup(text: string): { ok: true; data: BackupFile; summary: { progress: number; notes: number } } | { ok: false; error: string }
restoreBackup(data: BackupFile, mode: RestoreMode): Promise<void>  // then stores re-init
resetAllData(): Promise<void>
```

## Routes (Frontend Architect)

| Path | View | Notes |
| --- | --- | --- |
| `/` | DashboardView | today's goal, streak, due count, continue, track progress, activity |
| `/roadmap` | RoadmapView | phases → tracks with progress |
| `/tracks/:trackId` | TrackView | modules → question list |
| `/q/:questionId` | QuestionView | **UX Engineer** — the core learning surface |
| `/review` | ReviewView | **UX Engineer** — due queue session; also `?mode=bookmarks` / `?track=` |
| `/library` | LibraryView | search + filters over all questions |
| `/notes` | NotesView | all notes |
| `/settings` | SettingsView | appearance, goal, backup/restore, reset |
| `/about` | AboutView | research methodology, interview stages, company types, sources |
| `*` | NotFoundView | |

## UI conventions

- Use rei-kit components wherever one fits (see `docs/REI-KIT.md`). Use its color roles as Tailwind utilities: `text-ink`, `text-ink-soft`, `bg-surface`, `bg-muted`, `border-hair`, `text-primary`, `bg-primary text-on-primary`, `text-positive`, `text-negative`, `text-warning`; surfaces: `surface`, `surface-raised`, `rounded-card`, `focus-ring`. **No hex colors in components.**
- Every rei-kit visible string is a required prop (labels, close-label, etc.) — pass English strings.
- Mobile-first. Breakpoint `lg` (1024px) switches mobile tab bar → desktop sidebar.
- Icons: `lucide-vue-next`, size via `class="size-4"`.
- `<script setup lang="ts">`, strict TS, no `any`.
