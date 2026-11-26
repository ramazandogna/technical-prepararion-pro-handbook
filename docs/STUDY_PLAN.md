# Study Plan — daily sessions by role

Source of truth: `src/content/meta/plans.ts` (`rolePlans`). Contract: `src/types/session.ts`.
Learner: see `LEARNER_PROFILE.md` (~2.5–3 yrs full-stack, Tokyo, targeting 2–4-year roles).

## The panel

| Seat | Lens |
| --- | --- |
| Senior interview coach | Session rhythm, warm-up → peak → cool-down, talking out loud |
| Technical recruiter (Tokyo + international) | What 2026 Tokyo/international loops actually ask; behavioral and Japan context |
| Senior full-stack engineer | Technical balance: React + Vue, Node/NestJS/Bun, data, AI-era work |
| Engineering team lead | Levelling signal: architecture, quality, production ownership |

## How a session is built

- One press of **Start** = one session of ~75–110 min and 7–10 questions.
- A plan is an ordered list of **slots**. Each slot draws the next unfinished questions that match its filters
  (`trackIds` + optional `types` / `difficulty` / `priority` / `tags`).
- **Every session opens with algorithms**: an easy mapping warm-up (`cs-fundamentals`, `coding`, `foundation`),
  then medium pattern problems (`coding`/`debugging`, `core`/`advanced`). Algorithm count is set by role:
  frontend 2, full-stack 2, backend 3, software-engineer 4, PM 1 (light).
- After the algorithms, the order runs **hands-on → theory → AI → architecture → quality → story**: solve while
  you are still in coding mode, talk once you are warmed up, finish with a story as the cool-down.
- Each slot pool holds ≥8 questions, so a plan runs for weeks without repeating. The only exceptions are pools
  that still depend on content being written (warm-ups, `ai-engineering`).

## Per-role plans

| Role | Status | Min | Slots (count) |
| --- | --- | --- | --- |
| Full-stack | active | 105 | algo-warm-up 1 · algo-core 1 · hands-on-code 1 · frontend-depth 1 · backend-depth 1 · ai-era 1 · architecture 1 · quality-security 1 · story 1 (= 9) |
| Frontend | active | 100 | algo-warm-up 1 · algo-core 1 · js-hands-on 1 · framework-debug 1 · framework-concepts 2 · web-platform 1 · fe-architecture 1 · ai-era 1 · quality-security 1 (= 10) |
| Backend | coming-soon | 105 | algo-warm-up 1 · algo-core 2 · runtime-api 2 · data 1 · prod-debug 1 · architecture 1 · infra-security 1 (= 9) |
| Software Engineer | coming-soon | 110 | algo-warm-up 2 · algo-core 2 · cs-theory 2 · language-depth 1 · architecture 1 · story 1 (= 9) |
| PM | coming-soon | 80 | algo-warm-up 1 · system-literacy 2 · design-walkthrough 1 · product-tradeoffs 1 · ai-products 1 · delivery-quality 1 · story 2 (= 9) |

What changed from the user's full-stack draft ("2 hard topics, 1 simple algorithm, 2 theory, 1 architecture"):

- The simple algorithm stays as the opener, and one **medium pattern problem** is added, since mid-level loops still run one.
- The "2 hard topics" become one **hands-on build/debug** slot across JS/TS, React, Vue, Node and SQL. It is closer to real
  practical rounds and shares the problem-solving time with the algorithm.
- The "2 theory" slots become **frontend depth** (React/Vue/Next) and **backend depth** (Node/NestJS/DB/caching), so both halves
  are covered every day.
- New daily slots: **AI-era**, **quality/security/ops** and a closing **story** (behavioral or Japan context).

## Full-stack follow-up map (8 weeks)

The daily plan stays the same every day. Each week, use it with the emphasis below, and in review spend extra time on that week's track.

| Week | Emphasis | Exit check |
| --- | --- | --- |
| 1 | Problem-solving habit: warm-ups, hashing, two pointers, sliding window; JS event loop and closures | Solve a warm-up in under 12 min while talking through it |
| 2 | React depth (hooks, effects, rendering, RSC) + TypeScript narrowing and generics | Explain stale closures and fix one without notes |
| 3 | Vue depth (reactivity, composables, Pinia, Nuxt SSR) + React vs Vue comparison | Defend React-vs-Vue for a given product in 3 minutes |
| 4 | Node 24 / Bun runtime, NestJS lifecycle and DI, HTTP/API design, auth | Walk through a NestJS request from middleware to the response |
| 5 | Databases: indexes, transactions, N+1, Redis caching; first full design prompt | Read an EXPLAIN plan; design a URL shortener in 35 min |
| 6 | AI-era: streaming LLM UI, RAG basics, evals, cost and latency, AI-assisted development | Design a "chat with your docs" feature end to end |
| 7 | Architecture + production: queues, rate limiting, CI/CD, Docker, observability, security | Lead a 45-min design that includes failure modes and rollout |
| 8 | Mock loops: run sessions as timed mocks; polish the story bank and the Tokyo recruiter pitch | Two full mock sessions with no hints; a 90-second pitch in EN (and a short 自己紹介) |

## Content gaps (missing for 2026 full-stack / FE interviews)

Questions the current tracks lack, roughly by priority:

1. **FE machine-coding round**: build an accessible autocomplete/typeahead (debounce, keyboard nav, abort) in React *and* Vue.
2. **JS polyfill classics**: implement `Promise.all`, an EventEmitter, `deepClone`, `curry`/`memoize`.
3. **Server-state caching**: TanStack Query / Vue Query (stale-while-revalidate, invalidation, optimistic updates and rollback).
4. **React 19 forms and actions**: `useActionState`, `useOptimistic`, form actions vs client fetch.
5. **Nuxt data fetching**: `useFetch` vs `useAsyncData` vs `$fetch`, payload/hydration, and when to use Nitro server routes.
6. **Zero-downtime DB migrations** (expand/contract) with Prisma or Drizzle; Prisma vs Drizzle trade-off.
7. **Background jobs in Node**: BullMQ idempotency, retries/backoff, dead-letter queues, graceful shutdown.
8. **API styles**: REST vs GraphQL vs tRPC, plus OpenAPI contracts and end-to-end typing. GraphQL is missing entirely.
9. **Webhooks and payments**: verifying signatures, idempotent handlers, out-of-order events (Stripe-style).
10. **Multi-tenant SaaS isolation**: Postgres row-level security (Supabase RLS) vs app-level tenant checks.
11. **Japanese-market frontend**: IME composition events in search inputs, `Intl` dates/currency, JST time zones, i18n.
12. **File uploads**: presigned S3 URLs, chunked/resumable uploads, validation and virus-scan pipeline.
13. **Frontend observability**: Sentry, source maps, RUM vs lab Web Vitals, error budgets for the UI.
14. **Build tooling**: how Vite dev/build works (esbuild/Rollup → Rolldown), HMR, code splitting, monorepos (pnpm workspaces, Turborepo).
15. **SQL live-coding**: only 2 SQL coding questions so far; add aggregations, gaps-and-islands, and an upsert.
16. **Design patterns in TS**: SOLID, strategy/adapter/repository in NestJS, a common topic at Japan-international companies.
17. **Feature flags and A/B testing**: rollout, kill switches, flag debt.
18. **Advanced DSA pool**: only 3 advanced problems. The backend and software-engineer plans need about 10 more (DP, intervals, graphs, heaps).
