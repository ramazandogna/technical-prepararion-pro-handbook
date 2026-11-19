# Content Authoring Guide

Contract: `src/types/content.ts`. Learner: `docs/LEARNER_PROFILE.md`. One file per track: `src/content/tracks/<trackId>.ts`
(stub already exists with id/code/title/icon/phase — keep those; fill `rationale` and `modules`; you may sharpen `summary`).

## Volume & shape per track
- 3–4 modules, **10–12 questions per track** (cs-fundamentals and system-design may go to 14).
- Priority mix ≈ 50% `must`, 35% `should`, 15% `nice` — `must` = very likely asked of a mid-level full-stack candidate.
- Difficulty mix ≈ 25% `foundation`, 50% `core`, 25% `advanced`. Learner is mid-level: foundations are quick checks, not tutorials.
- Use varied `type`s where the topic allows: `concept`, `tradeoff`, `output`, `debugging`, `coding`, `multiple-choice`,
  `system-design`, `behavioral`, `project-deep-dive`. Every technical track should have at least one `output` or `debugging`
  or `coding` question when the topic is code-shaped, and at least one `multiple-choice`.

## Each question
- `id`: permanent, kebab-case, track prefix: A `ip-`, B `cs-`, C `js-`, D `ts-`, E `fe-`, F `react-`, G `vue-`, H `next-`,
  I `be-`, J `db-`, K `os-`, L `net-`, M `arch-`, N `lang-`, O `sd-`, P `ops-`, Q `sec-`, R `test-`, S `beh-`, T `jp-`.
- `prompt`: how an interviewer would actually say it. Markdown.
- `hints`: 1–3, progressive (nudge → direction → near-giveaway). Never the answer itself.
- `answer`: Markdown model answer, **120–400 words** (coding/system-design may be longer). Lead with the direct answer,
  then the why, then an example. Use fenced code (```ts / ```js / ```sql / ```bash). Be technically precise and current
  (2025–2026: React 19, Vue 3.5, Next.js App Router, Node 22/24, PostgreSQL 16/17).
- `keyPoints`: 3–6 bullets the interviewer listens for.
- `pitfalls`: 1–4 common wrong answers. `followUps`: 1–3 likely follow-ups.
- `personalAngle` (where natural, ~40% of questions): one or two sentences tying the topic to the learner's real work —
  Efilli accessibility platform backend/infra, Docker/CI/CD over SSH, Puppeteer + Redis scraping with recovery jobs,
  enterprise SSR/SPA integrations, consent UIs, Chrome extension, REI-KIT, Hibi/Kakei/Kakehashi, Scrape & Compare.
  Phrase as advice: "Use your scraping recovery jobs as the example: …". Never invent facts about the learner.
- `references`: 0–2 **real, stable** URLs you are confident exist (MDN, react.dev, vuejs.org, nextjs.org, nodejs.org,
  postgresql.org/docs, redis.io/docs, typescriptlang.org/docs, web.dev, owasp.org, docs.nestjs.com). No guessed deep links —
  link the docs section root if unsure.
- `multiple-choice`: 3–5 `choices`, ids `a`..`e`, exactly one or more `correct`, each with a short `explanation`.
- `output` / `debugging`: put the snippet in `code`, not in the prompt.
- `estMinutes`: realistic interview time (concept 3–5, coding 15–30, system design 35–45).

## Writing in TypeScript files
- Use template literals for Markdown. **Escape backticks as \` and `${` as \${** inside them.
- Keep it valid: `npx vue-tsc --noEmit -p tsconfig.app.json` must report **no errors in your files**.
- Do not import anything except `import type { Track } from '@/types/content'`.

## Quality bar
Accurate > exhaustive. No filler, no "Great question". Each answer should be something the learner could say out loud in an
interview, plus the depth to survive the follow-up. Do not fabricate company-specific facts.
